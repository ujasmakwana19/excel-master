export type Range = [number, number]; 

export class SelectionState {
  anchorRow: number | null = null;
  focusRow: number | null = null;
  anchorCol: number | null = null;
  focusCol: number | null = null;

  clear(): void {
    this.anchorRow = null
    this.focusRow = null
    this.anchorCol = null
    this.focusCol = null;
  }

  get rowRange(): Range | null {
    if (this.anchorRow === null || this.focusRow === null) 
      return null;

    return [Math.min(this.anchorRow, this.focusRow), Math.max(this.anchorRow, this.focusRow)];
  }

  get colRange(): Range | null {
    if (this.anchorCol === null || this.focusCol === null) 
      return null;
    return [Math.min(this.anchorCol, this.focusCol), Math.max(this.anchorCol, this.focusCol)];
  }
}