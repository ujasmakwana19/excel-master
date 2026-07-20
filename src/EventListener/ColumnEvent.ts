import type { Grid } from "../Grid.js";
import { isColumnHeader } from "../Grid/constants.js";

export class ColumnEventHandler {
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    private beginSelection(event : PointerEvent , column : number) {
        const selection = this._grid._selection
        selection.isSelecting = true
        
        if(event.shiftKey && selection.anchorCol != null){
            selection.focusCol = column
        }
        else{
            selection.clear()
            selection.anchorCol = column
            selection.focusCol = column
        }
        
    }

    handleColumnEvent(event : PointerEvent , x : number , y : number){
        if(!isColumnHeader(x, y)){
            return; 
        }
        const colIndex = this._grid._canvasMaths.getColAtX(x)

        if(colIndex < 0)  return ;

        this.beginSelection(event, colIndex)
    }

    handleExtendColumnSelection(x : number){
        if(this._grid._selection.anchorCol == null || this._grid._selection.anchorRow != null){
            return;
        }

        const colIndex = this._grid._canvasMaths.getColAtX(x)
        if(colIndex > 0)
            this._grid._selection.focusCol = colIndex
    }

}