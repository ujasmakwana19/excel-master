import {
	DefaultGridProperties,
	type PaintProperties,
} from "../Grid/PaintProperties.js";

export type CellValue = {
	text: string;
	properties?: PaintProperties | undefined;
};

export type CellData = {
	[key: string]: CellValue;
};

export class Cell {
	_cellDataCache: CellData = {
	};

	get getCells() {
		return this._cellDataCache;
	}


	getData(
		row: number,
		col: number
	) : CellValue | undefined{

		return this._cellDataCache?.[this.cellId(row, col)];
	}
	setProperties(
		row: number,
		col: number,
		text: string,
		properties?: PaintProperties,
	): void {
		if (text === "" && properties === undefined) {
			this.clearCell(row, col);
			return;
		}

		this._cellDataCache[this.cellId(row, col)] = {
			text: text,
			properties: properties,
		};
	}

	setCellProperties(
		row: number,
		col: number,
		properties: Partial<PaintProperties>,
	): void {
		const existing = this._cellDataCache[this.cellId(row, col)];
		this._cellDataCache[this.cellId(row, col)] = {
			text: existing?.text ?? "",
			properties: { ...(existing?.properties ?? DefaultGridProperties), ...properties },
		};
	}

	clearCell(row: number, col: number): void {
		delete this._cellDataCache[this.cellId(row, col)];
	}

	public cellId(row: number, col: number): string {
		return `${row}` + `-` + `${col}`;
	}
}