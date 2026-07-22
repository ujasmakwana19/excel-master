import {
	DefaultGridProperties,
	type PaintProperties,
} from "../GridUtils/PaintProperties.js";

export type CellValue = {
	text: string;
	properties?: PaintProperties | undefined;
};

export type CellData = {
	[key: string]: CellValue;
};

export class Cell {
	private _cellDataCache: CellData = {};

	constructor(){
		this._cellDataCache = {}
	}

	get getCells() {
		return this._cellDataCache;
	}

	getCellText(
		row: number,
		col: number) : string {
			return this._cellDataCache?.[this.cellId(row, col)]?.text ?? "";
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

	clearCell(row: number, col: number): void {
		delete this._cellDataCache[this.cellId(row, col)];
	}

	public cellId(row: number, col: number): string {
		return `${row}` + `-` + `${col}`;
	}

	public getRowColStats(start : number , end : number, forKey : string) : { 
		sum : number , 
		avg : number, 
		min : number , 
		max : number ,
		numericCount : number
	}{
		let sum : number = 0
		let min : number = Infinity
		let max : number = -Infinity
		let numericCount : number = 0
		let avg = 0

		if(this._cellDataCache === undefined){
			return {sum, avg, min, max, numericCount}
		}
		
		for (const key in this._cellDataCache) {
			if (!Object.hasOwn(this._cellDataCache, key)) continue;
			let index : number = 0
			
			if(forKey === "ROW")
				index = Number(key.split('-')[1])
			else if (forKey === "COLUMN")
				index = Number(key.split('-')[0])
			else
				break

			if(index >= start && index <= end){
				const element = Number(this._cellDataCache[key]?.text ?? "")

				if(Number.isNaN(element)) continue;

				sum += element
				numericCount ++
				min = Math.min(min, element)
				max = Math.max(max, element)
			}
		}

		if(numericCount > 0)
			avg = 0
		avg = sum / numericCount
		return {sum, avg, min, max, numericCount}
	}
}