import type { Grid } from "../Grid.js";
import { arrowMap } from "../GridUtils/constants.js";
import type { KeyBoardEvents } from "./KeyEventInterface.js";

export class CellKeyEventHandler implements KeyBoardEvents{
    private _grid : Grid

    constructor (grid : Grid){
        this._grid = grid
    }

    private handleCell(delta : [number, number]) : {nextCol : number, nextRow : number}{
        const nextColIndex = Math.max(1, Math.min(this._grid.columnNo,((this._grid._selection.focusCol ?? 0) + delta[1])));
        const nextRowIndex = Math.max(1, Math.min(this._grid.rowNo,((this._grid._selection.focusRow ?? 0) + delta[0])));
        
        this._grid._canvasMaths.ensureColVisible(nextColIndex)
        this._grid._canvasMaths.ensureRowVisible(nextRowIndex)
        
        return {nextCol : nextColIndex, nextRow :  nextRowIndex}
    }

    handleKeyDown() : boolean {
        if(
            this._grid._selection.anchorCol !== null  &&
            this._grid._selection.anchorRow !== null 
        ){
            return true
        }

        return false
    }

    handleShiftSelection(event : KeyboardEvent) : void {
        if(!event.shiftKey) return;
        const delta = arrowMap[event.key];
        if(!delta) return;

        const {nextCol, nextRow} = this.handleCell(delta)
        

        this._grid._selection.focusRow = nextRow
        this._grid._selection.focusCol = nextCol
    }
    
    handleMovementKeyDown(event : KeyboardEvent) : void {
        if(event.shiftKey) return;
        const delta = arrowMap[event.key];
        if(!delta) return;
        
        const {nextCol, nextRow} = this.handleCell(delta)
        
        this._grid._selection.anchorRow = nextRow
        this._grid._selection.focusRow = nextRow

        this._grid._selection.anchorCol = nextCol
        this._grid._selection.focusCol = nextCol
    }

    handleTabKeyDown(event : KeyboardEvent) : void {
        if(!(event.key === 'Tab'))  return;
        if(event.shiftKey){
            const {nextCol, nextRow} = this.handleCell([0, -1])
            this._grid._selection.anchorCol = nextCol
            this._grid._selection.focusCol = nextCol
        }
        else{
            const {nextCol, nextRow} = this.handleCell([0, 1])
        
            this._grid._selection.anchorCol = nextCol
            this._grid._selection.focusCol = nextCol
        }
    }
}