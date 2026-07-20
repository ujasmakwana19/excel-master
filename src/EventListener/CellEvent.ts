import type { Grid } from "../Grid.js";

export class CellEventHandler {
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    private isCellEvent(x : number , y : number) : boolean {
        return x >= this._grid.leftHeaderWidth && y >= this._grid.topHeaderHeight;
    }

    private beginSelection(event: PointerEvent, row: number, col: number): void {
        const selection = this._grid._selection

        if (event.shiftKey && selection.anchorRow !== null && selection.anchorCol !== null) {
            selection.focusRow = row
            selection.focusCol = col
            return
        }

        selection.clear()
        selection.anchorRow = row
        selection.focusRow = row
        selection.anchorCol = col
        selection.focusCol = col
    }

    handleCellEvent(event: PointerEvent, x : number , y : number) : boolean{
        if (!this.isCellEvent(x, y)) {
            return false
        }

        const rowIndex = this._grid._canvasMaths.getRowAtY(y)
        const colIndex = this._grid._canvasMaths.getColAtX(x)

        if (rowIndex === -1 || colIndex === -1) {
            return false
        }

        this.beginSelection(event, rowIndex, colIndex)
        return true
    }
}