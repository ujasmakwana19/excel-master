import type { Grid } from "../Grid.js";

export interface SelectionStats {
	count: number;
	sum: number | null;
	avg: number | null;
	min: number | null;
	max: number | null;
	rangeLabel: string;
}

function area(r1: number, r2: number, c1: number, c2: number): number {
	return (r2 - r1 + 1) * (c2 - c1 + 1);
}

export function computeSelectionStats(grid: Grid): SelectionStats {
	const sel = grid._selection;
	const rowRange = sel.rowRange;
	const colRange = sel.colRange;

	if (!rowRange || !colRange) {
		return {
			count: 0,
			sum: null,
			avg: null,
			min: null,
			max: null,
			rangeLabel: "None",
		};
	}

	const [r1, r2] = rowRange;
	const [c1, c2] = colRange;

	let numericCount = 0;
	let sum = 0;
	let min = Infinity;
	let max = -Infinity;

	for (let r = r1; r <= r2; r++) {
		for (let c = c1; c <= c2; c++) {
			const cell = grid._cellState.getData(r, c);
			if (!cell || cell.text === "") continue;

			const value = Number(cell.text);
			if (Number.isNaN(value)) continue;

			numericCount++;
			sum += value;
			min = Math.min(min, value);
			max = Math.max(max, value);
		}
	}

	const hasNumeric = numericCount > 0;

	return {
		count: area(r1, r2, c1, c2),
		sum: hasNumeric ? sum : null,
		avg: hasNumeric ? sum / numericCount : null,
		min: hasNumeric ? min : null,
		max: hasNumeric ? max : null,
		rangeLabel: r1 === r2 && c1 === c2 ? `R${r1}C${c1}` : `R${r1}C${c1}:R${r2}C${c2}`,
	};
}

export function renderSelectionStatsToDom(grid: Grid): void {
	const stats = computeSelectionStats(grid);

	const set = (id: string, value: string) => {
		const el = document.getElementById(id);
		if (el) el.textContent = value;
	};

	const fmt = (v: number | null): string => (v === null ? "-" : v.toFixed(2));

	set("metric-range", stats.rangeLabel);
	set("metric-sum", fmt(stats.sum));
	set("metric-avg", fmt(stats.avg));
	set("metric-min", fmt(stats.min));
	set("metric-max", fmt(stats.max));
	set("metric-count", String(stats.count));
}