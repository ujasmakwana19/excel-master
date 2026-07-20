import { thresHoldConstants } from "./Grid/constants.js";
import type { Grid } from "./Grid.js";

export class CanvasMaths {
  _grid: Grid;

  private readonly resizeHitTolerance: number = thresHoldConstants.resizeHitTolerance;
  private readonly selectionHitTolerance: number = thresHoldConstants.selectionHitTolerance;

  constructor(grid: Grid) {
    this._grid = grid;
  }

  // ==========================================
  // Helper Methods
  // ==========================================
  // To calculate the dynamic value of the startRow, endRow such that the change in the size ,
  // of the row is taken in account
  // totalY is the total height from the top till startRow

  getRowBounds() {
    // total pixel from the top
    let totalY: number = 0;

    let startRow: number = 1;
    let endRow: number = 1;

    for (let r = 1; r <= this._grid.rowNo; r++) {
      // get the custom height
      const rowHeight =
        this._grid._rowState.getRowHeight(r) 

      // If the bottom of this row is past our scroll position, this is our start row
      if (totalY + rowHeight > this._grid.scrollY) {
        startRow = r;
        break;
      }

      // add the height
      totalY += rowHeight;
    }

    // To calculate the end Row
    let visibleY: number = totalY - this._grid.scrollY; // totalY (height in pixel) - scrolled pixel

    for (let r = startRow; r <= this._grid.rowNo; r++) {
      const rowHeight =
        this._grid._rowState.getRowHeight(r);
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
  // totalX is the total width from the left till first col
  getColBounds() {
    // Total pixel from the left
    let totalX = 0;

    let startCol = 1;
    let endCol = 1;

    for (let c = 1; c <= this._grid.columnNo; c++) {
      // get the custom width
      const colWidth =
        this._grid._colState.getColWidth(c);

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
        this._grid._colState.getColWidth(c);
      visibleX += colWidth;
      endCol = c;

      if (visibleX >= this._grid._canvas.width) {
        endCol = Math.min(this._grid.columnNo, endCol + 1);
        break;
      }
    }

    // we do this cause , if its init , then the size of the Header to add otherwise the
    //  column would cut down
    return { startCol, totalX: totalX + this._grid.leftHeaderWidth, endCol };
  }

  getColAtX(
    XCoordinate: number
  ): number {
    
    const { startCol, totalX, endCol } = this.getColBounds();

    let widthTillStartCol = totalX;

    for (let c = startCol; c <= endCol; c++) {
      const colWidth = this._grid._colState.getColWidth(c);
      const colLeftScreenX = widthTillStartCol - this._grid.scrollX;
      const colRightScreenX = widthTillStartCol + colWidth - this._grid.scrollX;

      if (
        XCoordinate >= colLeftScreenX + this.selectionHitTolerance &&
        XCoordinate <= colRightScreenX - this.selectionHitTolerance
      ) {
        return c;
      }

      widthTillStartCol += colWidth;
    }

    return -1
  }

  getBorderAtX(
    XCoordinate: number
  ): number {
    
    const { startCol, totalX, endCol } = this.getColBounds();

    let widthTillStartCol = totalX;

    for (let c = startCol; c <= endCol; c++) {
      const colWidth = this._grid._colState.getColWidth(c);
      const colRightScreenX = widthTillStartCol + colWidth - this._grid.scrollX;

      if (Math.abs(XCoordinate - colRightScreenX) <= this.resizeHitTolerance) {
        return c;
      }
      widthTillStartCol += colWidth;
    }
    return -1;
  }

  getRowAtY(
    YCoordinate: number,
  ): number {
    const { startRow, totalY, endRow } = this.getRowBounds();

    let heightTillStartRow = totalY;

    for (let r = startRow; r <= endRow; r++) {
      const rowHeight = this._grid._rowState.getRowHeight(r);
      const bottomTopScreenY = heightTillStartRow - this._grid.scrollY;
      const bottomRowScreenY = heightTillStartRow + rowHeight - this._grid.scrollY;
      if (
        YCoordinate >= bottomTopScreenY + this.selectionHitTolerance  &&
        YCoordinate <= bottomRowScreenY - this.selectionHitTolerance
      ) {
        return r;
      }
      heightTillStartRow += rowHeight;
    }
    return -1;
  }

  getBorderAtY(
    YCoordinate: number,
  ): number {
    const { startRow, totalY, endRow } = this.getRowBounds();

    let heightTillStartRow = totalY;

    for (let r = startRow; r <= endRow; r++) {
      const rowHeight = this._grid._rowState.getRowHeight(r);
      const bottomRowScreenY = heightTillStartRow + rowHeight - this._grid.scrollY;
      if (Math.abs(YCoordinate - bottomRowScreenY) <= this.resizeHitTolerance) {
        return r;
      } 
      heightTillStartRow += rowHeight;
    }
    return -1;
  }

  getCellRect(
    row: number,
    col: number,
  ): { x: number; y: number; width: number; height: number } | null {
    const { startCol, totalX } = this.getColBounds();
    const { startRow, totalY } = this.getRowBounds();

    if (col < startCol || row < startRow) return null;

    let x = totalX;
    for (let c = startCol; c < col; c++) {
      x += this._grid._colState.getColWidth(c);
    }
    const width = this._grid._colState.getColWidth(col);

    let y = totalY;
    for (let r = startRow; r < row; r++) {
      y += this._grid._rowState.getRowHeight(r);
    }
    const height = this._grid._rowState.getRowHeight(row);

    return {
      x: x - this._grid.scrollX,
      y: y - this._grid.scrollY,
      width,
      height,
    };
  }
}