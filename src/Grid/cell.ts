import {
	DefaultGridProperties,
	type PaintProperties,
} from "./PaintProperties.js";

export type CellData = {
	[key: string]: {
		text: string;
		properties?: PaintProperties | undefined
	};
};

export class Cell {
	_cellDataCache: CellData = {
		'1-1' : {
			"text" : "Ram",
		},
		'1-2' : {
			"text" : "Keshav"
		}
	};

	get getCells() {
		return this._cellDataCache;
	}

	getData(
		row: number,
		col: number
	) : {text : string , properties? : PaintProperties | undefined} | undefined{

		return this._cellDataCache?.[this.cellId(row, col)];
	}

	setProperties(
		row: number,
		col: number,
		text: string,
		properties?: PaintProperties,
	): void {
		if (
			JSON.stringify(properties) !==
				JSON.stringify(DefaultGridProperties) ||
			text !== undefined ||
			text !== ""
		) {
			this._cellDataCache[this.cellId(row, col)] = {
				text: text,
				properties: properties,
			};
		}
	}

	public cellId(row: number, col: number): string {
		return `${row}` + `-` + `${col}`;
	}
}
