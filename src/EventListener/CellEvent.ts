import type { Grid } from "../Grid.js";
import { isCellBody } from "../Grid/constants.js";

export class CellEventHandler {
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    private beginSelection(event: PointerEvent, row: number, col: number): void {
        const selection = this._grid._selection
        selection.isSelecting = true

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
    
    handleCellEvent(event: PointerEvent, x : number , y : number) {
        if (!isCellBody(x, y)) {
            return;
        }
        
        const rowIndex = this._grid._canvasMaths.getRowAtY(y)
        const colIndex = this._grid._canvasMaths.getColAtX(x)
        
        if (rowIndex === -1 || colIndex === -1) {
            return;
        }
        
        this.beginSelection(event, rowIndex, colIndex)
    }
    
    handleExtendCellSelection(x : number, y : number){
        
        const colIndex = this._grid._canvasMaths.getColAtX(x)
        const rowIndex = this._grid._canvasMaths.getRowAtY(y)
        
        if (rowIndex === -1 || colIndex === -1) {
            return ;
        }
        this._grid._selection.focusCol = colIndex
        this._grid._selection.focusRow = rowIndex
    }
}