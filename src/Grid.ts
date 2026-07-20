import { CanvasMaths } from "./CanvasMaths.js";
import { Defaults, GridConstants, HeaderConstants } from "./Grid/constants.js";
// import { SelectionManager } from "./EventListener/SelectionManager.js";
import { CanvasScrollEventOpertion } from "./EventListener/CanvasScrollEvent.js";
import { ResizeRowColumnEvent } from "./EventListener/ResizeRowColumnEvent.js";
import { Cell } from "./DB/cell.js";
import { Column } from "./DB/column.js";
import { Row } from "./DB/row.js";
import { PaintEngine } from "./PaintEngine.js";
import { RenderingEngine } from "./RenderingEngine.js";
import { SelectionState } from "./Grid/SelectionState.js";
import { HistoryManager } from "./HistoryManager.js";
import { CellEditor } from "./Cell/CellEditor.js";
import { PointerEventManager } from "./EventListener/PointerEventManager.js";

export class Grid {
  _canvas: HTMLCanvasElement;
  _ctx: CanvasRenderingContext2D;

  // Render
  _renderingEngine: RenderingEngine;

  // Events
  _canvasScroll: CanvasScrollEventOpertion;
  _resizeEvent: ResizeRowColumnEvent;
  // _selectionManager: SelectionManager;
  _pointerEventManager : PointerEventManager

  // Grid Paint
  _paintEngine: PaintEngine;

  // Maths Function
  _canvasMaths: CanvasMaths;

  // states
  _rowState: Row;
  _colState: Column;
  _cellState: Cell;

  // selection state
  _selection: SelectionState;

  // undo/redo stack for cell operations (text edits + toolbar formatting)
  _historyManager: HistoryManager;

  // inline cell-edit input overlay
  _cellEditor: CellEditor;

  onSelectionChange?: () => void;

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

  darkMode: boolean = false;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this._canvas = canvas;
    this._ctx = ctx;

    this._rowState = new Row();
    this._colState = new Column();
    this._cellState = new Cell();

    this._selection = new SelectionState();

    this._paintEngine = new PaintEngine(this);

    this._canvasMaths = new CanvasMaths(this);

    this._renderingEngine = new RenderingEngine(this);

    this._resizeEvent = new ResizeRowColumnEvent(this);
    this._canvasScroll = new CanvasScrollEventOpertion();
    // this._selectionManager = new SelectionManager(this);
    this._pointerEventManager = new PointerEventManager(this)

    this._historyManager = new HistoryManager();
    this._cellEditor = new CellEditor(this);
    this.drawInitGrid();
  }

  private async drawInitGrid() {
    this.resizeCanvas();

    window.addEventListener("resize", () => this.resizeCanvas());

    // Grid Render on scroll
    window.addEventListener(
      "wheel",
      (e) => this._canvasScroll.handleWheel(e, this),
      { passive: false },
    );

    window.addEventListener("keydown", (e) => {
      if (this._cellEditor.isEditing) return;
      if (!(e.ctrlKey || e.metaKey)) return;

      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        this._historyManager.undo();
        this.render();
        this.onSelectionChange?.();
      } else if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        this._historyManager.redo();
        this.render();
        this.onSelectionChange?.();
      }
    });
  }

  // Viewport Resize Manger
  private resizeCanvas(): void {
    const rect: DOMRect | undefined =
      this._canvas.parentElement?.getBoundingClientRect();

    if (rect === undefined) {
      throw new Error("Can't get the dimensions of the element");
    }

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