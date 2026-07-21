import type { Grid } from "../Grid.js";
import { clamp, isRowHeader, thresHoldConstants } from "../Grid/constants.js";
import type { PointerEventInterface } from "./PointerEventInterface.js";

export class RowEventHandler implements PointerEventInterface{
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    handleDown(event : PointerEvent , x : number , y : number): boolean {
        if(!isRowHeader(x, y)){
            return false;
        }

        const rowIndex = this._grid._canvasMaths.getRowAtY(y)

        if(rowIndex < 0) return false;

        this.beginSelection(event, rowIndex) 
        return true   
    }

    handleMove(x : number , y : number): void {
        this._grid._pointerEventManager._autoScroll.updateAutoScroll(-1, y)
        const clampedY = clamp(y, 
            this._grid.topHeaderHeight + thresHoldConstants.edge_operation, 
            this._grid._canvas.height - thresHoldConstants.edge_operation)

        const rowIndex = this._grid._canvasMaths.getRowAtY(clampedY)

        if(rowIndex > 0)
            this._grid._selection.focusRow = rowIndex

    }

    handleUp(): void {
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
}