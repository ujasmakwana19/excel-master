import { Defaults, GridConstants, LeftHeaderConstants } from "./constants.js";
import type { Cell } from "./Grid/cell.js";
import type { Column } from "./Grid/column.js";
import type { Row } from "./Grid/row.js";
import { PaintEngine } from "./PaintEngine.js";

export class RenderingEngine {
    _rowState : Row
    _colState : Column
    _cellState : Cell

    _paintEngine : PaintEngine

    cellWidth : number = GridConstants.WIDTH
    cellHeight : number = GridConstants.HEIGHT

    rowNo : number = Defaults.ROW
    columnNo : number = Defaults.COLUMN
    
    leftHeaderWidth : number = LeftHeaderConstants.WIDTH 

    private isResizing: boolean = false;
    private resizeColIndex: number = -1;
    private resizeStartX: number = 0;
    private resizeStartWidth: number = 0;
    private resizeHitTolerance: number = 4;

    constructor (rowState : Row, colState : Column, cellState : Cell){
        this._rowState = rowState
        this._colState = colState
        this._cellState = cellState
        this._paintEngine = new PaintEngine()
        
    }


// ==========================================
// Helper Methods 
// ==========================================
    // To calculate the dynamic value of the startRow, endRow such that the change in the size ,
    // of the row is taken in account
    private getRowBounds(scrollY: number, canvasHeight: number) {
        
        // total pixel from the top
        let totalY : number = 0;

        let startRow : number = 1; 
        let endRow : number = 1;
        
        for (let r = 1; r <= this.rowNo; r++) {

            // get the custom height 
            const rowHeight = this._rowState.getData?.[r]?.height ?? this.cellHeight;
            
            // If the bottom of this row is past our scroll position, this is our start row
            if (totalY + rowHeight > scrollY) {
                startRow = r;
                break;
            }

            // add the height
            totalY += rowHeight;
        }

        // To calculate the end Row 
        let visibleY = totalY - scrollY; // totalY (heiht in pixel) - scrolled pixel 

        for (let r = startRow; r <= this.rowNo; r++) {
            const rowHeight = this._rowState._rowDataCache?.[r]?.height ?? this.cellHeight;
            visibleY += rowHeight;
            endRow = r;

            if (visibleY >= canvasHeight) {
                endRow = Math.min(this.rowNo, endRow + 1); 
                break;
            }
        }

        if(totalY === 0){
            return { startRow, totalY : this.cellHeight , endRow };
        }

        return { startRow, totalY , endRow };
    }

    // To calculate the dynamic value of the startCol, endCol such that the change in the size ,
    // of the Col is taken in account
    private getColBounds(scrollX: number, canvasWidth: number) {

        // Total pixel from the left
        let totalX = 0;

        let startCol = 1; 
        let endCol = 1;

        for (let c = 1; c <= this.columnNo; c++) {
            // get the custom width
            const colWidth = this._colState._colDataCache?.[c]?.width ?? this.cellWidth;
            
            // If the left of this col is past our scroll position, this is our start col
            if (totalX + colWidth > scrollX) {
                startCol = c;
                break;
            }

            totalX += colWidth;
        }

        let visibleX = totalX - scrollX; 
        for (let c = startCol; c <= this.columnNo; c++) {
            const colWidth = this._colState._colDataCache?.[c]?.width ?? this.cellWidth;
            visibleX += colWidth;
            endCol = c;

            if (visibleX >= canvasWidth) {
                endCol = Math.min(this.columnNo, endCol + 1); 
                break;
            }
        }

        // we do this cause , if its init , then the size of the Header to add otherwise the 
        //  column column would cut down
        if(totalX === 0)
        {
            return { startCol, totalX :this.leftHeaderWidth , endCol };
        }

        return { startCol, totalX, endCol };
    }

// =============================================
//  main Render 
// =============================================

    renderGrid(
        _canvas : HTMLCanvasElement,
        _ctx : CanvasRenderingContext2D,
        scrollX : number,
        scrollY : number
    ) {
        // Clear the canvas
        _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

        // Calculate virtualization bounds
        const { startRow, totalY, endRow } = this.getRowBounds(scrollY, _canvas.height);
        const { startCol, totalX,endCol } = this.getColBounds(scrollX, _canvas.width);
        console.log({ startRow, totalY, endRow })
        console.log({ startCol, totalX,endCol })
        // Take the snapshot of the current state of the canvas        
        _ctx.save();

        // New state or path for the paint
        _ctx.beginPath();
        
        // draws the rect of canvas size, so we can only paint in that area
        _ctx.rect(this.leftHeaderWidth , this.cellHeight , _canvas.width, _canvas.height);


        _ctx.clip(); 
        
        // Getting the startRow and excluding the row for the Headers 
        const dataStartRow : number = Math.max(1, startRow);
        const dataStartCol : number = Math.max(1, startCol);

    
        //  Main grid render ->>>>>>>>>>>>>>>>..
        let heightSum :number = totalY
        for (let r = dataStartRow; r <= endRow; r++) {

            // Every loop updates the width sum , so the next loop know which pixel to start the paint
            let widthSum :number = totalX
            let currentCellHeight : number = this._rowState._rowDataCache?.[r]?.height ?? this.cellHeight

            for (let c = dataStartCol; c <= endCol; c++) {
                                
                const screenX = widthSum - scrollX;
                const screenY = heightSum - scrollY;
                
                let currentCellWidth : number = this._colState._colDataCache?.[c]?.width ?? this.cellWidth
                widthSum += currentCellWidth

                this._paintEngine.drawCell(_ctx ,r ,c ,screenX ,screenY ,false ,currentCellWidth ,currentCellHeight);
                
            }
            heightSum += currentCellHeight
        }

        // restore the state , we save the snapshot before
        _ctx.restore();

        // Top Header Paint ->>>>>>>>>>>>
        _ctx.save();
        _ctx.beginPath();
        _ctx.rect(this.leftHeaderWidth, 0, _canvas.width, this.cellHeight);
        _ctx.clip();

        let widthSum :number = totalX
        for (let c = dataStartCol; c <= endCol; c++) {
            
            const screenX = widthSum - scrollX;
            let currentCellWidth = this._colState._colDataCache?.[c]?.width ?? this.cellWidth
            widthSum += currentCellWidth

            this._paintEngine.drawCell(_ctx , 0, c, screenX, 0, true, currentCellWidth, this.cellHeight);
        }
        _ctx.restore();

        // Left Header Paint ->>>>>>>>>>>>>>>
        _ctx.save();
        _ctx.beginPath();
        _ctx.rect(0, this.cellHeight, this.leftHeaderWidth, _canvas.height);
        _ctx.clip();

        heightSum  = totalY
        for (let r = dataStartRow; r <= endRow; r++) {
            
            const screenY =  heightSum - scrollY;
            let currentCellHeight : number = this._rowState._rowDataCache?.[r]?.height ?? this.cellHeight
            heightSum += currentCellHeight

            this._paintEngine.drawCell(_ctx, r, 0, 0, screenY, true, this.leftHeaderWidth, currentCellHeight);
        }
        _ctx.restore();

        // Top left corner rectangle
        this._paintEngine.drawCell(_ctx, 0, 0, 0, 0, true, this.leftHeaderWidth, this.cellHeight);
    }

}