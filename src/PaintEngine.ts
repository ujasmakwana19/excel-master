import type { Grid } from "./Grid.js";
import { getColLabel } from "./GridUtils/constants.js";
import { DarkGridProperties, DarkHeaderProperties, DarkHeaderSelectedProperties, DarkSelectedProperties, DefaultGridProperties, DefaultSelectedProperties, HeaderDefaultGridProperties, HeaderDefaultSelectedGridProperties, type PaintProperties } from "./GridUtils/PaintProperties.js";

export class PaintEngine {
	_grid : Grid

	constructor(grid : Grid){
		this._grid = grid
	}

	drawCell(
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
				headerText = getColLabel(col);
			} else {
				headerText = row.toString();
			}

			this.paintPropertiesOfCells(
					x,
					y,
					specificWidth,
					specificHeight,
					this._grid.darkMode ? DarkHeaderProperties : HeaderDefaultGridProperties,
					headerText
				)
			
		} else {
			const cell = this._grid._cellState.getData(row, col)
			
				this.paintPropertiesOfCells(
					x,
					y,
					specificWidth,
					specificHeight,
					this._grid.darkMode ? DarkGridProperties : DefaultGridProperties,
					cell?.text,
					cell?.properties
				)
			
		}
	}

	drawSelected(
		x : number,
		y : number,
		specificWidth : number,
		specificHeight : number,
		isHeader : boolean
		
	) : void{
		let GridProperty : PaintProperties = this._grid.darkMode ? DarkSelectedProperties : DefaultSelectedProperties
		if(isHeader){
			GridProperty = this._grid.darkMode ? DarkHeaderSelectedProperties : HeaderDefaultSelectedGridProperties
		}

		this._grid._ctx.fillStyle = GridProperty.backgroundcolor;
		this._grid._ctx.fillRect(x, y, specificWidth, specificHeight);

		if(!isHeader){

			this._grid._ctx.strokeStyle = GridProperty.bordercolor;
			this._grid._ctx.lineWidth = GridProperty.borderwidth;
			
			
			const offset = this._grid._ctx.lineWidth % 2 === 0 ? 0 : 0.5;
			
			this._grid._ctx.beginPath();
			this._grid._ctx.rect(
				Math.floor(x) + offset, 
				Math.floor(y) + offset, 
				Math.floor(specificWidth), 
				Math.floor(specificHeight)
			);
			this._grid._ctx.stroke();
		}
	}

	private paintPropertiesOfCells(
		x : number,
		y : number,
		specificWidth : number,
		specificHeight : number,
		DefaultGridProperty : PaintProperties,
		text? :string, 
		properties? : PaintProperties ,
	){
		this._grid._ctx.fillStyle = properties?.backgroundcolor ?? DefaultGridProperty.backgroundcolor;

		this._grid._ctx.fillRect(x, y, specificWidth, specificHeight);

		this._grid._ctx.strokeStyle = properties?.bordercolor ?? DefaultGridProperty.bordercolor;

		this._grid._ctx.lineWidth = properties?.borderwidth ??
		DefaultGridProperty.borderwidth

		this._grid._ctx.strokeRect(x, y, specificWidth, specificHeight);

		this._grid._ctx.fillStyle = properties?.fontcolor ??
		DefaultGridProperty.fontcolor;

		const fontValue : string = `${properties?.fontweight ?? DefaultGridProperty.fontweight} ` + `${properties?.fontsize ?? DefaultGridProperty.fontsize} `+ `${properties?.fontstyle ?? DefaultGridProperty.fontstyle}`
		
		this._grid._ctx.font = fontValue
		this._grid._ctx.textAlign = properties?.textalign ?? DefaultGridProperty.textalign;

		this._grid._ctx.textBaseline = "middle";

		this._grid._ctx.fillText(
				text ?? "",
				x + specificWidth / 2,
				y + specificHeight / 2,
			);
	}
}
