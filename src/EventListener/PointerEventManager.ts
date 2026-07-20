import type { Grid } from "../Grid.js"
import { EDGE_SCROLL_SPEED } from "../Grid/constants.js"
import { AutoScroll } from "./AutoScroll.js"
import { CellEventHandler } from "./CellEvent.js"
import { ColumnEventHandler } from "./ColumnEvent.js"
import { RenderScheduler } from "./RenderScheduler.js"
import { RowEventHandler } from "./RowEvent.js"

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

type DragAxes = {
    row: boolean
    col: boolean
}

export class PointerEventManager {
    private _grid : Grid

    private _columnEvent : ColumnEventHandler
    private _rowEvent : RowEventHandler
    private _cellEvent : CellEventHandler

    private readonly _autoScroll: AutoScroll;
    private readonly _renderScheduler: RenderScheduler;

    private _isDragging : boolean = false
    private _activePointerId : number | null = null
    private _dragAxes: DragAxes = { row: false, col: false }
    
    constructor(grid : Grid) {
        this._grid = grid

        this._columnEvent = new ColumnEventHandler(this._grid)
        this._rowEvent = new RowEventHandler(this._grid)
        this._cellEvent = new CellEventHandler(this._grid)

        this._autoScroll = new AutoScroll((dx, dy) => this.scrollBy(dx, dy));


        this._renderScheduler = new RenderScheduler(() => {
            this._grid.render();
            this._grid.onSelectionChange?.();
        });
        
        this.initPointerListener()
    }
    
    // Initialise the Pointer Event
    initPointerListener(): void {
        if (!this._grid._canvas.hasAttribute("tabindex")) {
            this._grid._canvas.setAttribute("tabindex", "0")
        }

        this._grid._canvas.addEventListener('pointerdown', (event : PointerEvent) => {
            this.handlePointerDown(event)
        })

        this._grid._canvas.addEventListener("pointermove", (event: PointerEvent) => {
            if (this._isDragging) return
            const { x, y } = this.getPointerCoords(event)
            this._grid._resizeEvent.updateCursor(this._grid._canvas, x, y)
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

        if (this._grid._resizeEvent.tryStartResize(event, x, y)) {
            this._dragAxes = { row: false, col: false }
            this.startDrag(event)
            return
        }

        const handledColumn = this._columnEvent.handleColumnEvent(event, x, y)
        if (handledColumn) {
            this._dragAxes = { row: false, col: true }
        } else {
            const handledRow = this._rowEvent.handleRowEvent(event, x, y)
            if (handledRow) {
            this._dragAxes = { row: true, col: false }
            } else {
                const handledCell = this._cellEvent.handleCellEvent(event, x, y)
                if (handledCell) {
                    this._dragAxes = { row: true, col: true }
                } else {
                    this._dragAxes = { row: false, col: false }
                    return
                }
            }
        }

        this.startDrag(event)
    }

    private startDrag(event : PointerEvent): void {
        this._isDragging = true

        this._activePointerId = event.pointerId

        this._grid._canvas.setPointerCapture(event.pointerId);

        this._grid._canvas.addEventListener("pointermove", this.handlePointerMove);
        this._grid._canvas.addEventListener("pointerup", this.handlePointerUp);
        this._grid._canvas.addEventListener("pointercancel", this.handlePointerUp);

        this._renderScheduler.request();
    }

    private handlePointerMove = (e: PointerEvent): void => {
        if (!this._isDragging) return;

        if (this._grid._resizeEvent.isResizing) {
            if (this._grid._resizeEvent.applyResize(e)) {
                this._renderScheduler.request()
            }
            return
        }

        const point = this.getPointerCoords(e);
        this.updateAutoScroll(point.x, point.y);
        this.extendToPoint(point.x, point.y);
    };

    private handlePointerUp = (): void => {
        this._isDragging = false;
        this._autoScroll.stop();
        this._grid._resizeEvent.stopResize();

        if (this._activePointerId !== null) {
            this._grid._canvas.releasePointerCapture(this._activePointerId);
            this._activePointerId = null;
        }

        this._grid._canvas.removeEventListener("pointermove", this.handlePointerMove);
        this._grid._canvas.removeEventListener("pointerup", this.handlePointerUp);
        this._grid._canvas.removeEventListener("pointercancel", this.handlePointerUp);
    };

    private scrollBy(dx: number, dy: number): void {
        const maxScrollX = Math.max(0, this._grid.totalWidth - this._grid._canvas.width);
        const maxScrollY = Math.max(0, this._grid.totalHeight - this._grid._canvas.height);

        this._grid.scrollX = clamp(this._grid.scrollX + dx, 0, maxScrollX);
        this._grid.scrollY = clamp(this._grid.scrollY + dy, 0, maxScrollY);

        this._renderScheduler.request();
    }

    private updateAutoScroll(x: number, y: number): void {
        const dx = this._dragAxes.col
            ? this.edgeScrollDelta(x, this._grid.leftHeaderWidth, this._grid._canvas.width)
            : 0
        const dy = this._dragAxes.row
            ? this.edgeScrollDelta(y, this._grid.topHeaderHeight, this._grid._canvas.height)
            : 0

        this._autoScroll.update(dx, dy)
    }

    private edgeScrollDelta(pos: number, min: number, max: number): number {
        if (pos < min) return -EDGE_SCROLL_SPEED
        if (pos > max) return EDGE_SCROLL_SPEED
        return 0
    }

    private extendToPoint(x: number, y: number): void {
        if (!this._dragAxes.row && !this._dragAxes.col) return

        const selection = this._grid._selection

        if (this._dragAxes.col) {
            const clampedX = clamp(x, this._grid.leftHeaderWidth + 1, this._grid._canvas.width - 1)
            const colIndex = this._grid._canvasMaths.getColAtX(clampedX)
            if (colIndex !== -1) {
                selection.focusCol = colIndex
            }
        }

        if (this._dragAxes.row) {
            const clampedY = clamp(y, this._grid.topHeaderHeight + 1, this._grid._canvas.height - 1)
            const rowIndex = this._grid._canvasMaths.getRowAtY(clampedY)
            if (rowIndex !== -1) {
                selection.focusRow = rowIndex
            }
        }

        this._renderScheduler.request()
    }

}