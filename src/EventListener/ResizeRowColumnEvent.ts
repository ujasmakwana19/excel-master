import type { Grid } from "../Grid.js";
import type { RenderingEngine } from "../RenderingEngine.js";

export  class ResizeRowColumnEvent {
    private isResizing: boolean = false;
    private resizeColIndex: number = -1;
    private resizeStartX: number = 0;
    private resizeStartWidth: number = 0;
    private resizeHitTolerance: number = 4;
    

    getColAtX(_canvas : HTMLCanvasElement, _grid : Grid, _renderingEngine : RenderingEngine, scrollX : number , mouseX: number): { colIndex: number; borderX: number } {
        // If inside row-label domain, ignore
        if (mouseX < _grid.leftHeaderWidth) return { colIndex: -1, borderX: -1 };

        const { startCol, endCol } = _renderingEngine.getColBounds(scrollX, _canvas.width);
        
        // Find absolute coordinates of the visible column starting position
        let currentAbsoluteX = _grid.leftHeaderWidth;
        for (let c = 1; c < startCol; c++) {
            currentAbsoluteX += _grid._colState._colDataCache?.[c]?.width ?? _grid.cellWidth;
        }

        for (let c = startCol; c <= endCol; c++) {
            const colWidth = _grid._colState._colDataCache?.[c]?.width ?? _grid.cellWidth;
            const colRightScreenX = currentAbsoluteX + colWidth - scrollX ;

            // Check if mouse is hovering within tolerance range of the right border
            if (Math.abs(mouseX - colRightScreenX) <= this.resizeHitTolerance) {
                return { colIndex: c, borderX: colRightScreenX };
            }
            currentAbsoluteX += colWidth;
        }

        return { colIndex: -1, borderX: -1 };
    }

    handleMouseDown(_canvas : HTMLCanvasElement, _grid : Grid, _renderingEngine : RenderingEngine, scrollX : number , event: MouseEvent) {
        const rect = _canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        // Resizing is only valid inside the top header row
        if (mouseY <= _grid.cellHeight) {
            const { colIndex } = this.getColAtX(_canvas, _grid, _renderingEngine, scrollX, mouseX);
            if (colIndex !== -1) {
                this.isResizing = true;
                this.resizeColIndex = colIndex;
                this.resizeStartX = event.clientX;
                this.resizeStartWidth = _grid._colState._colDataCache?.[colIndex]?.width ?? _grid.cellWidth;
                event.preventDefault();
            }
        }
    }

    handleMouseMove(_canvas : HTMLCanvasElement, _grid : Grid, _renderingEngine : RenderingEngine, scrollX : number ,event: MouseEvent) {
        const rect = _canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (this.isResizing) {
            // Track displacement delta distance
            const deltaX = event.clientX - this.resizeStartX;
            // Restrict minimum column size to 30px
            const newWidth = Math.max(30, this.resizeStartWidth + deltaX);

            // Update column state cache dynamically 
            _grid._colState.setProperties(this.resizeColIndex, newWidth);
            _grid.render();
            return;
        }

        // Dynamic Cursor styling over boundaries
        if (mouseY <= _grid.cellHeight) {
            const { colIndex } = this.getColAtX(_canvas, _grid, _renderingEngine, scrollX, mouseX);
            _canvas.style.cursor = colIndex !== -1 ? 'col-resize' : 'default';
        } else {
            _canvas.style.cursor = 'default';
        }
    }

     handleMouseUp() {
        if (this.isResizing) {
            this.isResizing = false;
            this.resizeColIndex = -1;
        }

    
    }
}