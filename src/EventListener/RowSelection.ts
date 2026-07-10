import type { Grid } from "../Grid.js"

export class RowSelection {

    _grid : Grid
    
    constructor(grid : Grid){
        this._grid = grid
    }
        
    selectColumn(e : MouseEvent) : void {

        const rect = this._grid._canvas.getBoundingClientRect();

        const mouseX = e.clientX - rect.left
        const mouseY = e.clientY - rect.top

        if(mouseX <= this._grid.leftHeaderWidth){
            const {colIndex} = this._grid._canvasMaths.getColAtX(mouseX, false)
            console.log(colIndex);
            
            
            this._grid._colSelected.clear()
            this._grid._colSelected.add(colIndex)

            this._grid.render()

        }
    }
}