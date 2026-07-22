import type { Cell, CellValue } from "../States/cell.js";


export interface Command {
  execute(): void;
  undo(): void;
}

export class SetCellCommand implements Command {
  constructor(
    private cellState: Cell,
    private row: number,
    private col: number,
    private prev: CellValue | undefined,
    private next: CellValue | undefined,
  ) {}

  execute(): void {
    this.apply(this.next);
  }

  undo(): void {
    this.apply(this.prev);
  }

  private apply(value: CellValue | undefined): void {
    if (value === undefined || (value.text === "" && value.properties === undefined)) {
      this.cellState.clearCell(this.row, this.col);
    } else {
      this.cellState.setProperties(this.row, this.col, value.text, value.properties);
    }
  }
}


export class BatchCommand implements Command {
  constructor(private commands: Command[]) {}

  execute(): void {
    for (const command of this.commands) command.execute();
  }

  undo(): void {
    for (let i = this.commands.length - 1; i >= 0; i--) 
      this.commands[i]?.undo();
  }
}