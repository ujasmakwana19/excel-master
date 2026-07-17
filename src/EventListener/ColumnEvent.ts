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

    private beginSelection(event : PointerEvent , x : number) {
        // const selection = this._grid._selection
        // const isShiftPressed
    }

    handleColumnEvent(event : PointerEvent , x : number , y : number) : boolean{
        if(this.isColumnEvent(x, y)){
            return false
        }
        console.log(event.ctrlKey + "hhhhh");
        
        const {colIndex  , isborderX } = this._grid._canvasMaths.getColAtX(x)

        // Resizing Event
        if(isborderX){

        }
        // Selection Event
        else{

        }


        return true
    }
}