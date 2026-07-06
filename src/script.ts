import { Defaults, GridConstants } from "./constants.js";
import fs from 'fs';

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

    private scrollX: number = 0;
    private scrollY: number = 0;
    
    cellWidth: number = GridConstants.WIDTH;
    cellHeight: number = GridConstants.HEIGHT;

    rowNo: number = Defaults.ROW;
    columnNo: number = Defaults.COLUMN;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this._canvas = canvas;
        this._ctx = ctx;
        this.drawInitGrid();
    }
    
    private drawInitGrid() {
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

        for (let r = dataStartRow; r < endRow; r++) {
            for (let c = dataStartCol; c < endCol; c++) {
                const absoluteX = c * this.cellWidth;
                const absoluteY = r * this.cellHeight;

                const screenX = absoluteX - this.scrollX;
                const screenY = absoluteY - this.scrollY;

                this.drawCell(r, c, screenX, screenY, false);
            }
        }
        this._ctx.restore();

        // Freeze the top row of columns
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.rect(this.cellWidth, 0, this._canvas.width, this.cellHeight);
        this._ctx.clip();

        for (let c = dataStartCol; c < endCol; c++) {
            const screenX = (c * this.cellWidth) - this.scrollX;
            this.drawCell(0, c, screenX, 0, true);
        }
        this._ctx.restore();

        // 
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.rect(0, this.cellHeight, this.cellWidth, this._canvas.height);
        this._ctx.clip();

        for (let r = dataStartRow; r < endRow; r++) {
            const screenY = (r * this.cellHeight) - this.scrollY;
            this.drawCell(r, 0, 0, screenY, true);
        }
        this._ctx.restore();

        // Top left corner rectangle
        this.drawCell(0, 0, 0, 0, true);
    }

    private drawCell(row: number, col: number, x: number, y: number, isHeader: boolean = false) {
        if (isHeader) {
            // Excel-style gray background headers
            this._ctx.fillStyle = '#f8f9fa'; 
            this._ctx.fillRect(x, y, this.cellWidth, this.cellHeight);
            
            this._ctx.strokeStyle = '#b0b3b8';
            this._ctx.lineWidth = 1;
            this._ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
            
            this._ctx.fillStyle = '#444444';
            this._ctx.font = 'bold 11px sans-serif';
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

            this._ctx.fillText(headerText, x + this.cellWidth / 2, y + this.cellHeight / 2);
        } else {
            // Standard data grid cells
            this._ctx.fillStyle = '#ffffff';
            this._ctx.fillRect(x, y, this.cellWidth, this.cellHeight);

            this._ctx.strokeStyle = '#e2e3e5';
            this._ctx.lineWidth = 1;
            this._ctx.strokeRect(x, y, this.cellWidth, this.cellHeight);
            
            this._ctx.fillStyle = '#1a1a1a';
            this._ctx.font = '13px sans-serif';
            this._ctx.textAlign = 'center';
            this._ctx.textBaseline = 'middle';
            
            this._ctx.fillText(`R${row} C${col}`, x + this.cellWidth / 2, y + this.cellHeight / 2);
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
        const maxScrollX = Math.max(0, (this.columnNo * this.cellWidth) - this._canvas.width);
        const maxScrollY = Math.max(0, (this.rowNo * this.cellHeight) - this._canvas.height);

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