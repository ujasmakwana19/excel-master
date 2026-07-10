import type { Grid } from "./Grid.js";

export class RenderingEngine {
  _grid : Grid
  _startRow : number = 0
  _totalX : number = 0
  _endRow : number = 0
  _startCol : number = 0
  _totalY : number = 0
  _endCol : number = 0


  constructor(
    grid : Grid
  ) {
    this._grid = grid
  }

  // =============================================
  //  main Render
  // =============================================

  renderGrid() : void {
    // Clear the canvas
    this._grid._ctx.clearRect(0, 0, this._grid._canvas.width, this._grid._canvas.height);

    // Calculate virtualization bounds
    const { startRow, totalY, endRow } = this._grid._canvasMaths.getRowBounds();
    const { startCol, totalX, endCol } = this._grid._canvasMaths.getColBounds();

    // console.log({ startRow, totalY, endRow });
    // console.log({ startCol, totalX, endCol });
    this._startRow = startRow
    this._totalX = totalX
    this._endRow = endRow
    this._startCol = startCol
    this._totalY = totalY
    this._endCol = endCol

    // Take the snapshot of the current state of the canvas
    this._grid._ctx.save();

    // New state or path for the paint
    this._grid._ctx.beginPath();

    // draws the rect of canvas size, so we can only paint in that area
    this._grid._ctx.rect(
      this._grid.leftHeaderWidth,
      this._grid.topHeaderHeight,
      this._grid._canvas.width,
      this._grid._canvas.height,
    );

    this._grid._ctx.clip();

    // Getting the startRow and excluding the row for the Headers
    const dataStartRow: number = Math.max(1, startRow);
    const dataStartCol: number = Math.max(1, startCol);

    //  Main grid render ->>>>>>>>>>>>>>>>..
    let heightSum: number = totalY;
    for (let r = dataStartRow; r < endRow; r++) {
      // Every loop updates the width sum , so the next loop know which pixel to start the paint
      let widthSum: number = totalX;
      let currentCellHeight: number =
        this._grid._rowState._rowDataCache?.[r]?.height ?? this._grid.cellHeight;

      for (let c = dataStartCol; c < endCol; c++) {
        const startX = widthSum - this._grid.scrollX;
        const startY = heightSum - this._grid.scrollY;

        let currentCellWidth: number =
          this._grid._colState._colDataCache?.[c]?.width ?? this._grid.cellWidth;
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
    for (let c = dataStartCol; c < endCol; c++) {
      const startX = widthSum - this._grid.scrollX;
      let currentCellWidth =
        this._grid._colState._colDataCache?.[c]?.width ?? this._grid.cellWidth;
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
    for (let r = dataStartRow; r < endRow; r++) {
      const screenY = heightSum - this._grid.scrollY;
      let currentCellHeight: number =
        this._grid._rowState._rowDataCache?.[r]?.height ?? this._grid.cellHeight;
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

    this.renderSelectedColumn()
  }

  renderSelectedColumn(): void {
    const dataStartCol: number = Math.max(1, this._startCol);
    const canvasHeight = this._grid._canvas.height;
    const startY = this._grid.topHeaderHeight; 
    const selectionHeight = canvasHeight - startY;

    let widthSum = this._totalX;

    for (let c = dataStartCol; c <= this._endCol; c++) {
      const currentCellWidth = this._grid._colState._colDataCache?.[c]?.width ?? this._grid.cellWidth;
      
      if (this._grid._colSelected.has(c)) {
        const startX = widthSum - this._grid.scrollX;

        if (startX + currentCellWidth > this._grid.leftHeaderWidth && startX < this._grid._canvas.width) {
          
          this._grid._paintEngine.drawSelected(
            startX,
            startY,
            currentCellWidth,
            selectionHeight,
          );
        }
      }
      widthSum += currentCellWidth; 
   }
  }
}
