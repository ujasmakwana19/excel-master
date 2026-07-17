import type { Grid } from "../Grid.js";

export class CellEventHandler {
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    private isCellEvent(x : number , y : number) : boolean {
        if(x > this._grid.leftHeaderWidth && y > this._grid.topHeaderHeight){
            return true;
        }
        return false;
    }

    handleCellEvent(x : number , y : number) : boolean{
        if(this.isCellEvent(x, y)){
            return false
        }
        return true
    }




}