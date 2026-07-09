import type { Grid } from "./Grid.js";


export class CanvasMaths {
  _grid: Grid;

  constructor(grid: Grid) {
    this._grid = grid;
  }

  // ==========================================
  // Helper Methods
  // ==========================================
  // To calculate the dynamic value of the startRow, endRow such that the change in the size ,
  // of the row is taken in account

  getRowBounds() {
    // total pixel from the top
    let totalY: number = 0;

    let startRow: number = 1;
    let endRow: number = 1;

    for (let r = 1; r <= this._grid.rowNo; r++) {
      // get the custom height
      const rowHeight =
        this._grid._rowState.getData?.[r]?.height ?? this._grid.cellHeight;

      // If the bottom of this row is past our scroll position, this is our start row
      if (totalY + rowHeight > this._grid.scrollY) {
        startRow = r;
        break;
      }

      // add the height
      totalY += rowHeight;
    }

    // To calculate the end Row
    let visibleY = totalY - this._grid.scrollY; // totalY (heiht in pixel) - scrolled pixel

    for (let r = startRow; r <= this._grid.rowNo; r++) {
      const rowHeight =
        this._grid._rowState._rowDataCache?.[r]?.height ?? this._grid.cellHeight;
      visibleY += rowHeight;
      endRow = r;

      if (visibleY >= this._grid._canvas.height) {
        endRow = Math.min(this._grid.rowNo, endRow + 1);
        break;
      }
    }

    return { startRow, totalY: totalY + this._grid.topHeaderHeight, endRow };
  }

  // To calculate the dynamic value of the startCol, endCol such that the change in the size ,
  // of the Col is taken in account
  getColBounds() {
    // Total pixel from the left
    let totalX = 0;

    let startCol = 1;
    let endCol = 1;

    for (let c = 1; c <= this._grid.columnNo; c++) {
      // get the custom width
      const colWidth =
        this._grid._colState._colDataCache?.[c]?.width ?? this._grid.cellWidth;

      // If the left of this col is past our scroll position, this is our start col
      if (totalX + colWidth > this._grid.scrollX) {
        startCol = c;
        break;
      }

      totalX += colWidth;
    }

    let visibleX = totalX - this._grid.scrollX;
    for (let c = startCol; c <= this._grid.columnNo; c++) {
      const colWidth =
        this._grid._colState._colDataCache?.[c]?.width ?? this._grid.cellWidth;
      visibleX += colWidth;
      endCol = c;

      if (visibleX >= this._grid._canvas.width) {
        endCol = Math.min(this._grid.columnNo, endCol + 1);
        break;
      }
    }

    // we do this cause , if its init , then the size of the Header to add otherwise the
    //  column column would cut down
    return { startCol, totalX: totalX + this._grid.leftHeaderWidth, endCol };
  }

  getColAtX(
      mouseX: number,
      resizeHitTolerance : number
    ): { colIndex: number; borderX: number } {
      // Prevent interaction if mouse is inside the top-left corner intersecting block
      if (mouseX < this._grid.leftHeaderWidth) return { colIndex: -1, borderX: -1 };
  
      const { startCol, totalX, endCol } = this.getColBounds();
      
      let widthTillStartCol = totalX;
  
      for (let c = startCol; c <= endCol; c++) {
        const colWidth = this._grid._colState._colDataCache?.[c]?.width ?? this._grid.cellWidth;
        const colRightScreenX = widthTillStartCol + colWidth - this._grid.scrollX;
  
        if (Math.abs(mouseX - colRightScreenX) <= resizeHitTolerance) {
          return { colIndex: c, borderX: colRightScreenX };
        }
        widthTillStartCol += colWidth;
      }
  
      return { colIndex: -1, borderX: -1 };
    }
  
  getRowAtY(
      mouseY: number,
      resizeHitTolerance : number
    ): { rowIndex: number; borderY: number } {
      // Prevent interaction if mouse is inside the top-left corner intersecting block
      if (mouseY < this._grid.topHeaderHeight) return { rowIndex: -1, borderY: -1 };
  
      const { startRow, totalY, endRow } = this.getRowBounds();
  
      let heightTillStartRow = totalY;
  
      for (let r = startRow; r <= endRow; r++) {
        const rowHeight = this._grid._rowState._rowDataCache?.[r]?.height ?? this._grid.cellHeight;
        const bottomRowScreenY = heightTillStartRow + rowHeight - this._grid.scrollY;
  
        if (Math.abs(mouseY - bottomRowScreenY) <= resizeHitTolerance) {
          return { rowIndex: r, borderY: bottomRowScreenY };
        }
  
        heightTillStartRow += rowHeight;
      }
      return { rowIndex: -1, borderY: -1 };
    }
}
