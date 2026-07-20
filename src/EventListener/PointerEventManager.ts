import type { Grid } from "../Grid.js"
import { EDGE_SCROLL_SPEED, thresHoldConstants } from "../Grid/constants.js"
import { AutoScroll } from "./AutoScroll.js"
import { CellEventHandler } from "./CellEvent.js"
import { ColumnEventHandler } from "./ColumnEvent.js"
import { RenderScheduler } from "./RenderScheduler.js"
import { ResizeColumnEvent } from "./ResizeColumnEvent.js"
import { ResizeRowEvent } from "./ResizeRowEvent.js"
import { RowEventHandler } from "./RowEvent.js"

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export class PointerEventManager {
    private _grid : Grid

    private _columnEvent : ColumnEventHandler
    private _rowEvent : RowEventHandler
    private _cellEvent : CellEventHandler
    private _columnResize : ResizeColumnEvent
    private _rowResize : ResizeRowEvent

    private readonly _autoScroll: AutoScroll;
    private readonly _renderScheduler: RenderScheduler;

    private _activePointerId : number | null = null
    
    constructor(grid : Grid) {
        this._grid = grid

        this._columnEvent = new ColumnEventHandler(this._grid)
        this._rowEvent = new RowEventHandler(this._grid)
        this._cellEvent = new CellEventHandler(this._grid)
        this._columnResize = new ResizeColumnEvent(this._grid)
        this._rowResize = new ResizeRowEvent(this._grid)

        this._renderScheduler = new RenderScheduler(() => {
            this._grid.render();
            this._grid.onSelectionChange?.();
        });

        this._autoScroll = new AutoScroll(this._grid, this, this._renderScheduler);

        this.initPointerListener()
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
            
            this._columnResize.cursorShape(x, y)
            this._rowResize.cursorShape(x, y)
        })
    }

    // helper to get the calculated coordinates
    private getPointerCoords(event: PointerEvent): { x: number; y: number } {
        const rect = this._grid._canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    handlePointerDown(event : PointerEvent) {
        const { x, y } = this.getPointerCoords(event)

        this._grid._canvas.focus();

        this._columnEvent.handleColumnEvent(event, x, y)
        this._rowEvent.handleRowEvent(event, x, y)
        this._cellEvent.handleCellEvent(event, x, y)
        this._columnResize.HandleResize(event , x, y)
        this._rowResize.HandleResize(event , x, y)

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
        

        if(this._grid._selection.isResizing){
            this._columnResize.applyResize(e, point.x)
            this._rowResize.applyResize(e, point.y)
            this._renderScheduler.request()
        }
        else if(this._grid._selection.isSelecting){
            this._autoScroll.updateAutoScroll(point.x, point.y);
            this.extendToPoint(point.x, point.y);
        }
    };

    private handlePointerUp = (): void => {
        this._grid._selection.isSelecting = false

        this._autoScroll.stop();
        this._columnResize.stopResize();
        this._rowResize.stopResize();

        if (this._activePointerId !== null) {
            this._grid._canvas.releasePointerCapture(this._activePointerId);
            this._activePointerId = null;
        }

        this._grid._canvas.removeEventListener("pointermove", this.handlePointerMove);
        this._grid._canvas.removeEventListener("pointerup", this.handlePointerUp);
        this._grid._canvas.removeEventListener("pointercancel", this.handlePointerUp);
    };

    

    private extendToPoint(x: number, y: number): void {
        const clampedX = clamp(x, this._grid.leftHeaderWidth + thresHoldConstants.edge_operation, this._grid._canvas.width - thresHoldConstants.edge_operation)
        const clampedY = clamp(y, this._grid.topHeaderHeight + thresHoldConstants.edge_operation, this._grid._canvas.height - thresHoldConstants.edge_operation)
            
        this._columnEvent.handleExtendColumnSelection(clampedX)
        this._rowEvent.handleExtendRowSelection(clampedY)
        this._cellEvent.handleExtendCellSelection(clampedX ,clampedY)

        this._renderScheduler.request()
    }

}