import type { Grid } from "../Grid.js"

export class PointerEventManager {
    private _grid : Grid
    
    constructor(grid : Grid) {
        this._grid = grid
        this.initPointerListener()
    }

    // helper to get the calculated coordinates
    private getPointerCoords(e: PointerEvent): { x: number; y: number } {
        const rect = this._grid._canvas.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }


    initPointerListener() {

    }


}