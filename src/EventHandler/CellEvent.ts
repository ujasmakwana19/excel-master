import type { Grid } from "../Grid.js";
import { clamp, isCellBody, thresHoldConstants } from "../Grid/constants.js";
import type { PointerEventInterface } from "./PointerEventInterface.js";

export class CellEventHandler implements PointerEventInterface{
    private _grid : Grid

    constructor(grid : Grid){
        this._grid = grid
    }

    handleDown(event : PointerEvent , x : number , y : number): boolean {
        if (!isCellBody(x, y)) {
            return false;
        }
        
        const rowIndex = this._grid._canvasMaths.getRowAtY(y)
        const colIndex = this._grid._canvasMaths.getColAtX(x)
        
        if (rowIndex === -1 || colIndex === -1) {
            return false;
        }
        
        this.beginSelection(event, rowIndex, colIndex)
        return true    
    }

    handleMove(x : number , y : number ): void {
        this._grid._pointerEventManager._autoScroll.updateAutoScroll(x, y)
        const clampedX = clamp(x, 
                this._grid.leftHeaderWidth + thresHoldConstants.edge_operation, 
                this._grid._canvas.width - thresHoldConstants.edge_operation)
        
        const clampedY = clamp(y, 
            this._grid.topHeaderHeight + thresHoldConstants.edge_operation, 
            this._grid._canvas.height - thresHoldConstants.edge_operation)

        const colIndex = this._grid._canvasMaths.getColAtX(clampedX)
        const rowIndex = this._grid._canvasMaths.getRowAtY(clampedY)

        if (rowIndex === -1 || colIndex === -1) {
            return ;
        }

        this._grid._selection.focusCol = colIndex
        this._grid._selection.focusRow = rowIndex
    }

    handleUp(): void {

    }

    private beginSelection(event: PointerEvent, row: number, col: number): void {
        const selection = this._grid._selection

        if (event.shiftKey && selection.anchorRow !== null && selection.anchorCol !== null) {
            selection.focusRow = row
            selection.focusCol = col
            return
        }

        selection.clear()
        selection.anchorRow = row
        selection.focusRow = row
        selection.anchorCol = col
        selection.focusCol = col
    }
}