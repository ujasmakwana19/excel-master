import type { Grid } from "../Grid.js";
import { isColumnHeader, thresHoldConstants } from "../GridUtils/constants.js";
import type { PointerEventInterface } from "./PointerEventInterface.js";

export class ResizeColumnEvent implements PointerEventInterface{

    private _grid : Grid

    private _preSize : number = 0
    private _index : number = -1
    private _resizeStart : number = 0

    private readonly minWidth: number = thresHoldConstants.minWidth;

    constructor (grid : Grid){
        this._grid = grid
    }

    handleDown(event : PointerEvent , x : number , y : number): boolean {
        if(!isColumnHeader(x, y))
            return false;

        const colIndex = this._grid._canvasMaths.getBorderAtX(x)
        
        if(colIndex < 0)
            return false

        this._resizeStart = x
        this._preSize = this._grid._colState.getColWidth(colIndex)
        this._index = colIndex    
        return true
    }

    handleMove(x : number , y : number): void {
        if(this._index != -1){
            const deltaX = x - this._resizeStart
            const newWidth = Math.max(this.minWidth , this._preSize + deltaX)
            this._grid._colState.setProperties(this._index, newWidth)
        }
    }

    handleUp(): void {
        this._preSize  = 0
        this._index  = -1
        this._resizeStart  = 0
    }
}
