import type { Grid } from "../Grid.js";
import { isRowHeader, thresHoldConstants } from "../Grid/constants.js";

export class ResizeRowEvent {

    private _grid : Grid

    private _preSize : number = 0
    private _index : number = -1
    private _resizeStart : number = 0

      private readonly minHeight: number = thresHoldConstants.minHeight;

    constructor (grid : Grid){
        this._grid = grid
    }

    cursorShape(x : number, y : number) {
        if(!isRowHeader(x, y)){
            return
        }

        const rowIndex = this._grid._canvasMaths.getBorderAtY(y)
        
        if(rowIndex < 0){
            this._grid._canvas.style.cursor = "default"
            return
        }
        
        this._grid._canvas.style.cursor = "row-resize"
    }

    HandleResize(event : PointerEvent, x : number , y : number) {
        if(!isRowHeader(x, y))
            return

        const rowIndex = this._grid._canvasMaths.getBorderAtY(y)
        
        if(rowIndex < 0)
            return

        this._grid._selection.isResizing = true
        this._resizeStart = y
        this._preSize = this._grid._rowState.getRowHeight(rowIndex)
        this._index = rowIndex
    }

    applyResize(event : PointerEvent, y : number){
        if(this._index != -1){
            const deltaY = y - this._resizeStart
            const newHeight = Math.max(this.minHeight , this._preSize + deltaY)
            this._grid._rowState.setProperties(this._index, newHeight)
        }
    }

    stopResize() {
        this._grid._selection.isResizing = false
        this._preSize  = 0
        this._index  = -1
        this._resizeStart  = 0
    }
}