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