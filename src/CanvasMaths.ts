import { thresHoldConstants } from "./constants.js";
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
    let visibleY = totalY - this._grid.scrollY; // totalY (height in pixel) - scrolled pixel

    for (let r = startRow; r <= this._grid.rowNo; r++) {
      const rowHeight =
        this._grid._rowState._rowDataCache?.[r]?.height ??
        this._grid.cellHeight;
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
    //  column would cut down
    return { startCol, totalX: totalX + this._grid.leftHeaderWidth, endCol };
  }

  getColAtX(
    mouseX: number,
    borderClick : boolean,
  ): { colIndex: number, borderX: number,  X : number}   {

    if (mouseX < this._grid.leftHeaderWidth)
      return { colIndex: -1, borderX: -1, X : -1 };

    const { startCol, totalX, endCol } = this.getColBounds();
    console.log({ startCol, totalX, endCol });
  
    let widthTillStartCol = totalX;

    for (let c = startCol; c <= endCol; c++) {
      const colWidth =
        this._grid._colState._colDataCache?.[c]?.width ?? this._grid.cellWidth;
      const colRightScreenX = widthTillStartCol + colWidth - this._grid.scrollX;

      if(borderClick){
        if (Math.abs(mouseX - colRightScreenX) <= this.resizeHitTolerance) {
          return { colIndex: c, borderX: colRightScreenX , X : widthTillStartCol};
        }
      }
      else{
        if (
          mouseX >= (widthTillStartCol + this.selectionHitTolerance - this._grid.scrollX) &&
          mouseX <= (colRightScreenX - this.selectionHitTolerance )
        ) 
        {
          return { colIndex: c, borderX: colRightScreenX , X : widthTillStartCol};
        }
      }
      widthTillStartCol += colWidth;
    }

    return { colIndex: -1, borderX: -1 , X : -1};
  }

  getRowAtY(
    mouseY: number,
    borderClick : boolean
  ): { rowIndex: number; borderY: number } {
    // Prevent interaction if mouse is inside the top-left corner intersecting block
    if (mouseY < this._grid.topHeaderHeight)
      return { rowIndex: -1, borderY: -1 };

    const { startRow, totalY, endRow } = this.getRowBounds();

    let heightTillStartRow = totalY;

    for (let r = startRow; r <= endRow; r++) {
      const rowHeight =
        this._grid._rowState._rowDataCache?.[r]?.height ??
        this._grid.cellHeight;
      const bottomRowScreenY =
        heightTillStartRow + rowHeight - this._grid.scrollY;

      if (Math.abs(mouseY - bottomRowScreenY) <= this.resizeHitTolerance) {
        return { rowIndex: r, borderY: bottomRowScreenY };
      }

      heightTillStartRow += rowHeight;
    }
    return { rowIndex: -1, borderY: -1 };
  }
}
