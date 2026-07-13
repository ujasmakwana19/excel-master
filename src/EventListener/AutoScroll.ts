// The old ColumnSelection auto-scroll only advanced when `mousemove` fired,
// so dragging to the edge and holding the mouse still would freeze scrolling.
// This ticks continuously via requestAnimationFrame while a non-zero delta
// is set, and stops itself as soon as the delta returns to zero.

export class AutoScroll {
  private rafId: number | null = null;
  private dx = 0;
  private dy = 0;

  constructor(private readonly onTick: (dx: number, dy: number) => void) {}

  update(dx: number, dy: number): void {
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
      this.onTick(this.dx, this.dy);
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