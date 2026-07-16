import type { Grid } from "../Grid.js";
import { EDGE_SCROLL_SPEED } from "../Grid/constants.js";
import { SelectionMode } from "../Grid/SelectionState.js";
import { AutoScroll } from "./AutoScroll.js";
import { RenderScheduler } from "./RenderScheduler.js";

type Region = "topHeader" | "leftHeader" | "body" | "outside";

interface SelectionAxes {
  row: boolean;
  col: boolean;
}

interface HitResult {
  mode: SelectionMode;
  row?: number;
  col?: number;
}

// This table is the whole point of the refactor. ROW/COLUMN/CELL behavior
// used to be a hardcoded if/else chain copy-pasted in three places
// (mousedown region check, mousemove hit-testing, keyboard nav). Now every
// one of those places just asks "does this mode care about rows / cols?"
const SELECTION_AXES: Record<SelectionMode, SelectionAxes> = {
  [SelectionMode.ROW]: { row: true, col: false },
  [SelectionMode.COLUMN]: { row: false, col: true },
  [SelectionMode.CELL]: { row: true, col: true },
  [SelectionMode.NONE]: { row: false, col: false },
};

const ARROW_DELTAS: Record<string, [number, number]> = {
  ArrowRight: [0, 1],
  ArrowLeft: [0, -1],
  ArrowDown: [1, 0],
  ArrowUp: [-1, 0],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class SelectionManager {
  private readonly _grid: Grid;
  private readonly _autoScroll: AutoScroll;
  private readonly _renderScheduler: RenderScheduler;
  private _isDragging = false;
  private _activePointerId: number | null = null;

  constructor(grid: Grid) {
    this._grid = grid;
    this._autoScroll = new AutoScroll((dx, dy) => this.scrollBy(dx, dy));

    // Every render-triggering path (drag, autoscroll, keyboard) now goes
    // through this one scheduler instead of calling grid.render() directly.
    this._renderScheduler = new RenderScheduler(() => {
      this._grid.render();
      this._grid.onSelectionChange?.();
    });

    this.initKeyboardEvents();
  }

  // ==========================================
  // Pointer Down — start a selection
  // ==========================================
  handlePointerDown(e: PointerEvent): void {
    // 
    this._grid._canvas.focus();

    const point = this.getPointerCoords(e);
    const region = this.classifyRegion(point.x, point.y);
    const hit = this.hitTestForRegion(region, point.x, point.y);
    if (hit === null) return;

    this.beginSelection(hit.mode, e.shiftKey, hit.row, hit.col);
    this.startDrag(e);
  }

  // Pure geometry — which zone of the grid was clicked. No selection logic here.
  private classifyRegion(x: number, y: number): Region {
    const inTopHeader = y <= this._grid.topHeaderHeight && x > this._grid.leftHeaderWidth;
    const inLeftHeader = x <= this._grid.leftHeaderWidth && y > this._grid.topHeaderHeight;
    const inBody = x > this._grid.leftHeaderWidth && y > this._grid.topHeaderHeight;

    if (inTopHeader) return "topHeader";
    if (inLeftHeader) return "leftHeader";
    if (inBody) return "body";
    return "outside";
  }

  // Turns a region into a concrete (mode, row?, col?) hit, or null if the
  // click landed on empty space past the last real row/col.
  private hitTestForRegion(region: Region, x: number, y: number): HitResult | null {
    if (region === "topHeader") {
      const { colIndex } = this._grid._canvasMaths.getColAtX(x, false);
      return colIndex === -1 ? null : { mode: SelectionMode.COLUMN, col: colIndex };
    }

    if (region === "leftHeader") {
      const { rowIndex } = this._grid._canvasMaths.getRowAtY(y, false);
      return rowIndex === -1 ? null : { mode: SelectionMode.ROW, row: rowIndex };
    }

    if (region === "body") {
      const { colIndex } = this._grid._canvasMaths.getColAtX(x, false);
      const { rowIndex } = this._grid._canvasMaths.getRowAtY(y, false);
      if (colIndex === -1 || rowIndex === -1) return null;
      return { mode: SelectionMode.CELL, row: rowIndex, col: colIndex };
    }

    return null;
  }

  private beginSelection(mode: SelectionMode, extend: boolean, row?: number, col?: number): void {
    const sel = this._grid._selection;
    const sameModeExtend = extend && sel.mode === mode;

    if (sameModeExtend) {
      // Shift+click: keep the existing anchor, move only the focus end.
      if (row !== undefined) sel.focusRow = row;
      if (col !== undefined) sel.focusCol = col;
      return;
    }

    sel.mode = mode;
    if (row !== undefined) {
      sel.anchorRow = row;
      sel.focusRow = row;
    }
    if (col !== undefined) {
      sel.anchorCol = col;
      sel.focusCol = col;
    }
  }

  private startDrag(e: PointerEvent): void {
    this._isDragging = true;
    this._activePointerId = e.pointerId;

    // Pointer capture replaces the old window-level mousemove/mouseup hack.
    // All further pointer events for this pointerId route to the canvas
    // even if the cursor leaves it mid-drag — no manual listener cleanup risk.
    this._grid._canvas.setPointerCapture(e.pointerId);
    this._grid._canvas.addEventListener("pointermove", this.handlePointerMove);
    this._grid._canvas.addEventListener("pointerup", this.handlePointerUp);
    this._grid._canvas.addEventListener("pointercancel", this.handlePointerUp);

    this._renderScheduler.request();
  }

  // ==========================================
  // Pointer Move — drag to extend selection
  // ==========================================
  private handlePointerMove = (e: PointerEvent): void => {
    if (!this._isDragging) return;

    const point = this.getPointerCoords(e);
    this.updateAutoScroll(point.x, point.y);
    this.extendToPoint(point.x, point.y);
  };

  private updateAutoScroll(x: number, y: number): void {
    const axes = SELECTION_AXES[this._grid._selection.mode];

    const dx = axes.col ? this.edgeScrollDelta(x, this._grid.leftHeaderWidth, this._grid._canvas.width) : 0;
    const dy = axes.row ? this.edgeScrollDelta(y, this._grid.topHeaderHeight, this._grid._canvas.height) : 0;

    this._autoScroll.update(dx, dy);
  }

  private edgeScrollDelta(pos: number, min: number, max: number): number {
    if (pos < min) return -EDGE_SCROLL_SPEED;
    if (pos > max) return EDGE_SCROLL_SPEED;
    return 0;
  }

  private extendToPoint(x: number, y: number): void {
    const sel = this._grid._selection;
    const axes = SELECTION_AXES[sel.mode];

    // Clamp into the body so a drag past the edge still resolves to the
    // last real row/col — AutoScroll is what actually moves the viewport.
    const clampedX = clamp(x, this._grid.leftHeaderWidth, this._grid._canvas.width - 1);
    const clampedY = clamp(y, this._grid.topHeaderHeight, this._grid._canvas.height - 1);

    if (axes.col) {
      const { colIndex } = this._grid._canvasMaths.getColAtX(clampedX, false);
      if (colIndex !== -1) sel.focusCol = colIndex;
    }

    if (axes.row) {
      const { rowIndex } = this._grid._canvasMaths.getRowAtY(clampedY, false);
      if (rowIndex !== -1) sel.focusRow = rowIndex;
    }

    // No direct render() call — this can fire 100+ times/sec during a drag.
    this._renderScheduler.request();
  }

  private scrollBy(dx: number, dy: number): void {
    const maxScrollX = Math.max(0, this._grid.totalWidth - this._grid._canvas.width);
    const maxScrollY = Math.max(0, this._grid.totalHeight - this._grid._canvas.height);

    this._grid.scrollX = clamp(this._grid.scrollX + dx, 0, maxScrollX);
    this._grid.scrollY = clamp(this._grid.scrollY + dy, 0, maxScrollY);

    this._renderScheduler.request();
  }

  private handlePointerUp = (): void => {
    this._isDragging = false;
    this._autoScroll.stop();

    if (this._activePointerId !== null) {
      this._grid._canvas.releasePointerCapture(this._activePointerId);
      this._activePointerId = null;
    }

    this._grid._canvas.removeEventListener("pointermove", this.handlePointerMove);
    this._grid._canvas.removeEventListener("pointerup", this.handlePointerUp);
    this._grid._canvas.removeEventListener("pointercancel", this.handlePointerUp);
  };

  // ==========================================
  // Keyboard — shift+arrow range extension
  // ==========================================
  private initKeyboardEvents(): void {
    if (!this._grid._canvas.hasAttribute("tabindex")) {
      this._grid._canvas.setAttribute("tabindex", "0");
    }

    this._grid._canvas.addEventListener("keydown", (e: KeyboardEvent) => this.handleKeyDown(e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const sel = this._grid._selection;

    if (e.key === "Escape") {
      sel.clear();
      this._renderScheduler.request();
      return;
    }

    const delta = ARROW_DELTAS[e.key];
    if (!delta || sel.mode === SelectionMode.NONE) return;

    const axes = SELECTION_AXES[sel.mode];
    const [dRow, dCol] = delta;

    // Same idea as before: ROW mode ignores left/right, COLUMN mode ignores
    // up/down — but expressed as one axis check instead of a 3-way if/else.
    if (dRow !== 0 && !axes.row) return;
    if (dCol !== 0 && !axes.col) return;

    e.preventDefault();

    const target = this.computeArrowTarget(e.shiftKey, dRow, dCol, axes);
    this.moveSelection(e.shiftKey, target.row, target.col);

    if (target.row !== undefined) this.ensureRowVisible(target.row);
    if (target.col !== undefined) this.ensureColVisible(target.col);

    this._renderScheduler.request();
  }

  private computeArrowTarget(
    extend: boolean,
    dRow: number,
    dCol: number,
    axes: SelectionAxes,
  ): { row?: number; col?: number } {
    const sel = this._grid._selection;
    const target: { row?: number; col?: number } = {};

    if (axes.row) {
      const base = extend ? sel.focusRow! : sel.anchorRow!;
      target.row = clamp(base + dRow, 1, this._grid.rowNo);
    }

    if (axes.col) {
      const base = extend ? sel.focusCol! : sel.anchorCol!;
      target.col = clamp(base + dCol, 1, this._grid.columnNo);
    }

    return target;
  }

  private moveSelection(extend: boolean, row?: number, col?: number): void {
    const sel = this._grid._selection;

    if (!extend) {
      if (row !== undefined) sel.anchorRow = row;
      if (col !== undefined) sel.anchorCol = col;
    }
    if (row !== undefined) sel.focusRow = row;
    if (col !== undefined) sel.focusCol = col;
  }

  // ==========================================
  // Visibility helpers (scroll the target into view)
  // ==========================================
  // Both walk only the *sparse* custom-size cache rather than looping from
  // row/col 1 up to the target — jumping to row 90,000 via keyboard is
  // O(number of resized rows), not O(90,000).
  private widthUpToCol(colIndex: number): number {
    const { sum, count } = this.sumCustomSizes(this._grid._colState._colDataCache, colIndex, "width");
    const defaultCols = colIndex - 1 - count;
    return this._grid.leftHeaderWidth + sum + defaultCols * this._grid.cellWidth;
  }

  private heightUpToRow(rowIndex: number): number {
    const { sum, count } = this.sumCustomSizes(this._grid._rowState._rowDataCache, rowIndex, "height");
    const defaultRows = rowIndex - 1 - count;
    return this._grid.topHeaderHeight + sum + defaultRows * this._grid.cellHeight;
  }

  // Shared by widthUpToCol/heightUpToRow — used to be two near-identical
  // hand-rolled loops, now one loop parameterized by which size key to read.
  private sumCustomSizes(
    cache: Record<number, { width?: number; height?: number }>,
    upToIndex: number,
    sizeKey: "width" | "height",
  ): { sum: number; count: number } {
    let sum = 0;
    let count = 0;

    for (const key in cache) {
      const index = Number(key);
      if (index < upToIndex) {
        sum += cache[index]![sizeKey]!;
        count++;
      }
    }

    return { sum, count };
  }

  private ensureColVisible(colIndex: number): void {
    const x = this.widthUpToCol(colIndex) - this._grid.leftHeaderWidth;
    const colWidth = this._grid._colState._colDataCache?.[colIndex]?.width ?? this._grid.cellWidth;
    const viewWidth = this._grid._canvas.width - this._grid.leftHeaderWidth;

    if (x < this._grid.scrollX) {
      this._grid.scrollX = x;
    } else if (x + colWidth > this._grid.scrollX + viewWidth) {
      this._grid.scrollX = x + colWidth - viewWidth;
    }
  }

  private ensureRowVisible(rowIndex: number): void {
    const y = this.heightUpToRow(rowIndex) - this._grid.topHeaderHeight;
    const rowHeight = this._grid._rowState._rowDataCache?.[rowIndex]?.height ?? this._grid.cellHeight;
    const viewHeight = this._grid._canvas.height - this._grid.topHeaderHeight;

    if (y < this._grid.scrollY) {
      this._grid.scrollY = y;
    } else if (y + rowHeight > this._grid.scrollY + viewHeight) {
      this._grid.scrollY = y + rowHeight - viewHeight;
    }
  }

  private getPointerCoords(e: PointerEvent): { x: number; y: number } {
    const rect = this._grid._canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}