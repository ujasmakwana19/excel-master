import type { Grid } from "../Grid.js";
import { CellKeyEventHandler } from "../KeyEventHandler/CellEvent.js";
import { ColumnKeyEventHandler } from "../KeyEventHandler/ColumnEvent.js";
import type { KeyBoardEvents } from "../KeyEventHandler/KeyEventInterface.js";
import { RowKeyEventHandler } from "../KeyEventHandler/RowEvent.js";

export class KeyEventManager {
    private _grid : Grid

    private _eventHandlers : KeyBoardEvents[]
    private _handler : KeyBoardEvents | undefined = undefined

    constructor(grid : Grid){
        this._grid = grid
        
        this._eventHandlers = [
            new ColumnKeyEventHandler(this._grid),
            new RowKeyEventHandler(this._grid),
            new CellKeyEventHandler(this._grid)
        ]

        this.initKeyEvent()
    }


    initKeyEvent() : void {
        this._grid._canvas.addEventListener("keydown", (event) => this.handleKeyDown(event))
    }

    handleKeyDown(event : KeyboardEvent) {
        for (let i = 0; i < this._eventHandlers.length; i++) {
            if(this._eventHandlers[i]?.handleKeyDown())
            {
                this._handler = this._eventHandlers[i]   
                break;   
            }
        }

        
        this._handler?.handleShiftSelection(event);
        this._handler?.handleMovementKeyDown(event);
        this._handler?.handleTabKeyDown(event);

        this._grid.render()
        this._grid.onSelectionChange?.()
        event.preventDefault(); 
    }
    
}