import type { Grid } from "../Grid.js";

export class ColumnSelection {
  private _grid: Grid;
  
  // Track the origin column index where the selection range starts
  private _anchorCol: number | null = null;
  private _isMouseDown: boolean = false;

  constructor(grid: Grid) {
    this._grid = grid;
    this.initKeyboardEvents();
  }

  /**
   * Main Mouse Down Event Handler
   */
  selectColumn(e: MouseEvent): void {
    const rect = this._grid._canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Only initiate column selection if clicking inside the top header region
    if (mouseY <= this._grid.topHeaderHeight) {
      const { colIndex } = this._grid._canvasMaths.getColAtX(mouseX, false);
      if (colIndex === -1) return;

      this._isMouseDown = true;

      if (e.shiftKey && this._anchorCol !== null) {
        // Shift + Click: Expand range from the existing anchor
        this.selectRange(this._anchorCol, colIndex);
      } else {
        // Single Click: Establish a new anchor
        this._anchorCol = colIndex;
        this._grid._colSelected.clear();
        this._grid._colSelected.add(colIndex);
      }

      this._grid.render();

      // Listen for global dragging & mouseup transitions
      window.addEventListener("mousemove", this.handleMouseMove);
      window.addEventListener("mouseup", this.handleMouseUp);
    }
  }

  /**
   * Tracks Mouse Drag Movement across columns
   */
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this._isMouseDown || this._anchorCol === null) return;

    const rect = this._grid._canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Optional: Handle Auto-Scrolling when dragging out of canvas bounds
    if (mouseX > rect.width) {
      this._grid.scrollX += 10; // Scroll right
    } else if (mouseX < this._grid.leftHeaderWidth) {
      this._grid.scrollX = Math.max(0, this._grid.scrollX - 10); // Scroll left
    }

    const { colIndex } = this._grid._canvasMaths.getColAtX(mouseX, false);
    
    if (colIndex !== -1) {
      this.selectRange(this._anchorCol, colIndex);
      this._grid.render();
    }
  };

  /**
   * Cleans up mouse drag listeners
   */
  private handleMouseUp = (): void => {
    this._isMouseDown = false;
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
  };

  /**
   * Populates the Set with a calculated sequence from start to end
   */
  private selectRange(start: number, end: number): void {
    this._grid._colSelected.clear();
    const from = Math.min(start, end);
    const to = Math.max(start, end);

    for (let i = from; i <= to; i++) {
      this._grid._colSelected.add(i);
    }
  }

  /**
   * Bind Keyboard Listeners for Arrow Navigations
   */
  private initKeyboardEvents(): void {
    // Ensure canvas or container can capture keyboard focus (tabIndex setup)
    if (!this._grid._canvas.hasAttribute("tabindex")) {
      this._grid._canvas.setAttribute("tabindex", "0");
    }

    this._grid._canvas.addEventListener("keydown", (e: KeyboardEvent) => {
      if (this._anchorCol === null) return;

      // We need to find our current "focus" (the last active end element of the selection)
      const currentSelected = Array.from(this._grid._colSelected);
      if (currentSelected.length === 0) return;

      let currentFocus : number = currentSelected[currentSelected.length - 1];

      if (e.key === "ArrowRight") {
        e.preventDefault();
        currentFocus++;
        this.handleKeyboardSelection(currentFocus, e.shiftKey);
      } 
      else if (e.key === "ArrowLeft") {
        e.preventDefault();
        currentFocus = Math.max(1, currentFocus - 1); // Clamp to your minimum layout index
        this.handleKeyboardSelection(currentFocus, e.shiftKey);
      }
    });
  }

  /**
   * Evaluates if arrow keys expand a range or move single focus blocks
   */
  private handleKeyboardSelection(targetCol: number, isShiftPressed: boolean): void {
    if (isShiftPressed && this._anchorCol !== null) {
      this.selectRange(this._anchorCol, targetCol);
    } else {
      // Normal Arrow navigation without shift resets anchor focus
      this._anchorCol = targetCol;
      this._grid._colSelected.clear();
      this._grid._colSelected.add(targetCol);
    }

    // Automatically scroll view boundaries into focus position if necessary
    this.ensureColumnVisible(targetCol);
    this._grid.render();
  }

  /**
   * Checks if column target index is off-screen and updates scroll view bounds 
   */
  private ensureColumnVisible(colIndex: number): void {
    const { startCol, totalX, endCol } = this._grid._canvasMaths.getColBounds();
    
    // Simple implementation: calculation hook relative to structural bounds
    let widthTillCol = totalX;
    for (let c = startCol; c < colIndex; c++) {
      widthTillCol += this._grid._colState._colDataCache?.[c]?.width ?? this._grid.cellWidth;
    }
    
    const targetWidth = this._grid._colState._colDataCache?.[colIndex]?.width ?? this._grid.cellWidth;
    const viewRightEdge = this._grid.scrollX + (this._grid._canvas.width - this._grid.leftHeaderWidth);

    if (widthTillCol < this._grid.scrollX) {
      // Scroll left to reveal
      this._grid.scrollX = widthTillCol;
    } else if (widthTillCol + targetWidth > viewRightEdge) {
      // Scroll right to reveal
      this._grid.scrollX = widthTillCol + targetWidth - (this._grid._canvas.width - this._grid.leftHeaderWidth);
    }
  }
}