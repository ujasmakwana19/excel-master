import type { Grid } from "../Grid.js";
import { SelectionMode } from "./SelectionState.js";

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
  let numericCount = 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  let count = 0;
  let rangeLabel = "None";

  const visit = (r: number, c: number): void => {
    const cell = grid._cellState.getData(r, c);
    if (!cell || cell.text === "") return;
    const value = Number(cell.text);
    if (!Number.isNaN(value)) {
      numericCount++;
      sum += value;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  };

  if (sel.mode === SelectionMode.CELL && sel.rowRange && sel.colRange) {
    const [r1, r2] = sel.rowRange;
    const [c1, c2] = sel.colRange;

    count = area(r1, r2, c1, c2);
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) visit(r, c);
    }
    rangeLabel = r1 === r2 && c1 === c2 ? `R${r1}C${c1}` : `R${r1}C${c1}:R${r2}C${c2}`;

  } else if (sel.mode === SelectionMode.COLUMN && sel.colRange) {
    const [c1, c2] = sel.colRange;

    count = area(1, grid.rowNo, c1, c2);
    for (const key in grid._cellState.getCells) {
      const [r, c]  = key.split("-").map(Number);
      if(r === undefined || c === undefined)
          continue;
        if (c >= c1 && c <= c2) visit(r, c);
    }
    rangeLabel = c1 === c2 ? `Col ${c1}` : `Col ${c1}:${c2}`;
  } else if (sel.mode === SelectionMode.ROW && sel.rowRange) {
    const [r1, r2] = sel.rowRange;
    count = area(r1, r2, 1, grid.columnNo);
    for (const key in grid._cellState.getCells) {
      const [r, c] = key.split("-").map(Number);
      if(r === undefined || c === undefined)
          continue;
      if (r >= r1 && r <= r2) visit(r, c);
    }
    rangeLabel = r1 === r2 ? `Row ${r1}` : `Row ${r1}:${r2}`;
  }

  const hasNumeric = numericCount > 0;

  return {
    count,
    sum: hasNumeric ? sum : null,
    avg: hasNumeric ? sum / numericCount : null,
    min: hasNumeric ? min : null,
    max: hasNumeric ? max : null,
    rangeLabel,
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