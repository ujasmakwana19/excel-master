import type { Grid } from "../Grid.js";
import { isRowHeader, thresHoldConstants } from "../Grid/constants.js";
import type { PointerEventInterface } from "./PointerEventInterface.js";

export class ResizeRowEvent implements PointerEventInterface{

    private _grid : Grid

    private _preSize : number = 0
    private _index : number = -1
    private _resizeStart : number = 0

      private readonly minHeight: number = thresHoldConstants.minHeight;

    constructor (grid : Grid){
        this._grid = grid
    }

    handleDown(event : PointerEvent , x : number , y : number): boolean {
        if(!isRowHeader(x, y))
            return false

        const rowIndex = this._grid._canvasMaths.getBorderAtY(y)
        
        if(rowIndex < 0)
            return false

        this._resizeStart = y
        this._preSize = this._grid._rowState.getRowHeight(rowIndex)
        this._index = rowIndex
        return true    
    }

    handleMove(x : number , y : number): void {
        if(this._index !== -1){
            const deltaY = y - this._resizeStart
            const newHeight = Math.max(this.minHeight , this._preSize + deltaY)
            this._grid._rowState.setProperties(this._index, newHeight)
        }
    }

    handleUp(): void {
        this._preSize  = 0
        this._index  = -1
        this._resizeStart  = 0
    }
}