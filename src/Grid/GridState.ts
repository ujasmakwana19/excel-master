import { Defaults, GridConstants } from "../constants.js";
import { type CellData } from "./cell.js";
import { type ColumnData } from "./column.js";
import { type RowData } from "./row.js";

interface GridState {

}

export class GridStateClass implements GridState {
    // rowObj : Row
    // colObj : Column
    // cellObj : Cell

    totalHeight : number = 0
    totalWidth : number = 0

    _cellDataCache : CellData = {}
    _colDataCache : ColumnData = {
        1 : {
            width : 100
        },
        2 : {
            width : 200
        }
    }
    _rowDataCache : RowData = {
        1 : {
            height : 100
        },
        2 : {
            height : 200
        }
    }

    // constructor(){
        // this.rowObj = new Row()
        // this.colObj = new Column()
        // this.cellObj = new Cell()
    // }

    // async initGridData() : Promise<void> {

    //     // await this.rowObj.initialize()
    //     // await this.colObj.initialize()
    //     // await this.cellObj.initialize()

    //     // this._colDataCache = this.colObj.getData
    //     // this._rowDataCache = this.rowObj.getData
    //     // this._cellDataCache = this.cellObj.getData
    // }

    calCulateTotalWidth() : number{
        const remainingCols = Defaults.COLUMN - Object.keys(this._colDataCache).length
        console.log(remainingCols)

        let sum : number = 0
        for (const key in this._colDataCache) {
            if (!Object.hasOwn(this._colDataCache, key)) continue;

            if(this._colDataCache[key] !== undefined)
                sum += this._colDataCache[key]?.width;
            
            
        }

        this.totalWidth = remainingCols * GridConstants.WIDTH + sum
        
        console.log(this.totalWidth)
        return this.totalWidth
       
    }

    calCulateTotalHeight() : number{
        const remainingRows = Defaults.ROW - Object.keys(this._rowDataCache).length
        console.log(remainingRows)
        let sum : number = 0
        for (const key in this._rowDataCache) {
            if (!Object.hasOwn(this._rowDataCache, key)) continue;

            if(this._rowDataCache[key] !== undefined)
                sum += this._rowDataCache[key]?.height;
            
            
        }

        this.totalHeight = remainingRows * GridConstants.HEIGHT + sum
        console.log(this.totalHeight)
        return this.totalHeight
    }



}