import type { Grid } from "../Grid.js";
import { SelectionMode } from "../Grid/SelectionState.js";
import { AutoScroll } from "./AutoScroll.js";

const EDGE_SCROLL_SPEED = 12;

export class SelectionManager {
  private readonly _grid: Grid;
  private _isDragging = false;
  private readonly _autoScroll: AutoScroll;

  constructor(grid: Grid) {
    this._grid = grid;
    this._autoScroll = new AutoScroll((dx, dy) => this.scrollBy(dx, dy));
    this.initKeyboardEvents();
  }

  // ==========================================
  // Mouse Down — start a selection
  // ==========================================
  handleMouseDown(e: MouseEvent): void {
    this._grid._canvas.focus();

    const { mouseX, mouseY } = this.getMouseCoords(e);

    const inTopHeader = mouseY <= this._grid.topHeaderHeight && mouseX > this._grid.leftHeaderWidth;
    const inLeftHeader = mouseX <= this._grid.leftHeaderWidth && mouseY > this._grid.topHeaderHeight;
    const inBody = mouseX > this._grid.leftHeaderWidth && mouseY > this._grid.topHeaderHeight;

    if (inTopHeader) {
      const { colIndex } = this._grid._canvasMaths.getColAtX(mouseX, false);
      if (colIndex === -1) return;
      this.beginSelection(SelectionMode.COLUMN, e.shiftKey, undefined, colIndex);

    } else if (inLeftHeader) {
      const { rowIndex } = this._grid._canvasMaths.getRowAtY(mouseY, false);
      if (rowIndex === -1) return;
      this.beginSelection(SelectionMode.ROW, e.shiftKey, rowIndex, undefined);

    } else if (inBody) {
      const { colIndex } = this._grid._canvasMaths.getColAtX(mouseX, false);
      const { rowIndex } = this._grid._canvasMaths.getRowAtY(mouseY, false);
      if (colIndex === -1 || rowIndex === -1) return;
      this.beginSelection(SelectionMode.CELL, e.shiftKey, rowIndex, colIndex);

    } else {
      return;
    }

    this._isDragging = true;
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("mouseup", this.handleMouseUp);

    this._grid.render();
    this.notifyChange();
  }

  private beginSelection(mode: SelectionMode, extend: boolean, row?: number, col?: number): void {
    const sel = this._grid._selection;

    if (extend && sel.mode === mode) {
      // Shift+click: keep the existing anchor, move only the focus end.
      if (row !== undefined) sel.focusRow = row;
      if (col !== undefined) sel.focusCol = col;
    } else {
      sel.mode = mode;
      if (row !== undefined) {
        sel.anchorRow = row;
        sel.focusRow = row;
      }
      if (col !== undefined) {
        sel.anchorCol = col;
        sel.focusCol = col;
      }
    }
  }

  // ==========================================
  // Mouse Move — drag to extend selection
  // ==========================================
  private handleMouseMove = (e: MouseEvent): void => {
    if (!this._isDragging) return;

    const { mouseX, mouseY } = this.getMouseCoords(e);
    const mode = this._grid._selection.mode;

    let dx = 0;
    let dy = 0;
    if (mode !== SelectionMode.ROW) {
      if (mouseX > this._grid._canvas.width) dx = EDGE_SCROLL_SPEED;
      else if (mouseX < this._grid.leftHeaderWidth) dx = -EDGE_SCROLL_SPEED;
    }
    if (mode !== SelectionMode.COLUMN) {
      if (mouseY > this._grid._canvas.height) dy = EDGE_SCROLL_SPEED;
      else if (mouseY < this._grid.topHeaderHeight) dy = -EDGE_SCROLL_SPEED;
    }
    this._autoScroll.update(dx, dy);

    this.extendToPoint(mouseX, mouseY);
  };

  private extendToPoint(mouseX: number, mouseY: number): void {
    const sel = this._grid._selection;

    // Clamp the hit-test point into the body so a drag past the edge still
    // resolves to the last real row/col (the AutoScroll ticker handles
    // actually moving the viewport).
    const clampedX = Math.min(Math.max(mouseX, this._grid.leftHeaderWidth), this._grid._canvas.width - 1);
    const clampedY = Math.min(Math.max(mouseY, this._grid.topHeaderHeight), this._grid._canvas.height - 1);

    if (sel.mode === SelectionMode.COLUMN) {
      const { colIndex } = this._grid._canvasMaths.getColAtX(clampedX, false);
      if (colIndex !== -1) sel.focusCol = colIndex;
    } else if (sel.mode === SelectionMode.ROW) {
      const { rowIndex } = this._grid._canvasMaths.getRowAtY(clampedY, false);
      if (rowIndex !== -1) sel.focusRow = rowIndex;
    } else if (sel.mode === SelectionMode.CELL) {
      const { colIndex } = this._grid._canvasMaths.getColAtX(clampedX, false);
      const { rowIndex } = this._grid._canvasMaths.getRowAtY(clampedY, false);
      if (colIndex !== -1) sel.focusCol = colIndex;
      if (rowIndex !== -1) sel.focusRow = rowIndex;
    }

    this._grid.render();
    this.notifyChange();
  }

  private scrollBy(dx: number, dy: number): void {
    const maxScrollX = Math.max(0, this._grid.totalWidth - this._grid._canvas.width);
    const maxScrollY = Math.max(0, this._grid.totalHeight - this._grid._canvas.height);

    this._grid.scrollX = Math.min(Math.max(0, this._grid.scrollX + dx), maxScrollX);
    this._grid.scrollY = Math.min(Math.max(0, this._grid.scrollY + dy), maxScrollY);

    this._grid.render();
  }

  private handleMouseUp = (): void => {
    this._isDragging = false;
    this._autoScroll.stop();
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("mouseup", this.handleMouseUp);
  };

  // ==========================================
  // Keyboard — shift+arrow range extension
  // ==========================================
  private initKeyboardEvents(): void {
    if (!this._grid._canvas.hasAttribute("tabindex")) {
      this._grid._canvas.setAttribute("tabindex", "0");
    }

    this._grid._canvas.addEventListener("keydown", (e: KeyboardEvent) => {
      const sel = this._grid._selection;

      if (e.key === "Escape") {
        sel.clear();
        this._grid.render();
        this.notifyChange();
        return;
      }

      if (sel.mode === SelectionMode.NONE) return;

      const arrowMap: Record<string, [number, number]> = {
        ArrowRight: [0, 1],
        ArrowLeft: [0, -1],
        ArrowDown: [1, 0],
        ArrowUp: [-1, 0],
      };
      const delta = arrowMap[e.key];
      if (!delta) return;
      e.preventDefault();

      const [dRow, dCol] = delta;

      if (sel.mode === SelectionMode.COLUMN && dCol !== 0) {
        const base = e.shiftKey ? sel.focusCol! : sel.anchorCol!;
        const target = Math.max(1, Math.min(this._grid.columnNo, base + dCol));
        this.moveSelection(e.shiftKey, undefined, target);
        this.ensureColVisible(target);
      } else if (sel.mode === SelectionMode.ROW && dRow !== 0) {
        const base = e.shiftKey ? sel.focusRow! : sel.anchorRow!;
        const target = Math.max(1, Math.min(this._grid.rowNo, base + dRow));
        this.moveSelection(e.shiftKey, target, undefined);
        this.ensureRowVisible(target);
      } else if (sel.mode === SelectionMode.CELL) {
        const baseRow = e.shiftKey ? sel.focusRow! : sel.anchorRow!;
        const baseCol = e.shiftKey ? sel.focusCol! : sel.anchorCol!;
        const targetRow = Math.max(1, Math.min(this._grid.rowNo, baseRow + dRow));
        const targetCol = Math.max(1, Math.min(this._grid.columnNo, baseCol + dCol));
        this.moveSelection(e.shiftKey, targetRow, targetCol);
        this.ensureRowVisible(targetRow);
        this.ensureColVisible(targetCol);
      }

      this._grid.render();
      this.notifyChange();
    });
  }

  private moveSelection(extend: boolean, row?: number, col?: number): void {
    const sel = this._grid._selection;
    if (extend) {
      if (row !== undefined) sel.focusRow = row;
      if (col !== undefined) sel.focusCol = col;
    } else {
      if (row !== undefined) {
        sel.anchorRow = row;
        sel.focusRow = row;
      }
      if (col !== undefined) {
        sel.anchorCol = col;
        sel.focusCol = col;
      }
    }
  }

  // ==========================================
  // Visibility helpers (scroll the target into view)
  // ==========================================
  // Both walk only the *sparse* custom-size cache rather than looping from
  // row/col 1 up to the target — so jumping to row 90,000 with the keyboard
  // is O(number of resized rows), not O(90,000).
  private widthUpToCol(colIndex: number): number {
    let customSum = 0;
    let customCount = 0;
    for (const key in this._grid._colState._colDataCache) {
      const c = Number(key);
      if (c < colIndex) {
        customSum += this._grid._colState._colDataCache[c]!.width;
        customCount++;
      }
    }
    const defaultCols = colIndex - 1 - customCount;
    return this._grid.leftHeaderWidth + customSum + defaultCols * this._grid.cellWidth;
  }

  private heightUpToRow(rowIndex: number): number {
    let customSum = 0;
    let customCount = 0;
    for (const key in this._grid._rowState._rowDataCache) {
      const r = Number(key);
      if (r < rowIndex) {
        customSum += this._grid._rowState._rowDataCache[r]!.height;
        customCount++;
      }
    }
    const defaultRows = rowIndex - 1 - customCount;
    return this._grid.topHeaderHeight + customSum + defaultRows * this._grid.cellHeight;
  }

  private ensureColVisible(colIndex: number): void {
    const x = this.widthUpToCol(colIndex) - this._grid.leftHeaderWidth;
    const colWidth = this._grid._colState._colDataCache?.[colIndex]?.width ?? this._grid.cellWidth;
    const viewWidth = this._grid._canvas.width - this._grid.leftHeaderWidth;

    if (x < this._grid.scrollX) {
      this._grid.scrollX = x;
    } else if (x + colWidth > this._grid.scrollX + viewWidth) {
      this._grid.scrollX = x + colWidth - viewWidth;
    }
  }

  private ensureRowVisible(rowIndex: number): void {
    const y = this.heightUpToRow(rowIndex) - this._grid.topHeaderHeight;
    const rowHeight = this._grid._rowState._rowDataCache?.[rowIndex]?.height ?? this._grid.cellHeight;
    const viewHeight = this._grid._canvas.height - this._grid.topHeaderHeight;

    if (y < this._grid.scrollY) {
      this._grid.scrollY = y;
    } else if (y + rowHeight > this._grid.scrollY + viewHeight) {
      this._grid.scrollY = y + rowHeight - viewHeight;
    }
  }

  private getMouseCoords(e: MouseEvent): { mouseX: number; mouseY: number } {
    const rect = this._grid._canvas.getBoundingClientRect();
    return { mouseX: e.clientX - rect.left, mouseY: e.clientY - rect.top };
  }

  private notifyChange(): void {
    this._grid.onSelectionChange?.();
  }
}