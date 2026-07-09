// import type { Grid } from "../Grid.js";
// import type { ResizeRowColumnEvent } from "./ResizeRowColumnEvent.js";

// export class CellRowColumnSelection {
    
//     // Inside your CellRowColumnSelection class
// colSelection(
//     _canvas: HTMLCanvasElement,
//     _resizeRowColumnEvent: ResizeRowColumnEvent,
//     _grid: Grid,
//     event: MouseEvent
// ) {
//     if (!_resizeRowColumnEvent.isResizing) {
//         const rect = _canvas.getBoundingClientRect();
//         const mouseX = event.clientX - rect.left;
//         const mouseY = event.clientY - rect.top;
        
//         // Ensure click happens inside the top header row
//         if (mouseY <= _grid.cellHeight && mouseX > _grid.cellWidth) {
//             let currentX = _grid.cellWidth - _grid.scrollX;
//             let foundIndex = -1;
//             let targetScreenX = 0;
//             let targetWidth = 0;

//             for (let c = 1; c <= _grid.columnNo; c++) {
//                 const colWidth = _grid._colState._colDataCache?.[c]?.width ?? _grid.cellWidth;
                
//                 if (mouseX >= currentX && mouseX <= currentX + colWidth) {
//                     foundIndex = c;
//                     targetScreenX = currentX;
//                     targetWidth = colWidth;
//                     break;
//                 }
//                 currentX += colWidth;
//             }

//             if (foundIndex !== -1) {
//                 // 1. Persist the state immediately so it's remembered during scroll/resize
//                 _grid.selectedColIndex = foundIndex;

//                 // 2. IMMEDIATE DRAW: Paint the selection right now without waiting for a re-render
//                 const ctx = _canvas.getContext('2d');
//                 if (ctx) {
//                     ctx.save();
//                     // Clip so it doesn't bleed into the row/column headers
//                     ctx.beginPath();
//                     ctx.rect(_grid.cellWidth, _grid.cellHeight, _canvas.width - _grid.cellWidth, _canvas.height - _grid.cellHeight);
//                     ctx.clip();

//                     // Paint the translucent overlay instantly
//                     ctx.fillStyle = "rgba(0, 120, 215, 0.15)";
//                     ctx.fillRect(targetScreenX, _grid.topHeaderHeight, targetWidth, _canvas.height - _grid.topHeaderHeight);
//                     ctx.restore();
//                 }
//             }
//         }
//     }
// }
// }

