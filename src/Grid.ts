import { GridConstants } from "./constants.js";
import { MouseScrollEventOpertion } from "./EventListener/MouseScrollEvent.js";
import { Cell } from "./Grid/cell.js";
import { Column } from "./Grid/column.js";
import { Row } from "./Grid/row.js";
import { RenderingEngine } from "./RenderingEngine.js";

export class Grid {
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;
    _renderingEngine : RenderingEngine
    _mouseEventScroll : MouseScrollEventOpertion
    _rowState : Row
    _colState : Column
    _cellState : Cell
    

    scrollX: number = 0;
    scrollY: number = 0;
    
    cellWidth: number = GridConstants.WIDTH;
    cellHeight: number = GridConstants.HEIGHT;

    totalWidth : number = 0
    totalHeight : number = 0

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this._canvas = canvas;
        this._ctx = ctx;
        
        this._rowState = new Row()
        this._colState = new Column()
        this._cellState = new Cell()

        this._mouseEventScroll = new MouseScrollEventOpertion()
        this._renderingEngine = new RenderingEngine(this._rowState, this._colState, this._cellState)
        
        this.drawInitGrid();
    }

    
    
    private async drawInitGrid() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('wheel', (e) => this._mouseEventScroll.handleWheel(e, this), { passive: false });
    
    }

    private resizeCanvas() : void {
        const rect: DOMRect | undefined = this._canvas.parentElement?.getBoundingClientRect();
        
        if (rect === undefined) {
            throw new Error("Can't get the dimensions of the element");
        }
        this._canvas.width = rect.width;
        this._canvas.height = rect.height;

        this.render()
    }

    render() : void {

        this.totalWidth = this._colState.calCulateTotalWidth()
        this.totalHeight = this._rowState.calCulateTotalHeight()

        this._renderingEngine.renderGrid(
            this._canvas,
            this._ctx,
            this.scrollX,
            this.scrollY
        );
    }
}