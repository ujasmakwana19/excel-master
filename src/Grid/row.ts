
import { Defaults, GridConstants } from "../constants.js"
import { DefaultGridProperties, type PaintProperties } from "./PaintProperties.js"

export type RowData = {
    [key : number] : {
        height : number
        properties?: PaintProperties
    }
}

export class Row {
    totalHeight : number = GridConstants.HEIGHT
    _rowDataCache : RowData = {
        1 : {
            height : 90
        },
        2 : {
            height : 200
        },
    }

    get getData() : RowData {
        return this._rowDataCache
    }

    setProperties(
        key : number , 
        height : number , 
        properties : PaintProperties
    ) : void
    {
        if(JSON.stringify(properties) 
            !== 
        JSON.stringify(
            DefaultGridProperties) || 
            height !== GridConstants.HEIGHT
        ){
            this._rowDataCache[key] = {
                height : height,
                properties : properties
            }
        }

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