import type { Grid } from "../Grid.js";

export class ColumnEventHandler {
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    private isColumnEvent(x : number , y : number) : boolean {
        if(x >= this._grid.leftHeaderWidth && y <= this._grid.topHeaderHeight){
            return true;
        }
        return false;
    }

    private beginSelection(event : PointerEvent , column : number) {
        const selection = this._grid._selection
        
        if(event.shiftKey && selection.anchorCol != null){
            selection.focusCol = column
        }
        else{
            selection.clear()
            selection.anchorCol = column
            selection.focusCol = column
        }
        
    }

    handleColumnEvent(event : PointerEvent , x : number , y : number) : boolean{
        if(!this.isColumnEvent(x, y)){
            return false
        }
        const colIndex = this._grid._canvasMaths.getColAtX(x)

        if(colIndex < 0)  return false;

        this.beginSelection(event, colIndex)
        return true
    }
}