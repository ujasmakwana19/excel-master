import { SetCellCommand } from "../GridUtils/Commands.js";
import type { CellValue } from "../DB/cell.js";
import type { Grid } from "../Grid.js";
import { setInputFieldProps, setOnEditCellProps } from "./InputField.js";

export class CellEditor {
	private readonly _grid: Grid;
	private readonly input: HTMLInputElement;

	isEditing : boolean = false

	constructor(grid: Grid) {
		this._grid = grid;

		this.input = document.createElement("input");
		setInputFieldProps(this.input, this._grid.darkMode)

		this._grid._canvas.parentElement?.appendChild(this.input);

		this.input.addEventListener("keydown", (e) => this.handleEditorKeydown(e));
		this.input.addEventListener("blur", () => this.commit());

		this._grid._canvas.addEventListener("dblclick", () => this.beginEdit(true));
		this._grid._canvas.addEventListener("keydown", (e) => this.handleGridKeydown(e));
	}

	private handleGridKeydown(e: KeyboardEvent): void {
		if (this.isEditing) return;

		if (e.key === "F2" || e.key === "Enter") {
			e.preventDefault();
			this.beginEdit(true);
		}
		else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
			e.preventDefault();
			this.beginEdit(false, e.key);
		}
	}

	private beginEdit(keepExisting: boolean, initialChar?: string): void {
		
		const row = this._grid._selection.anchorRow ?? 1
		const col = this._grid._selection.anchorCol ?? 1

		const rect = this._grid._canvasMaths.getCellRect(row, col);
		if (!rect) return;

		this.isEditing = true

		const existing = this._grid._cellState.getData(row, col);
		
		this.input.style.left = `${rect.x}px`;
		this.input.style.top = `${rect.y}px`;
		this.input.style.width = `${rect.width}px`;
		this.input.style.height = `${rect.height}px`;
		this.input.style.display = "block";
		
		setOnEditCellProps(this.input, existing , this._grid.darkMode)

		this.input.value = initialChar ?? (keepExisting ? existing?.text ?? "" : "");
		this.input.focus();

		const caret = this.input.value.length;
		this.input.setSelectionRange(caret, caret);
	}

	private handleEditorKeydown(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			e.preventDefault();
			this.commit();
			this.moveAnchor(1, 0);
		} else if (e.key === "Tab") {
			e.preventDefault();
			this.commit();
			this.moveAnchor(0, e.shiftKey ? -1 : 1);
		} else if (e.key === "Escape") {
			e.preventDefault();
			this.cancel();
		}

		e.stopPropagation();
	}

	private commit(): void {
		const row = this._grid._selection.anchorRow ?? 1
		const col = this._grid._selection.anchorCol ?? 1

		const before = this._grid._cellState.getData(row, col);

		const prev: CellValue | undefined = before ? { ...before } : undefined;
		const text = this.input.value;
		const next: CellValue | undefined =
			text === "" && !before?.properties ? undefined : { text, properties: before?.properties };

		this.hide();

		if (JSON.stringify(prev) === JSON.stringify(next)) {
			this._grid._canvas.focus();
			return;
		}

		this._grid._historyManager.do(new SetCellCommand(this._grid._cellState, row, col, prev, next));
		this._grid._renderingEngine.renderSingleCell(row, col);
		this._grid.onSelectionChange?.();
		this._grid._canvas.focus();
	}

	private cancel(): void {
		const row = this._grid._selection.anchorRow ?? 1
		const col = this._grid._selection.anchorCol ?? 1
		
		this.hide();
		
		if (row !== null && col !== null) {
			this._grid._renderingEngine.renderSingleCell(row, col);
		}

		this._grid._canvas.focus();
	}

	private hide(): void {
		this.input.style.display = "none";
		this.isEditing = false;
	}

	private moveAnchor(dRow: number, dCol: number): void {
		const row = this._grid._selection.anchorRow ?? 1
		const col = this._grid._selection.anchorCol ?? 1

		const targetRow = Math.max(1, Math.min(this._grid.rowNo, row + dRow));
		const targetCol = Math.max(1, Math.min(this._grid.columnNo, col + dCol));

		this._grid._selection.anchorRow = targetRow;
		this._grid._selection.focusRow = targetRow;
		this._grid._selection.anchorCol = targetCol;
		this._grid._selection.focusCol = targetCol;

		this._grid.render();
		this._grid.onSelectionChange?.();
		this._grid._canvas.focus();
	}
}