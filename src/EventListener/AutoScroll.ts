import type { Grid } from "../Grid.js";
import { clamp, EDGE_SCROLL_SPEED, thresHoldConstants } from "../Grid/constants.js";
import { type PointerEventManager } from "./PointerEventManager.js";
import type { RenderScheduler } from "./RenderScheduler.js";

export class AutoScroll {
  
  private _grid : Grid
  private _renderScheduler : RenderScheduler

  // It is Used to track the animation going on
  private rafId: number | null = null;
  
  private dx = 0;
  private dy = 0;

  constructor(grid : Grid, renderScheduler : RenderScheduler) {
    this._grid = grid
    this._renderScheduler = renderScheduler
  }

  private scrollBy(dx: number, dy: number): void {
    const maxScrollX = Math.max(0, this._grid.totalWidth - this._grid._canvas.width);
    const maxScrollY = Math.max(0, this._grid.totalHeight - this._grid._canvas.height);

    this._grid.scrollX = clamp(this._grid.scrollX + dx, 0, maxScrollX);
    this._grid.scrollY = clamp(this._grid.scrollY + dy, 0, maxScrollY);

    this._renderScheduler.request();
  }

  updateAutoScroll(x: number, y: number): void {
      let dx = this.edgeScrollDelta(x, this._grid.leftHeaderWidth, this._grid._canvas.width - thresHoldConstants.edge_operation)
      let dy = this.edgeScrollDelta(y, this._grid.topHeaderHeight, this._grid._canvas.height - thresHoldConstants.edge_operation)

      if(y === -1){
        dy = 0
      }
      else if (x === -1){
        dx = 0
      }
      this.update(dx, dy)
    }

    private edgeScrollDelta(pos: number, min: number, max: number): number {
        if (pos < min) return -EDGE_SCROLL_SPEED
        if (pos > max) return EDGE_SCROLL_SPEED
        return 0
    }

  private update(dx: number, dy: number): void {
    this.dx = dx;
    this.dy = dy;

    if ((dx !== 0 || dy !== 0) && this.rafId === null) {
      this.loop();
    } else if (dx === 0 && dy === 0) {
      this.stop();
    }
  }

  private loop = (): void => {
    if (this.dx !== 0 || this.dy !== 0) {
      this.scrollBy(this.dx, this.dy);
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.rafId = null;
    }
  };

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}