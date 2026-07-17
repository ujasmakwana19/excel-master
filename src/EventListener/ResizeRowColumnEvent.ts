import { thresHoldConstants } from "../Grid/constants.js";
import type { Grid } from "../Grid.js";
import type { RenderingEngine } from "../RenderingEngine.js";

export class ResizeRowColumnEvent {
  _grid : Grid
  isResizing: boolean = false;

  private resizeColIndex: number = -1;
  private resizeStartX: number = 0;
  private resizeStartWidth: number = 0;

  private resizeRowIndex: number = -1;
  private resizeStartY: number = 0;
  private resizeStartHeight: number = 0;

  
  private readonly minWidth: number = thresHoldConstants.minWidth;
  private readonly minHeight: number = thresHoldConstants.minHeight;

  constructor(grid : Grid){
    this._grid = grid
  }
  

  handleMouseDown(
    event: MouseEvent,
  ) {
    const rect = this._grid._canvas.getBoundingClientRect();

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;


    if (mouseY <= this._grid.topHeaderHeight) {
      
      // Col Resizing Interaction
      const { colIndex } = this._grid._canvasMaths.getColAtX(mouseX);

      if (colIndex !== -1) {
        this.isResizing = true;
        this.resizeColIndex = colIndex;
        this.resizeStartX = event.clientX;
        this.resizeStartWidth = this._grid._colState.getColWidth(colIndex);

        event.preventDefault();
        return; // Early return to avoid cross-triggers
      }
    }

    // Row Resizing Interaction
    if (mouseX <= this._grid.leftHeaderWidth) {
      const { rowIndex } = this._grid._canvasMaths.getRowAtY(mouseY, true);

      if (rowIndex !== -1) {
        this.isResizing = true;
        this.resizeRowIndex = rowIndex;
        this.resizeStartY = event.clientY;
        this.resizeStartHeight = this._grid._rowState.getRowHeight(rowIndex)
        event.preventDefault();
      }
    
    }
  }

  handleMouseMove(
    _canvas: HTMLCanvasElement,
    _grid: Grid,
    _renderingEngine: RenderingEngine,
    event: MouseEvent
  ) {

    if (this.isResizing) {
      if (this.resizeColIndex !== -1) {
        const deltaX = event.clientX - this.resizeStartX;
        const newWidth = Math.max(this.minWidth, this.resizeStartWidth + deltaX);
        _grid._colState.setProperties(this.resizeColIndex, newWidth);
        _grid.render();

      } else if (this.resizeRowIndex !== -1) {
        const deltaY = event.clientY - this.resizeStartY;
        const newHeight = Math.max(this.minHeight, this.resizeStartHeight + deltaY);
        _grid._rowState.setProperties(this.resizeRowIndex, newHeight);
        _grid.render();
      }
      return; 
    }

    // Hover State (cursor styling)
    const rect = _canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Check columns first (Top Header Zone)
    if (mouseY <= _grid.topHeaderHeight) {
      const { colIndex } = this._grid._canvasMaths.getColAtX(mouseX);
      if (colIndex !== -1) {
        _canvas.style.cursor = "col-resize";
        return;
      }
    }

    // Check rows second (Left Header Zone) 
    if (mouseX <= _grid.leftHeaderWidth) { 
      const { rowIndex } = this._grid._canvasMaths.getRowAtY(mouseY, true);
      if (rowIndex !== -1) {
        _canvas.style.cursor = "row-resize";
        return;
      }
    } 

    // Fallback default
    _canvas.style.cursor = "default";
  }

  handleMouseUp() {
    if (this.isResizing) {
      this.isResizing = false;
      this.resizeColIndex = -1;
      this.resizeRowIndex = -1;
    }
  }
}