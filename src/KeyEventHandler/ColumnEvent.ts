import type { Grid } from "../Grid.js";
import { arrowMap } from "../Grid/constants.js";
import type { KeyBoardEvents } from "./KeyEventInterface.js";

export class ColumnKeyEventHandler implements KeyBoardEvents{
    private _grid : Grid

    constructor (grid : Grid){
        this._grid = grid
    }

    private handleCol(delta : [number, number]) : number{
        const nextCol = Math.max(1, Math.min(this._grid.columnNo, ((this._grid._selection.focusCol ?? 0) + delta[1])));
        this._grid._canvasMaths.ensureColVisible(nextCol)
        
        return nextCol
    }
    
    handleKeyDown() : boolean {
        if(
            this._grid._selection.anchorCol !== null &&
            this._grid._selection.anchorRow === null 
        ){            
            return true
        }

        return false
    }

    handleShiftSelection(event : KeyboardEvent) : void {
        if(!event.shiftKey) return;

        const delta = arrowMap[event.key];
        if ( event.key === "ArrowUp" || event.key === "ArrowDown" || !delta ) return ;

        const nextCol = this.handleCol(delta)

        this._grid._selection.focusCol = nextCol
    }
    
    handleMovementKeyDown(event : KeyboardEvent) : void {
        if(event.shiftKey) return;
        const delta = arrowMap[event.key];
        if ( event.key === "ArrowUp" || event.key === "ArrowDown" || !delta ) return ;
        
        const nextCol = this.handleCol(delta)
        
        this._grid._selection.anchorCol = nextCol
        this._grid._selection.focusCol = nextCol
    }
    
    handleTabKeyDown(event : KeyboardEvent) : void {
        if(!(event.key === 'Tab'))  return;
        let nextCol = this._grid._selection.anchorCol
        if(event.shiftKey){
            nextCol = this.handleCol([0, -1])
        }
        else{
            nextCol = this.handleCol([0, 1])
        }
        this._grid._selection.anchorCol = nextCol
        this._grid._selection.focusCol = nextCol
    }

}