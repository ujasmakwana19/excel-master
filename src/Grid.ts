import { CanvasMaths } from "./CanvasMaths.js";
import { Defaults, GridConstants, HeaderConstants } from "./constants.js";
import { ColumnSelection } from "./EventListener/ColumnSelection.js";
import { MouseScrollEventOpertion } from "./EventListener/MouseScrollEvent.js";
import { ResizeRowColumnEvent } from "./EventListener/ResizeRowColumnEvent.js";
import { Cell } from "./Grid/cell.js";
import { Column } from "./Grid/column.js";
import { Row } from "./Grid/row.js";
import { PaintEngine } from "./PaintEngine.js";
import { RenderingEngine } from "./RenderingEngine.js";

export class Grid {
  _canvas: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;

  // Render
  _renderingEngine: RenderingEngine;

  // Events
  _mouseEventScroll: MouseScrollEventOpertion;
  _resizeEvent: ResizeRowColumnEvent;
  _colselectionEvent : ColumnSelection

  // Grid Paint
  _paintEngine: PaintEngine;

  // Maths Function
  _canvasMaths : CanvasMaths   

  // states
  _rowState: Row;
  _colState: Column;
  _cellState: Cell;

  _rowSelected : Set<number> = new Set<number>()
  _colSelected : Set<number> = new Set<number>()
  _cellSelected : Set<number> = new Set<number>()

  // primitives
  scrollX: number = 0;
  scrollY: number = 0;

  cellWidth: number = GridConstants.WIDTH;
  cellHeight: number = GridConstants.HEIGHT;

  leftHeaderWidth: number = HeaderConstants.LEFTWIDTH;
  topHeaderHeight: number = HeaderConstants.TOPHEIGHT;

  totalWidth: number = 0;
  totalHeight: number = 0;

  rowNo: number = Defaults.ROW;
  columnNo: number = Defaults.COLUMN;

  selectedColIndex: number = -1;

  darkMode : boolean = false;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this._canvas = canvas;
    this._ctx = ctx;

	
    this._rowState = new Row();
    this._colState = new Column();
    this._cellState = new Cell();
	
    this._paintEngine = new PaintEngine(
		this
    );
	
	this._canvasMaths = new CanvasMaths(
		this
	)
	
    this._renderingEngine = new RenderingEngine(
		this
    );
	
	this._resizeEvent = new ResizeRowColumnEvent(this );
	this._mouseEventScroll = new MouseScrollEventOpertion();
  this._colselectionEvent = new ColumnSelection(this)

	this.drawInitGrid();
  }

  private async drawInitGrid() {
    this.resizeCanvas();

    window.addEventListener("resize", () => this.resizeCanvas());

    // Grid Render on scroll
    window.addEventListener(
      "wheel",
      (e) => this._mouseEventScroll.handleWheel(e, this),
      { passive: false },
    );

    // mouse moving on the
    this._canvas.addEventListener("mousemove", (e) =>
      this._resizeEvent.handleMouseMove(
        this._canvas,
        this,
        this._renderingEngine,
        e,
      ),
    );

	// mouse click
    this._canvas.addEventListener("mousedown", (e) =>
      this._resizeEvent.handleMouseDown(
        e,
      ),
    );

    this._canvas.addEventListener("mousedown", (e) =>
      this._colselectionEvent.selectColumn(
        e,
      ),
    );

	// mouse released
    window.addEventListener("mouseup", () => this._resizeEvent.handleMouseUp());
  }

  private resizeCanvas(): void {
    const rect: DOMRect | undefined =
      this._canvas.parentElement?.getBoundingClientRect();
    
      
      if (rect === undefined) {
        throw new Error("Can't get the dimensions of the element");
      }
      
    console.log(rect);
    this._canvas.width = rect.width;
    this._canvas.height = rect.height;

    this.render();
  }

  render(): void {
    this.totalWidth = this._colState.calCulateTotalWidth();
    this.totalHeight = this._rowState.calCulateTotalHeight();

    this._renderingEngine.renderGrid();
  }
}
