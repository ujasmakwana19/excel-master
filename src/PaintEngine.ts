import type { Grid } from "./Grid.js";
import { DefaultGridProperties, HeaderDefaultGridProperties, type PaintProperties } from "./Grid/PaintProperties.js";

export class PaintEngine {
	_grid : Grid

	constructor(grid : Grid){
		this._grid = grid
	}

	drawCell(
		_ctx: CanvasRenderingContext2D,
		row: number, // x index
		col: number, // y index
		x: number, // X - px coordinate 
		y: number, // Y - px coordinate
		
		isHeader: boolean = false,
		specificWidth: number,
		specificHeight: number,
	) {
		if (isHeader) {
			let headerText = "";
			if (row === 0 && col === 0) {
				headerText = "";
			} else if (row === 0) {
				headerText = this.getColLabel(col);
			} else {
				headerText = row.toString();
			}

			this.paintPropertiesOfCells(
					_ctx,
					x,
					y,
					specificWidth,
					specificHeight,
					HeaderDefaultGridProperties,
					headerText
				)
			
		} else {
			const cell = this._grid._cellState.getData(row, col)
			
			console.log(cell);
			
			
				this.paintPropertiesOfCells(
					_ctx,
					x,
					y,
					specificWidth,
					specificHeight,
					DefaultGridProperties,
					cell?.text,
					cell?.properties
				)
			
		}
	}

	private paintPropertiesOfCells(
		_ctx : CanvasRenderingContext2D,
		x : number,
		y : number,
		specificWidth : number,
		specificHeight : number,
		DefaultGridProperty : PaintProperties,
		text? :string, 
		properties? : PaintProperties ,
	){
		_ctx.fillStyle = properties?.backgroundcolor ?? DefaultGridProperty.backgroundcolor;

		_ctx.fillRect(x, y, specificWidth, specificHeight);

		_ctx.strokeStyle = properties?.bordercolor ?? DefaultGridProperty.bordercolor;

		_ctx.lineWidth = properties?.borderwidth ??
		DefaultGridProperty.borderwidth

		_ctx.strokeRect(x, y, specificWidth, specificHeight);

		_ctx.fillStyle = properties?.fontcolor ??
		DefaultGridProperty.fontcolor;

		const fontValue : string = `${properties?.fontweight ?? DefaultGridProperty.fontweight} ` + `${properties?.fontsize ?? DefaultGridProperty.fontsize} `+ `${properties?.fontstyle ?? DefaultGridProperty.fontstyle}`
		
		_ctx.font = fontValue
		_ctx.textAlign = properties?.textalign ?? DefaultGridProperty.textalign;

		_ctx.textBaseline = "middle";

		_ctx.fillText(
				text ?? "",
				x + specificWidth / 2,
				y + specificHeight / 2,
			);
	}

	// To make the column as the A, B, C, AB, ...
	private getColLabel(colIndex: number): string {
		let label = "";
		let temp = colIndex;
		while (temp > 0) {
			let modulo = (temp - 1) % 26;
			label = String.fromCharCode(65 + modulo) + label;
			temp = Math.floor((temp - modulo) / 26);
		}
		return label;
	}
}
