import type { Grid } from "../Grid.js";
import { DarkGridProperties, DefaultGridProperties, type PaintProperties } from "../Grid/PaintProperties.js";
import { SetCellCommand, BatchCommand } from "../Commands.js";
import type { CellValue } from "../DB/cell.js";
import { MAX_CELLS_PER_FORMAT_ACTION } from "../Grid/constants.js";


export function HandleCellPropertiesToolbar(grid: Grid): void {
  const fontFamily = document.getElementById("font-family") as HTMLSelectElement;
  const fontSize = document.getElementById("font-size") as HTMLInputElement;
  const fontColor = document.getElementById("font-color") as HTMLInputElement;
  const bgColor = document.getElementById("bg-color") as HTMLInputElement;

  const applyToSelection = (partial: Partial<PaintProperties>) => {
    const cells = getSelectedCells(grid);
    if (cells.length === 0) return;

    const commands = cells.map(([r, c]) => {
      const before = grid._cellState.getData(r, c);
      const prev: CellValue | undefined = before ? { ...before } : undefined;
      let basis = before?.properties ?? DefaultGridProperties;
      if(grid.darkMode){
        basis = before?.properties ?? DarkGridProperties;
      }
      const next: CellValue = {
        text: before?.text ?? "",
        properties: { ...basis, ...partial },
      };
      return new SetCellCommand(grid._cellState, r, c, prev, next);
    });

    grid._historyManager.do(new BatchCommand(commands));
    grid.render();
    grid.onSelectionChange?.();
    grid._canvas.focus();
  };

  fontFamily.addEventListener("change", () =>
    applyToSelection({ fontstyle: `${fontFamily.value}, sans-serif` }),
  );
  fontSize.addEventListener("change", () => applyToSelection({ fontsize: `${fontSize.value}px` }));
  fontColor.addEventListener("change", () => applyToSelection({ fontcolor: fontColor.value }));
  bgColor.addEventListener("change", () => applyToSelection({ backgroundcolor: bgColor.value }));
}

export function syncToolbarFromSelection(grid: Grid): void {
  const sel = grid._selection;
  if (sel.anchorRow === null || sel.anchorCol === null) return;

  const props = grid._cellState.getData(sel.anchorRow, sel.anchorCol)?.properties;

  const fontFamily = document.getElementById("font-family") as HTMLSelectElement;
  const fontSize = document.getElementById("font-size") as HTMLInputElement;
  const fontColor = document.getElementById("font-color") as HTMLInputElement;
  const bgColor = document.getElementById("bg-color") as HTMLInputElement;

  if (props?.fontstyle) fontFamily.value = props.fontstyle.split(",")[0]!.trim();
  if (props?.fontsize) fontSize.value = props.fontsize.replace("px", "");
  if (props?.fontcolor) fontColor.value = toHexOrKeep(props.fontcolor, fontColor.value);
  if (props?.backgroundcolor) bgColor.value = toHexOrKeep(props.backgroundcolor, bgColor.value);
}


function toHexOrKeep(color: string, fallback: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : fallback;
}

function getSelectedCells(grid: Grid): Array<[number, number]> {
  const sel = grid._selection;
  const cells: Array<[number, number]> = [];

  const rowRange = sel.rowRange;
  const colRange = sel.colRange;

  if (!rowRange || !colRange) return cells;

  const [r1, r2] = rowRange;
  const [c1, c2] = colRange;

  if ((r2 - r1 + 1) * (c2 - c1 + 1) > MAX_CELLS_PER_FORMAT_ACTION) {
    console.warn("Selection too large for a per-cell formatting update; narrow the selection.");
    return cells;
  }

  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) cells.push([r, c]);
  }
  return cells;
}