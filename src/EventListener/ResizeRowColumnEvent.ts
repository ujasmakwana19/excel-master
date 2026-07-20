import { thresHoldConstants } from "../Grid/constants.js";
import type { Grid } from "../Grid.js";

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

  tryStartResize(event: MouseEvent, mouseX: number, mouseY: number): boolean {
    if (mouseY <= this._grid.topHeaderHeight) {
      const colIndex = this._grid._canvasMaths.getBorderAtX(mouseX);
      if (colIndex !== -1) {
        this.isResizing = true;
        this.resizeColIndex = colIndex;
        this.resizeStartX = event.clientX;
        this.resizeStartWidth = this._grid._colState.getColWidth(colIndex);
        event.preventDefault();
        return true;
      }
    }

    if (mouseX <= this._grid.leftHeaderWidth) {
      const rowIndex = this._grid._canvasMaths.getBorderAtY(mouseY);
      if (rowIndex !== -1) {
        this.isResizing = true;
        this.resizeRowIndex = rowIndex;
        this.resizeStartY = event.clientY;
        this.resizeStartHeight = this._grid._rowState.getRowHeight(rowIndex);
        event.preventDefault();
        return true;
      }
    }

    return false;
  }

  applyResize(event: MouseEvent): boolean {
    if (!this.isResizing) return false;

    if (this.resizeColIndex !== -1) {
      const deltaX = event.clientX - this.resizeStartX;
      const newWidth = Math.max(this.minWidth, this.resizeStartWidth + deltaX);
      this._grid._colState.setProperties(this.resizeColIndex, newWidth);
      return true;
    }

    if (this.resizeRowIndex !== -1) {
      const deltaY = event.clientY - this.resizeStartY;
      const newHeight = Math.max(this.minHeight, this.resizeStartHeight + deltaY);
      this._grid._rowState.setProperties(this.resizeRowIndex, newHeight);
      return true;
    }

    return false;
  }

  updateCursor(canvas: HTMLCanvasElement, mouseX: number, mouseY: number): void {
    if (mouseY <= this._grid.topHeaderHeight && this._grid._canvasMaths.getBorderAtX(mouseX) !== -1) {
      canvas.style.cursor = "col-resize";
      return;
    }

    if (mouseX <= this._grid.leftHeaderWidth && this._grid._canvasMaths.getBorderAtY(mouseY) !== -1) {
      canvas.style.cursor = "row-resize";
      return;
    }

    canvas.style.cursor = "default";
  }

  stopResize(): void {
    this.isResizing = false;
    this.resizeColIndex = -1;
    this.resizeRowIndex = -1;
  }
}