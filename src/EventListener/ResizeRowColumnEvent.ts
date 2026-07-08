// export  class ResizeRowColumnEvent {
//     private isResizing: boolean = false;
//     private resizeColIndex: number = -1;
//     private resizeStartX: number = 0;
//     private resizeStartWidth: number = 0;
//     private resizeHitTolerance: number = 4;
    

//          getColAtX(_canvas : HTMLCanvasElement, scrollX : number , mouseX: number): { colIndex: number; borderX: number } {
//         // If inside row-label domain, ignore
//         if (mouseX < this.cellWidth) return { colIndex: -1, borderX: -1 };

//         const { startCol, endCol } = this.getColBounds(scrollX, _canvas.width);
        
//         // Find absolute coordinates of the visible column starting position
//         let currentAbsoluteX = 0;
//         for (let c = 1; c < startCol; c++) {
//             currentAbsoluteX += this._colState._colDataCache?.[c]?.width ?? this.cellWidth;
//         }

//         for (let c = startCol; c <= endCol; c++) {
//             const colWidth = this._colState._colDataCache?.[c]?.width ?? this.cellWidth;
//             const colRightScreenX = currentAbsoluteX + colWidth - scrollX + this.cellWidth;

//             // Check if mouse is hovering within tolerance range of the right border
//             if (Math.abs(mouseX - colRightScreenX) <= this.resizeHitTolerance) {
//                 return { colIndex: c, borderX: colRightScreenX };
//             }
//             currentAbsoluteX += colWidth;
//         }

//         return { colIndex: -1, borderX: -1 };
//     }

//          handleMouseDown(_canvas : HTMLCanvasElement,scrollX : number , event: MouseEvent) {
//         const rect = _canvas.getBoundingClientRect();
//         const mouseX = event.clientX - rect.left;
//         const mouseY = event.clientY - rect.top;

//         // Resizing is only valid inside the top header row
//         if (mouseY <= this.cellHeight) {
//             const { colIndex } = this.getColAtX(_canvas, scrollX, mouseX);
//             if (colIndex !== -1) {
//                 this.isResizing = true;
//                 this.resizeColIndex = colIndex;
//                 this.resizeStartX = event.clientX;
//                 this.resizeStartWidth = this._colState._colDataCache?.[colIndex]?.width ?? this.cellWidth;
//                 event.preventDefault();
//             }
//         }
//     }

//      handleMouseMove(_canvas : HTMLCanvasElement, scrollX : number ,event: MouseEvent) {
//         const rect = _canvas.getBoundingClientRect();
//         const mouseX = event.clientX - rect.left;
//         const mouseY = event.clientY - rect.top;

//         if (this.isResizing) {
//             // Track displacement delta distance
//             const deltaX = event.clientX - this.resizeStartX;
//             // Restrict minimum column size to 30px
//             const newWidth = Math.max(30, this.resizeStartWidth + deltaX);

//             // Update column state cache dynamically 
//             this._colState.setProperties(this.resizeColIndex, newWidth);
            
//             return;
//         }

//         // Dynamic Cursor styling over boundaries
//         if (mouseY <= this.cellHeight) {
//             const { colIndex } = this.getColAtX(_canvas, scrollX , mouseX);
//             _canvas.style.cursor = colIndex !== -1 ? 'col-resize' : 'default';
//         } else {
//             _canvas.style.cursor = 'default';
//         }
//     }

//      handleMouseUp() {
//         if (this.isResizing) {
//             this.isResizing = false;
//             this.resizeColIndex = -1;
//         }

    
//     }
// }