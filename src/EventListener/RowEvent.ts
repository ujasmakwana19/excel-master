import type { Grid } from "../Grid.js";

export class RowEventHandler {
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    private isRowEvent(x : number , y : number) : boolean {
        if(x <= this._grid.leftHeaderWidth && y >= this._grid.topHeaderHeight){
            return true;
        }
        return false;
    }

    private beginSelection(event : PointerEvent , row : number) {
        const selection = this._grid._selection
        
        if(event.shiftKey && selection.anchorRow != null){
            selection.focusRow = row
        }
        else{
            selection.clear()
            selection.anchorRow = row
            selection.focusRow = row
        }
        
    }

    handleRowEvent(event : PointerEvent , x : number , y : number) : boolean{
        if(!this.isRowEvent(x, y)){
            return false
        }

        const rowIndex = this._grid._canvasMaths.getRowAtY(y)

        if(rowIndex < 0) return false

        this.beginSelection(event, rowIndex)


        return true
    }




}