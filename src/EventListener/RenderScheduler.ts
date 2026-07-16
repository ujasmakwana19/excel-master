// Coalesces many render requests (e.g. one per pointermove) into a single
// repaint per animation frame. Call `request()` as often as you want —
// only the last-scheduled frame's callback actually runs.
export class RenderScheduler {
  private frameId: number | null = null;

  constructor(private readonly onRender: () => void) {}

  request(): void {
    if (this.frameId !== null) return; // a frame is already pending, do nothing

    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.onRender();
    });
  }

  cancel(): void {
    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
  }
}