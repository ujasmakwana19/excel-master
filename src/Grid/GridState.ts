import { Defaults, GridConstants } from "../constants.js";
import { Cell, type CellData } from "./cell.js";
import { Column, type ColumnData } from "./column.js";
import { Row, type RowData } from "./row.js";

export class GridStateClass {
    private rowObj: Row;
    private colObj: Column;
    private cellObj: Cell;

    totalHeight: number = 0;
    totalWidth: number = 0;

    _cellDataCache: CellData = {};
    _colDataCache: ColumnData = {};
    _rowDataCache: RowData = {};

    constructor() {
        this.rowObj = new Row();
        this.colObj = new Column();
        this.cellObj = new Cell();
    }

    async initGridData(dataUrl: string): Promise<void> {

        
        this._cellDataCache = this.cellObj.getData;
        this._colDataCache = this.colObj.getData;
        this._rowDataCache = this.rowObj.getData;

    }

    calCulateTotalWidth(): number {
        const colCount = Object.keys(this._colDataCache).length;
        const remainingCols = Defaults.COLUMN - colCount;

        console.log(remainingCols)
        let sum = 0;
        for (const key in this._colDataCache) {
            if (!Object.hasOwn(this._colDataCache, key)) continue;
            sum += this._colDataCache[key]?.width ?? 0;
        }

        this.totalWidth = remainingCols * GridConstants.WIDTH + sum;
        return this.totalWidth;
    }

    calCulateTotalHeight(): number {
        const rowCount = Object.keys(this._rowDataCache).length;
        const remainingRows = Defaults.ROW - rowCount;

        let sum = 0;
        for (const key in this._rowDataCache) {
            if (!Object.hasOwn(this._rowDataCache, key)) continue;
            sum += this._rowDataCache[key]?.height ?? 0;
        }

        this.totalHeight = remainingRows * GridConstants.HEIGHT + sum;
        return this.totalHeight;
    }
}