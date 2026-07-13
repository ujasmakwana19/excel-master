export enum SelectionMode {
  NONE = "none",
  CELL = "cell",
  ROW = "row",
  COLUMN = "column",
}

export type Range = [number, number]; 

export class SelectionState {
  mode: SelectionMode = SelectionMode.NONE;

  anchorRow: number | null = null;
  focusRow: number | null = null;
  anchorCol: number | null = null;
  focusCol: number | null = null;
  clear(): void {
    this.mode = SelectionMode.NONE;
    this.anchorRow = this.focusRow = this.anchorCol = this.focusCol = null;
  }

  get rowRange(): Range | null {
    if (this.anchorRow === null || this.focusRow === null) return null;
    return [Math.min(this.anchorRow, this.focusRow), Math.max(this.anchorRow, this.focusRow)];
  }

  get colRange(): Range | null {
    if (this.anchorCol === null || this.focusCol === null) return null;
    return [Math.min(this.anchorCol, this.focusCol), Math.max(this.anchorCol, this.focusCol)];
  }

  isRowSelected(r: number): boolean {
    console.log({anchorRow : this.anchorRow, focusRow : this.focusRow, anchorCol : this.anchorCol, focusCol : this.focusCol });
    if (this.mode !== SelectionMode.ROW) return false;
    const range = this.rowRange;
    if(range !== undefined && range !== null){
      return r >= range[0] && r <= range[1];
    } 
    return false;
  }

  isColSelected(c: number): boolean {
    console.log({anchorRow : this.anchorRow, focusRow : this.focusRow, anchorCol : this.anchorCol, focusCol : this.focusCol });
    if (this.mode !== SelectionMode.COLUMN) return false;
    const range = this.colRange;
    if(range!== undefined && range!== null){
      return c >= range[0] && c <= range[1];
    }
    return false;
  }

  isCellSelected(r: number, c: number): boolean {
    console.log({anchorRow : this.anchorRow, focusRow : this.focusRow, anchorCol : this.anchorCol, focusCol : this.focusCol });
    if (this.mode !== SelectionMode.CELL) return false;
    const rr = this.rowRange;
    const cr = this.colRange;
    return !!rr && !!cr && r >= rr[0] && r <= rr[1] && c >= cr[0] && c <= cr[1];
  }
}