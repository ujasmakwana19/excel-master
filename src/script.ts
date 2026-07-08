import { Defaults, GridConstants } from "./constants.js";
import { GridStateClass } from "./Grid/GridState.js";


class Main {
    _canvas: HTMLCanvasElement;
    constructor(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
    }

    get get2DContext(): CanvasRenderingContext2D {
        if (!this._canvas) {
            throw new Error("Canvas element not found!");
        }

        const ctx = this._canvas.getContext('2d') as CanvasRenderingContext2D;
        if (!ctx) {
            throw new Error("2D context not supported or failed to initialize.");
        }
        return ctx;
    }
}

class Grid {
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;
    _gridState : GridStateClass

    private scrollX: number = 0;
    private scrollY: number = 0;
    
    cellWidth: number = GridConstants.WIDTH;
    cellHeight: number = GridConstants.HEIGHT;

    totalWidth : number = 0
    totalHeight : number = 0

    rowNo: number = Defaults.ROW;
    columnNo: number = Defaults.COLUMN;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this._canvas = canvas;
        this._ctx = ctx;
        this._gridState = new GridStateClass()
        this.drawInitGrid();

    }
    
    private async drawInitGrid() {
        this.totalWidth = this._gridState.calCulateTotalWidth()
        this.totalHeight = this._gridState.calCulateTotalHeight()

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
    }

    private resizeCanvas() {
        const rect: DOMRect | undefined = this._canvas.parentElement?.getBoundingClientRect();
        
        if (rect === undefined) {
            throw new Error("Can't get the dimensions of the element");
        }
        this._canvas.width = rect.width;
        this._canvas.height = rect.height;

        this.render();
    }

    private render() {
        // Clear the canvas
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // Calculate virtualization bounds
        const startRow: number = Math.floor(this.scrollY / this.cellHeight);
        const visibleRows: number = Math.ceil(this._canvas.height / this.cellHeight);
        const endRow: number = Math.min(this.rowNo, startRow + visibleRows + 1);
        
        const startCol: number = Math.floor(this.scrollX / this.cellWidth);
        const visibleCols: number = Math.ceil(this._canvas.width / this.cellWidth);
        const endCol: number = Math.min(this.columnNo, startCol + visibleCols + 1);

        // Take the snapshot of the current state of the canvas        
        this._ctx.save();

        // New state or path for the paint
        this._ctx.beginPath();
        
        // draws the rect of canvas size  
        this._ctx.rect(this.cellWidth , this.cellHeight , this._canvas.width, this._canvas.height);


        this._ctx.clip(); 

        const dataStartRow = Math.max(1, startRow);
        const dataStartCol = Math.max(1, startCol);

        let tempHeight : number = this._gridState._rowDataCache[dataStartRow]?.height
        let absoluteY : number = this.cellHeight;
        
        if(tempHeight !== undefined)
            absoluteY = tempHeight;
        
            
        for (let r = dataStartRow; r < endRow; r++) {
            let absoluteX = this.cellWidth;
            for (let c = dataStartCol; c < endCol; c++) {


                const screenX = absoluteX - this.scrollX;
                const screenY = absoluteY - this.scrollY;

                let temp = this._gridState._colDataCache[c];
                let tempWidth : number = this.cellWidth
                if(temp !== undefined && 
                    temp?.width !== undefined
                ){
                    
                    absoluteX = absoluteX + temp.width
                    tempWidth = temp.width
                }
                else{
                    absoluteX += this.cellWidth
                    tempWidth = this.cellWidth
                }

                this.drawCell(r, c, screenX, screenY, false, tempWidth, tempHeight);
                
                
            }

            let temp = this._gridState._rowDataCache[r+1];

            if(temp !== undefined && 
                temp?.height !== undefined
            ){

                absoluteY = absoluteY + temp.height
                tempHeight = temp.height
            }
            else{
                absoluteY += this.cellHeight
                tempHeight = this.cellHeight
            }

        }

        this._ctx.restore();

        // Freeze the top row of columns
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.rect(this.cellWidth, 0, this._canvas.width, this.cellHeight);
        this._ctx.clip();

        let lastCellWidthEnd : number = this.cellWidth
        for (let c = dataStartCol; c < endCol; c++) {
            
            const screenX = lastCellWidthEnd - this.scrollX;
            let temp = this._gridState._colDataCache[c];
            let tempWidth : number = this.cellWidth
                if(temp !== undefined && 
                    temp?.width !== undefined
                ){
                    
                    lastCellWidthEnd = lastCellWidthEnd + temp.width
                    tempWidth = temp.width
                }
                else{
                    lastCellWidthEnd += this.cellWidth
                    tempWidth = this.cellWidth
                }
            this.drawCell(0, c, screenX, 0, true, tempWidth);
        }
        this._ctx.restore();

        // 
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.rect(0, this.cellHeight, this.cellWidth, this._canvas.height);
        this._ctx.clip();
        let lastCellHeightEnd : number = this.cellHeight
        for (let r = dataStartRow; r < endRow; r++) {

            const screenY = lastCellHeightEnd - this.scrollY;
            let temp = this._gridState._rowDataCache[r];
            let tempHeight : number = this.cellHeight
                if(temp !== undefined && 
                    temp?.height !== undefined
                ){
                    
                    lastCellHeightEnd = lastCellHeightEnd + temp.height
                    tempHeight = temp.height
                }
                else{
                    lastCellHeightEnd += this.cellHeight
                    tempHeight = this.cellHeight
                }
            this.drawCell(r, 0, 0, screenY, true, this.cellWidth, tempHeight);
        }
        this._ctx.restore();

        // Top left corner rectangle
        this.drawCell(0, 0, 0, 0, true);
    }

    private drawCell(row: number, col: number, x: number, y: number, isHeader: boolean = false,  specificWidth : number = this.cellWidth, specificHeight : number = this.cellHeight ) {
        if (isHeader) {
            // Excel-style gray background headers
            this._ctx.fillStyle = '#f8f9fa'; 
            this._ctx.fillRect(x, y, specificWidth, specificHeight);
            
            this._ctx.strokeStyle = '#b0b3b8';
            this._ctx.lineWidth = 2;
            this._ctx.strokeRect(x, y, specificWidth, specificHeight);
            
            this._ctx.fillStyle = '#444444';
            let val : string = "bold " + "13px " + "sans-serif"
            this._ctx.font = val;
            this._ctx.textAlign = 'center';
            this._ctx.textBaseline = 'middle';

            let headerText = '';
            if (row === 0 && col === 0) {
                headerText = ''; 
            } else if (row === 0) {
                headerText = this.getColLabel(col); 
            } else {
                headerText = row.toString(); 
            }

            this._ctx.fillText(headerText, x + specificWidth / 2, y + specificHeight / 2);
        } else {
            // Standard data grid cells
            this._ctx.fillStyle = '#ffffff';
            this._ctx.fillRect(x, y, specificWidth, specificHeight);

            this._ctx.strokeStyle = '#e2e3e5';
            this._ctx.lineWidth = 1;
            this._ctx.strokeRect(x, y, specificWidth, specificHeight);
            
            this._ctx.fillStyle = '#1a1a1a';
            this._ctx.font = '13px sans-serif';
            this._ctx.textAlign = 'center';
            this._ctx.textBaseline = 'middle';
            
            this._ctx.fillText(`R${row} C${col}`, x + specificWidth / 2, y + specificHeight / 2);
        }
    }

    private getColLabel(colIndex: number): string {
        let label = '';
        let temp = colIndex;
        while (temp > 0) {
            let modulo = (temp - 1) % 26;
            label = String.fromCharCode(65 + modulo) + label;
            temp = Math.floor((temp - modulo) / 26);
        }
        return label;
    }

    private handleWheel(event: WheelEvent) {
        event.preventDefault(); 
        
        const previousScrollX = this.scrollX;
        const previousScrollY = this.scrollY;
        
        let targetX = this.scrollX + event.deltaX;
        let targetY = this.scrollY + event.deltaY;

        // Apply global map limitations 
        const maxScrollX = Math.max(0, (this.totalWidth) - this._canvas.width);
        const maxScrollY = Math.max(0, (this.totalHeight) - this._canvas.height);

        targetX = Math.min(Math.max(0, targetX), maxScrollX);
        targetY = Math.min(Math.max(0, targetY), maxScrollY);
        
        if (targetX === previousScrollX && targetY === previousScrollY) {
            return; 
        }
        
        // Assign validated states
        this.scrollX = targetX;
        this.scrollY = targetY;
        
        this.render();
    }
}

// Instantiate
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const paintContext : CanvasRenderingContext2D = new Main(canvas).get2DContext;
const gridBuilder = new Grid(canvas, paintContext);