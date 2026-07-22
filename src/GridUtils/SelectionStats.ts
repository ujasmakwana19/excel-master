import type { Grid } from "../Grid.js";
import { getColLabel } from "./constants.js";

export interface SelectionStats {
	count: number;
	sum: number;
	avg: number;
	min: number;
	max: number;
	rangeLabel: string;
	numericCount : number
}

function area(r1: number, r2: number, c1: number, c2: number): number {
	return (r2 - r1 + 1) * (c2 - c1 + 1);
}

export function computeSelectionStats(grid: Grid): SelectionStats {
	const sel = grid._selection;
	const rowRange = sel.rowRange;
	const colRange = sel.colRange;
	
	const data : SelectionStats = {
		count : 0,
		sum : 0,
		avg : 0,
		min : 0,
		max : 0,
		rangeLabel : "None",
		numericCount : 0
	}

	if (rowRange === null && colRange === null) {
		return data
	}
	else if(colRange !== null && rowRange === null){
		const [c1, c2] = colRange;
		const {
			sum,
			avg,
			min,
			max,
			numericCount
		} = grid._cellState.getRowColStats(c1, c2, "ROW")
		
		const rangeLabel : string = `${getColLabel(c1)}:${getColLabel(c2)}`
		
		data.sum = sum
		data.avg = avg
		data.min = min
		data.max = max
		data.rangeLabel = rangeLabel
		data.numericCount = numericCount
	}
	else if(rowRange !== null && colRange === null){		
		const [r1, r2] = rowRange;
		const {
			sum,
			avg,
			min,
			max,
			numericCount
		} = grid._cellState.getRowColStats(r1, r2, "COLUMN")
		
		const rangeLabel : string = `${r1}:${r2}`
		
		data.sum = sum
		data.avg = avg
		data.min = min
		data.max = max
		data.rangeLabel = rangeLabel
		data.numericCount = numericCount
		
	}
	else {
		if (!rowRange || !colRange) {
			return data; 
		}

		const [r1, r2] = rowRange;
		const [c1, c2] = colRange;

		let numericCount = 0;
		let sum = 0;
		let min = Infinity;
		let max = -Infinity;
	
		for (let r = r1; r <= r2; r++) {
			for (let c = c1; c <= c2; c++) {
				const cell = grid._cellState.getCellText(r, c);	
				if(cell === "") continue;

				const value = Number(cell);
				if (Number.isNaN(value)) continue;
	
				numericCount++;
				sum += value;
				min = Math.min(min, value);
				max = Math.max(max, value);
			}
		}
		if(numericCount > 0)
			data.avg = sum / numericCount

		data.count = area(r1, r2, c1, c2)
		data.sum = sum
		data.min = min
		data.max = max
		data.rangeLabel = r1 === r2 && c1 === c2 ? `${getColLabel(c1)}:${r1}` : `${getColLabel(c1)}${r1}:${getColLabel(c2)}${r2}`
		data.numericCount = numericCount
	}
	return data

}

export function renderSelectionStatsToDom(grid: Grid): void {
	const stats = computeSelectionStats(grid);

	const set = (id: string, value: string) => {
		const element = document.getElementById(id);
		if (element) 
			element.textContent = value;
	};

	const fmt = (v: number , numericCount : number): string => {
		if(numericCount <= 0)
			return "-"
		else
			return v.toFixed(2)
	}

	set("metric-range", stats.rangeLabel);
	set("metric-sum", fmt(stats.sum, stats.numericCount));
	set("metric-avg", fmt(stats.avg, stats.numericCount));
	set("metric-min", fmt(stats.min, stats.numericCount));
	set("metric-max", fmt(stats.max, stats.numericCount));
	set("metric-count", String(stats.count));
}