import type { Grid } from "../Grid.js"
import { isColumnHeader, isRowHeader } from "../Grid/constants.js"

export function cursorShape(grid : Grid , x : number, y : number) {
        grid._canvas.style.cursor = "default"
        if(isRowHeader(x, y)){            
            if(grid._canvasMaths.getBorderAtY(y) !== -1)
                grid._canvas.style.cursor = "row-resize"
        }
        else if(isColumnHeader(x, y)){
            if(grid._canvasMaths.getBorderAtX(x) !== -1)
                grid._canvas.style.cursor = "col-resize"
        }
    }