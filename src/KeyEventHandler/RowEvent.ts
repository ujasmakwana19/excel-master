import type { Grid } from "../Grid.js";
import { arrowMap } from "../Grid/constants.js";
import type { KeyBoardEvents } from "./KeyEventInterface.js";

export class RowKeyEventHandler implements KeyBoardEvents{
    private _grid : Grid

    constructor (grid : Grid){
        this._grid = grid
    }

    private handleRow(delta : [number, number]) : number{
        const nextRow = Math.max(1, Math.min(this._grid.rowNo ,((this._grid._selection.focusRow ?? 0) + delta[0])));
        this._grid._canvasMaths.ensureRowVisible(nextRow)
        
        return nextRow
    }

    handleKeyDown() : boolean {
        if(
            this._grid._selection.anchorCol === null  &&
            this._grid._selection.anchorRow !== null 
        ){
            return true
        }

        return false
    }

    handleShiftSelection(event : KeyboardEvent) : void {
        if(!event.shiftKey) return;

        const delta = arrowMap[event.key];
        if ( event.key === "ArrowLeft" || event.key === "ArrowRight" || !delta ) return;

        const nextRowIndex = this.handleRow(delta)
        this._grid._selection.focusRow = nextRowIndex
    }

    handleMovementKeyDown(event : KeyboardEvent) : void {
        if(event.shiftKey) return;
        const delta = arrowMap[event.key];
        if ( event.key === "ArrowUp" || event.key === "ArrowDown" || !delta ) return ;
        
        const nextRow = this.handleRow(delta)
        
        this._grid._selection.anchorRow = nextRow
        this._grid._selection.focusRow = nextRow
    }
    
    handleTabKeyDown(event : KeyboardEvent) : void {
        if(!(event.key === 'Tab'))  return;
        let nextRow = this._grid._selection.anchorRow
        if(event.shiftKey){
            nextRow = this.handleRow([-1, 0])
        }
        else{
            nextRow = this.handleRow([1, 0])
        }
        this._grid._selection.anchorRow = nextRow
        this._grid._selection.focusRow = nextRow
    }
}