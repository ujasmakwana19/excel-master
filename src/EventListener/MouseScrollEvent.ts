import type { Grid } from "../Grid.js";

export class MouseScrollEventOpertion{

    handleWheel(event: WheelEvent, _grid : Grid) {
        event.preventDefault(); 
        
        const previousScrollX = _grid.scrollX;
        const previousScrollY = _grid.scrollY;
        
        let targetX = _grid.scrollX + event.deltaX;
        let targetY = _grid.scrollY + event.deltaY;

        const maxScrollX = Math.max(0, (_grid.totalWidth) - _grid._canvas.width);
        const maxScrollY = Math.max(0, (_grid.totalHeight) - _grid._canvas.height);

        targetX = Math.min(Math.max(0, targetX), maxScrollX);
        targetY = Math.min(Math.max(0, targetY), maxScrollY);
        
        if (targetX === previousScrollX && targetY === previousScrollY) {
            return; 
        }
        
        _grid.scrollX = targetX;
        _grid.scrollY = targetY;

        _grid.render()
    }

}