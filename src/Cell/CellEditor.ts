import type { Grid } from "../Grid.js";
import { SelectionMode } from "../Grid/SelectionState.js";
import { SetCellCommand } from "../Commands.js";
import type { CellValue } from "../DB/cell.js";


export class CellEditor {
  private readonly grid: Grid;
  private readonly input: HTMLInputElement;

  private editingRow: number | null = null;
  private editingCol: number | null = null;

  get isEditing(): boolean {
    return this.editingRow !== null;
  }

  constructor(grid: Grid) {
    this.grid = grid;

    this.input = document.createElement("input");
    this.input.type = "text";
    this.input.style.position = "absolute";
    this.input.style.boxSizing = "border-box";
    this.input.style.border = "2px solid #1a73e8";
    this.input.style.outline = "none";
    this.input.style.padding = "0 4px";
    this.input.style.font = "14px Arial, sans-serif";
    this.input.style.display = "none";
    this.input.style.zIndex = "10";

    this.grid._canvas.parentElement?.appendChild(this.input);

    this.input.addEventListener("keydown", (e) => this.handleEditorKeydown(e));
    this.input.addEventListener("blur", () => this.commit());

    this.grid._canvas.addEventListener("dblclick", () => this.handleDoubleClick());
    this.grid._canvas.addEventListener("keydown", (e) => this.handleGridKeydown(e));
  }

  private handleDoubleClick(): void {
    const sel = this.grid._selection;
    if (sel.mode !== SelectionMode.CELL || sel.focusRow === null || sel.focusCol === null) return;
    this.beginEdit(sel.focusRow, sel.focusCol, true);
  }

  private handleGridKeydown(e: KeyboardEvent): void {
    if (this.isEditing) return;

    const sel = this.grid._selection;
    if (sel.mode !== SelectionMode.CELL || sel.focusRow === null || sel.focusCol === null) return;

    if (e.key === "F2" || e.key === "Enter") {
      e.preventDefault();
      this.beginEdit(sel.focusRow, sel.focusCol, true);
      return;
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      this.beginEdit(sel.focusRow, sel.focusCol, false, e.key);
    }
  }

  private beginEdit(row: number, col: number, keepExisting: boolean, initialChar?: string): void {
    const rect = this.grid._canvasMaths.getCellRect(row, col);
    if (!rect) return; 

    const existing = this.grid._cellState.getData(row, col);

    this.editingRow = row;
    this.editingCol = col;

    this.input.style.left = `${rect.x}px`;
    this.input.style.top = `${rect.y}px`;
    this.input.style.width = `${rect.width}px`;
    this.input.style.height = `${rect.height}px`;
    this.input.style.display = "block";
    this.input.style.backgroundColor =
      existing?.properties?.backgroundcolor ?? (this.grid.darkMode ? "#202124" : "#ffffff");
    this.input.style.color = existing?.properties?.fontcolor ?? (this.grid.darkMode ? "#e8eaed" : "#202124");

    this.input.value = initialChar ?? (keepExisting ? existing?.text ?? "" : "");
    this.input.focus();

    const caret = this.input.value.length;
    this.input.setSelectionRange(caret, caret);
  }

  private handleEditorKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter") {
      e.preventDefault();
      this.commit();
      this.moveFocus(1, 0);
    } else if (e.key === "Tab") {
      e.preventDefault();
      this.commit();
      this.moveFocus(0, e.shiftKey ? -1 : 1);
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.cancel();
    }
    
    e.stopPropagation();
  }

  private commit(): void {
    if (this.editingRow === null || this.editingCol === null) return;
    const row = this.editingRow;
    const col = this.editingCol;

    const before = this.grid._cellState.getData(row, col);
    const prev: CellValue | undefined = before ? { ...before } : undefined;
    const text = this.input.value;

    const next: CellValue | undefined =
      text === "" && !before?.properties ? undefined : { text, properties: before?.properties };

    this.hide();
    if (JSON.stringify(prev) === JSON.stringify(next)) {
      return;
    }

    this.grid._historyManager.do(new SetCellCommand(this.grid._cellState, row, col, prev, next));
    this.grid._renderingEngine.renderSingleCell(row, col);
    this.grid.onSelectionChange?.();
  }

  private cancel(): void {
    const row = this.editingRow;
    const col = this.editingCol;
    this.hide();
    if (row !== null && col !== null) {
      this.grid._renderingEngine.renderSingleCell(row, col);
    }
    this.grid._canvas.focus();
  }

  private hide(): void {
    this.input.style.display = "none";
    this.editingRow = null;
    this.editingCol = null;
  }

  private moveFocus(dRow: number, dCol: number): void {
    const sel = this.grid._selection;
    if (sel.focusRow === null || sel.focusCol === null) return;

    const targetRow = Math.max(1, Math.min(this.grid.rowNo, sel.focusRow + dRow));
    const targetCol = Math.max(1, Math.min(this.grid.columnNo, sel.focusCol + dCol));

    sel.mode = SelectionMode.CELL;
    sel.anchorRow = sel.focusRow = targetRow;
    sel.anchorCol = sel.focusCol = targetCol;

    this.grid.render();
    this.grid.onSelectionChange?.();
    this.grid._canvas.focus();
  }
}