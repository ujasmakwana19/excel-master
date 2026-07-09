export class PaintEngine {
	drawCell(
		_ctx: CanvasRenderingContext2D,
		row: number,
		col: number,
		x: number,
		y: number,
		isHeader: boolean = false,
		specificWidth: number,
		specificHeight: number,
	) {
		if (isHeader) {
			// Excel-style gray background headers
			_ctx.fillStyle = "#f8f9fa";

			_ctx.fillRect(x, y, specificWidth, specificHeight);

			_ctx.strokeStyle = "#b0b3b8";
			_ctx.lineWidth = 2;
			_ctx.strokeRect(x, y, specificWidth, specificHeight);

			_ctx.fillStyle = "#444444";
			let val: string = "bold " + "13px " + "sans-serif";
			_ctx.font = val;
			_ctx.textAlign = "center";
			_ctx.textBaseline = "middle";

			let headerText = "";
			if (row === 0 && col === 0) {
				headerText = "";
			} else if (row === 0) {
				headerText = this.getColLabel(col);
			} else {
				headerText = row.toString();
			}

			_ctx.fillText(
				headerText,
				x + specificWidth / 2,
				y + specificHeight / 2,
			);
		} else {
			// Standard data grid cells
			_ctx.fillStyle = "#ffffff";
			_ctx.fillRect(x, y, specificWidth, specificHeight);

			_ctx.strokeStyle = "#e2e3e5";
			_ctx.lineWidth = 1;
			_ctx.strokeRect(x, y, specificWidth, specificHeight);

			_ctx.fillStyle = "#1a1a1a";
			_ctx.font = "13px sans-serif";
			_ctx.textAlign = "center";
			_ctx.textBaseline = "middle";

			_ctx.fillText(
				`R${row} C${col}`,
				x + specificWidth / 2,
				y + specificHeight / 2,
			);
		}
	}

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
