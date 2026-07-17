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