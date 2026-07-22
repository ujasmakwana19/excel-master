import type { Grid } from "../Grid.js";
import { clamp, isColumnHeader, thresHoldConstants } from "../GridUtils/constants.js";
import type { PointerEventInterface } from "./PointerEventInterface.js";

export class ColumnEventHandler implements PointerEventInterface {
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    handleDown(event : PointerEvent , x : number , y : number): boolean {
        if(!isColumnHeader(x, y)){
            return false; 
        }
        const colIndex = this._grid._canvasMaths.getColAtX(x)

        if(colIndex < 0)  return false;
        this.beginSelection(event, colIndex)
        return true
    }

    handleMove(x : number , y : number ): void {
        this._grid._pointerEventManager._autoScroll.updateAutoScroll(x, -1)
        const clampedX = clamp(x, 
            this._grid.leftHeaderWidth + thresHoldConstants.edge_operation, 
            this._grid._canvas.width - thresHoldConstants.edge_operation)

        const colIndex = this._grid._canvasMaths.getColAtX(clampedX)

        if(colIndex > 0)
            this._grid._selection.focusCol = colIndex
    }

    handleUp(): void {
        
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
}