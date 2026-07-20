import type { Grid } from "../Grid.js";
import { isRowHeader } from "../Grid/constants.js";

export class RowEventHandler {
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    private beginSelection(event : PointerEvent , row : number) {
        const selection = this._grid._selection
        selection.isSelecting = true
        
        if(event.shiftKey && selection.anchorRow != null){
            selection.focusRow = row
        }
        else{
            selection.clear()
            selection.anchorRow = row
            selection.focusRow = row
        }
        
    }

    handleRowEvent(event : PointerEvent , x : number , y : number) {
        if(!isRowHeader(x, y)){
            return;
        }

        const rowIndex = this._grid._canvasMaths.getRowAtY(y)

        if(rowIndex < 0) return;

        this.beginSelection(event, rowIndex)
    }

    handleExtendRowSelection(y : number){
        if(this._grid._selection.anchorRow == null || this._grid._selection.anchorCol != null){
            return;
        }

        const rowIndex = this._grid._canvasMaths.getRowAtY(y)
        if(rowIndex > 0)
            this._grid._selection.focusRow = rowIndex
    }

}