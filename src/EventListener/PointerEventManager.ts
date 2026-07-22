import type { Grid } from "../Grid.js"
import { AutoScroll } from "./DragAutoScroll.js"
import { CellEventHandler } from "../PointerEventHandler/CellEvent.js"
import { ColumnEventHandler } from "../PointerEventHandler/ColumnEvent.js"
import { cursorShape } from "../PointerEventHandler/DynamicGraphicsHandler.js"
import type { PointerEventInterface } from "../PointerEventHandler/PointerEventInterface.js"
import { RenderScheduler } from "./RenderScheduler.js"
import { ResizeColumnEvent } from "../PointerEventHandler/ResizeColumnEvent.js"
import { ResizeRowEvent } from "../PointerEventHandler/ResizeRowEvent.js"
import { RowEventHandler } from "../PointerEventHandler/RowEvent.js"



export class PointerEventManager {
    private _grid : Grid

    private _eventHandlers : PointerEventInterface[]

    private _handler : PointerEventInterface | undefined = undefined

    _autoScroll: AutoScroll;
    private readonly _renderScheduler: RenderScheduler;

    private _activePointerId : number | null = null
    
    constructor(grid : Grid) {
        this._grid = grid

        this._eventHandlers = [
            new ColumnEventHandler(this._grid),
            new RowEventHandler(this._grid),
            new CellEventHandler(this._grid),
            new ResizeColumnEvent(this._grid),
            new ResizeRowEvent(this._grid)
        ]
        

        this._renderScheduler = new RenderScheduler(() => {
            this._grid.render();
            this._grid.onSelectionChange?.();
        });

        this._autoScroll = new AutoScroll(this._grid, this._renderScheduler);

        this.initPointerListener()
    }

    // helper to get the calculated coordinates
    private getPointerCoords(event: PointerEvent): { x: number; y: number } {
        const rect = this._grid._canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    // Initialise the Pointer Event
    initPointerListener(): void {
        
        // Selection 
        this._grid._canvas.addEventListener('pointerdown', (event : PointerEvent) => {
            this.handlePointerDown(event)
        })
        
        // Cursor shape while move and hold on resizing
        this._grid._canvas.addEventListener("pointermove", (event: PointerEvent) => {
            const { x, y } = this.getPointerCoords(event)            
            cursorShape(this._grid , x, y)
        })
    }

    handlePointerDown(event : PointerEvent) {
        const { x, y } = this.getPointerCoords(event)

        this._grid._canvas.focus();

        for (let i = 0; i < this._eventHandlers.length; i++) {
            if(this._eventHandlers[i] !== undefined && this._eventHandlers[i]?.handleDown(event , x, y)){
                this._handler =  this._eventHandlers[i]
                break;
            }
        }
        
        this.startDrag(event)
    }

    private startDrag(event : PointerEvent): void {
        this._activePointerId = event.pointerId
        this._grid._canvas.setPointerCapture(event.pointerId);

        this._grid._canvas.addEventListener("pointermove", this.handlePointerMove);
        this._grid._canvas.addEventListener("pointerup", this.handlePointerUp);
        this._grid._canvas.addEventListener("pointercancel", this.handlePointerUp);

        this._renderScheduler.request();
    }

    private handlePointerMove = (e: PointerEvent): void => {
        const point = this.getPointerCoords(e);
        this._handler?.handleMove(point.x, point.y)
        this._renderScheduler.request()
    };

    private handlePointerUp = (): void => {
        this._autoScroll.stop();
        this._handler?.handleUp();

        if (this._activePointerId !== null) {
            this._grid._canvas.releasePointerCapture(this._activePointerId);
            this._activePointerId = null;
        }

        this._grid._canvas.removeEventListener("pointermove", this.handlePointerMove);
        this._grid._canvas.removeEventListener("pointerup", this.handlePointerUp);
        this._grid._canvas.removeEventListener("pointercancel", this.handlePointerUp);
    }
}