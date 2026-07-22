import { HandleLoadJsonData, HandleDarkModeToggle } from "./EventListener/htmlEventListener.js";
import { Grid } from "./Grid.js";
import { renderSelectionStatsToDom } from "./GridUtils/SelectionStats.js";
import { HandleCellPropertiesToolbar, syncToolbarFromSelection } from "./Cell/Cellproperties.js";

class Main {
	_canvas: HTMLCanvasElement;
	constructor(canvas: HTMLCanvasElement) {
		this._canvas = canvas;
	}

	get get2DContext(): CanvasRenderingContext2D {
		if (!this._canvas) {
			throw new Error("Canvas element not found!");
		}

		const ctx = this._canvas.getContext("2d") as CanvasRenderingContext2D;
		if (!ctx) {
			throw new Error(
				"2D context not supported or failed to initialize.",
			);
		}
		return ctx;
	}
}

// Instantiate
// Safely access the canvas element and create the grid when the DOM is fully loaded
window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
    
    if (!canvas) {
        console.error("Failed to find canvas element with ID 'myCanvas'");
        return;
    }

    const paintContext: CanvasRenderingContext2D = new Main(canvas).get2DContext;
    const gridBuilder : Grid = new Grid(canvas, paintContext);

	HandleLoadJsonData(gridBuilder)
	HandleDarkModeToggle(gridBuilder)
	HandleCellPropertiesToolbar(gridBuilder)
	renderSelectionStatsToDom(gridBuilder)

	gridBuilder.onSelectionChange = () => {
		renderSelectionStatsToDom(gridBuilder);
		syncToolbarFromSelection(gridBuilder);
	};
});