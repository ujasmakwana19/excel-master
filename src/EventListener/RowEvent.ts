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

    handleRowEvent(x : number , y : number) : boolean{
        if(this.isRowEvent(x, y)){
            return false
        }
        return true
    }




}