import type { Grid } from "../Grid.js"
import { DEFAULT_HIT, DEFAULT_POINTER_AREA, type AreaPointerEvent, type Hit } from "../Grid/SelectionState.js"
import { CellEventHandler } from "./CellEvent.js"
import { ColumnEventHandler } from "./ColumnEvent.js"
import { RowEventHandler } from "./RowEvent.js"

export class PointerEventManager {
    private _grid : Grid
    private _hitState : Hit = DEFAULT_HIT
    private _areaHit : AreaPointerEvent = DEFAULT_POINTER_AREA

    private _columnEvent : ColumnEventHandler
    private _rowEvent : RowEventHandler
    private _cellEvent : CellEventHandler
    
    constructor(grid : Grid) {
        this._grid = grid

        this._columnEvent = new ColumnEventHandler(this._grid)
        this._rowEvent = new RowEventHandler(this._grid)
        this._cellEvent = new CellEventHandler(this._grid)
        
        this.initPointerListener()
    }
    
    // Initialise the Pointer Event
    initPointerListener() {
        this._grid._canvas.addEventListener('pointerdown', (event : PointerEvent) => {
            this.handlePointerDown(event)
        })
    }

    // helper to get the calculated coordinates
    private getPointerCoords(event: PointerEvent): { x: number; y: number } {
        const rect = this._grid._canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    handlePointerDown(event : PointerEvent) {
        const {x, y} = this.getPointerCoords(event)
        this._grid._canvas.focus()

        this._columnEvent.handleColumnEvent(event, x, y)
        this._rowEvent.handleRowEvent(x, y)
        this._cellEvent.handleCellEvent(x, y)





        console.log({x : x, y : y});
        
    }  


     
}