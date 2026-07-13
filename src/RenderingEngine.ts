import type { Grid } from "./Grid.js";
import { SelectionMode } from "./Grid/SelectionState.js";

export class RenderingEngine {
  _grid: Grid;

  // To maintain the state of current visible rows and the columns
  private _startRow: number = 0;
  private _totalX: number = 0;
  private _endRow: number = 0;
  private _startCol: number = 0;
  private _totalY: number = 0;
  private _endCol: number = 0;

  constructor(grid: Grid) {
    this._grid = grid;
  }

  // =============================================
  //  main Render
  // =============================================

  renderGrid(): void {
    // Clear the canvas
    this._grid._ctx.clearRect(0, 0, this._grid._canvas.width, this._grid._canvas.height);

    // Calculate virtualization bounds
    const { startRow, totalY, endRow } = this._grid._canvasMaths.getRowBounds();
    const { startCol, totalX, endCol } = this._grid._canvasMaths.getColBounds();

    this._startRow = startRow;
    this._totalX = totalX;
    this._endRow = endRow;
    this._startCol = startCol;
    this._totalY = totalY;
    this._endCol = endCol;

    // Take the snapshot of the current state of the canvas
    this._grid._ctx.save();

    // New state or path for the paint
    this._grid._ctx.beginPath();

    // draws the rect of canvas size
    this._grid._ctx.rect(
      this._grid.leftHeaderWidth,
      this._grid.topHeaderHeight,
      this._grid._canvas.width,
      this._grid._canvas.height,
    );

    // clip the canvas to the rect , so we can only paint in that area
    this._grid._ctx.clip();

    // Getting the startRow and excluding the row for the Headers
    const dataStartRow: number = Math.max(1, startRow);
    const dataStartCol: number = Math.max(1, startCol);

    //  Main grid render ->>>>>>>>>>>>>>>>..
    let heightSum: number = totalY;
    for (let r = dataStartRow; r <= endRow; r++) {
      // Every loop updates the width sum , so the next loop know which pixel to start the paint
      let widthSum: number = totalX;
      let currentCellHeight: number =
        this._grid._rowState.getRowHeight(r);

      for (let c = dataStartCol; c <= endCol; c++) {
        const startX = widthSum - this._grid.scrollX;
        const startY = heightSum - this._grid.scrollY;

        const currentCellWidth: number = this._grid._colState.getColWidth(c);
        
        widthSum += currentCellWidth;

        this._grid._paintEngine.drawCell(
          r,
          c,
          startX,
          startY,
          false,
          currentCellWidth,
          currentCellHeight,
        );
      }
      heightSum += currentCellHeight;
    }

    // restore the state , we save the snapshot before
    this._grid._ctx.restore();

    // Top Header Paint ->>>>>>>>>>>>
    this._grid._ctx.save();
    this._grid._ctx.beginPath();
    this._grid._ctx.rect(this._grid.leftHeaderWidth, 0, this._grid._canvas.width, this._grid.topHeaderHeight);
    this._grid._ctx.clip();

    let widthSum: number = totalX;
    for (let c = dataStartCol; c <= endCol; c++) {
      const startX = widthSum - this._grid.scrollX;
      let currentCellWidth =
        this._grid._colState.getColWidth(c);
      widthSum += currentCellWidth;

      this._grid._paintEngine.drawCell(
        0,
        c,
        startX,
        0,
        true,
        currentCellWidth,
        this._grid.topHeaderHeight,
      );
    }
    this._grid._ctx.restore();

    // Left Header Paint ->>>>>>>>>>>>>>>
    this._grid._ctx.save();
    this._grid._ctx.beginPath();
    this._grid._ctx.rect(0, this._grid.cellHeight, this._grid.leftHeaderWidth, this._grid._canvas.height);
    this._grid._ctx.clip();

    heightSum = totalY;
    for (let r = dataStartRow; r <= endRow; r++) {
      const screenY = heightSum - this._grid.scrollY;
      let currentCellHeight: number =
        this._grid._rowState.getRowHeight(r);
      heightSum += currentCellHeight;

      this._grid._paintEngine.drawCell(
        r,
        0,
        0,
        screenY,
        true,
        this._grid.leftHeaderWidth,
        currentCellHeight,
      );
    }
    this._grid._ctx.restore();

    // Top left corner rectangle
    this._grid._paintEngine.drawCell(
      0,
      0,
      0,
      0,
      true,
      this._grid.leftHeaderWidth,
      this._grid.topHeaderHeight,
    );

    this.renderSelection();
  }

  // =============================================
  //  Selection overlay
  // =============================================
// get the type of the selection
  renderSelection(): void {
    const selection = this._grid._selection;
    const dataStartRow = Math.max(1, this._startRow);
    const dataStartCol = Math.max(1, this._startCol);

    if (selection.mode === SelectionMode.COLUMN) {
      this.renderColumnSelection(dataStartCol);
    } else if (selection.mode === SelectionMode.ROW) {
      this.renderRowSelection(dataStartRow);
    } else if (selection.mode === SelectionMode.CELL) {
      this.renderCellSelection(dataStartRow, dataStartCol);
    }
  }

  private renderColumnSelection(dataStartCol: number): void {
    const colRange = this._grid._selection.colRange;
    if (colRange === null ) return;

    // start boundary  
    const visibleStart = Math.max(dataStartCol, colRange[0]);
    
    // end boundary
    const visibleEnd = Math.min(this._endCol , colRange[1]);

    // if start > end no over lapping area to show selection
    if (visibleStart > visibleEnd) return; 

    let x = this._totalX;
    for (let c = dataStartCol; c < visibleStart; c++) {
      x += this._grid._colState.getColWidth(c);
    }
    let width = 0;
    for (let c = visibleStart; c <= visibleEnd; c++) {
      width += this._grid._colState.getColWidth(c);
    }

    const screenX = x - this._grid.scrollX;
    const startY = this._grid.topHeaderHeight;

    // mark the cels area
    this._grid._paintEngine.drawSelected(screenX, startY, width, this._grid._canvas.height - startY, false);
    
    // mark the header area
    this._grid._paintEngine.drawSelected(screenX, 0, width, this._grid.topHeaderHeight, true);
  }

  private renderRowSelection(dataStartRow: number): void {
    const rowRange = this._grid._selection.rowRange;
    if (rowRange === null)  return;

    const visibleStart = Math.max(dataStartRow, rowRange[0]);
    const visibleEnd = Math.min(this._endRow, rowRange[1]);
    if (visibleStart > visibleEnd) return;

    let y = this._totalY;
    for (let r = dataStartRow; r < visibleStart; r++) {
      y += this._grid._rowState.getRowHeight(r);
    }
    let height = 0;
    for (let r = visibleStart; r <= visibleEnd; r++) {
      height += this._grid._rowState.getRowHeight(r);
    }

    const screenY = y - this._grid.scrollY;
    const startX = this._grid.leftHeaderWidth;

    this._grid._paintEngine.drawSelected(startX, screenY, this._grid._canvas.width - startX, height, false);
    this._grid._paintEngine.drawSelected(0, screenY, this._grid.leftHeaderWidth, height, true);
  }

  private renderCellSelection(dataStartRow: number, dataStartCol: number): void {
    const rowRange = this._grid._selection.rowRange;
    const colRange = this._grid._selection.colRange;

    if (rowRange === null || colRange === null) return;

    const visibleStartRow = Math.max(dataStartRow, rowRange[0]);
    const visibleEndRow = Math.min(this._endRow, rowRange[1]);

    const visibleStartCol = Math.max(dataStartCol, colRange[0]);
    const visibleEndCol = Math.min(this._endCol, colRange[1]);

    if (visibleStartRow > visibleEndRow || visibleStartCol > visibleEndCol) return;

    let x = this._totalX;
    for (let c = dataStartCol; c < visibleStartCol; c++) {
      x += this._grid._colState.getColWidth(c);
    }

    let width = 0;
    for (let c = visibleStartCol; c <= visibleEndCol; c++) {
      width += this._grid._colState.getColWidth(c);
    }

    let y = this._totalY;
    for (let r = dataStartRow; r < visibleStartRow; r++) {
      y += this._grid._rowState.getRowHeight(r);
    }

    let height = 0;
    for (let r = visibleStartRow; r <= visibleEndRow; r++) {
      height += this._grid._rowState.getRowHeight(r);
    }

    this._grid._paintEngine.drawSelected(x - this._grid.scrollX, y - this._grid.scrollY, width, height, false);
    this._grid._paintEngine.drawSelected(x - this._grid.scrollX, 0, width, this._grid.topHeaderHeight, true);
    this._grid._paintEngine.drawSelected(0, y - this._grid.scrollY, this._grid.leftHeaderWidth, height, true);
  }

  renderSingleCell(row: number, col: number): void {
    const rect = this._grid._canvasMaths.getCellRect(row, col);
    if (!rect) {
      this.renderGrid();
      return;
    }

    this._grid._ctx.save();
    this._grid._ctx.beginPath();
    this._grid._ctx.rect(
      this._grid.leftHeaderWidth,
      this._grid.topHeaderHeight,
      this._grid._canvas.width,
      this._grid._canvas.height,
    );
    this._grid._ctx.clip();

    this._grid._ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
    this._grid._paintEngine.drawCell(row, col, rect.x, rect.y, false, rect.width, rect.height);

    this._grid._ctx.restore();

    if (this._grid._selection.mode === SelectionMode.CELL && this._grid._selection.isCellSelected(row, col)) {
      this._grid._paintEngine.drawSelected(rect.x, rect.y, rect.width, rect.height, false);
    }
  }
}