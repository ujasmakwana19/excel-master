import type { Grid } from "../Grid.js";
import { isColumnHeader, thresHoldConstants } from "../Grid/constants.js";

export class ResizeColumnEvent {

    private _grid : Grid

    private _preSize : number = 0
    private _index : number = -1
    private _resizeStart : number = 0

    private readonly minWidth: number = thresHoldConstants.minWidth;

    constructor (grid : Grid){
        this._grid = grid
    }

    cursorShape(x : number, y : number) {
        if(!isColumnHeader(x, y)){
            return
        }

        const colIndex = this._grid._canvasMaths.getBorderAtX(x)
        if(colIndex < 0){
            this._grid._canvas.style.cursor = "default"
            return
        }
        
        this._grid._canvas.style.cursor = "col-resize"
    }

    HandleResize(event : PointerEvent, x : number , y : number) {
        if(!isColumnHeader(x, y))
            return

        const colIndex = this._grid._canvasMaths.getBorderAtX(x)
        
        if(colIndex < 0)
            return

        this._grid._selection.isResizing = true
        this._resizeStart = x
        this._preSize = this._grid._colState.getColWidth(colIndex)
        this._index = colIndex
        
    }
    
    applyResize(event : PointerEvent, x : number){
        if(this._index != -1){
            const deltaX = x - this._resizeStart
            const newWidth = Math.max(this.minWidth , this._preSize + deltaX)
            this._grid._colState.setProperties(this._index, newWidth)
        }
    }
    
    stopResize() {
        this._grid._selection.isResizing = false
        this._preSize  = 0
        this._index  = -1
        this._resizeStart  = 0
    }
}
