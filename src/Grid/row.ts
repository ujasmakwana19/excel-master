
import { GridConstants } from "../constants.js"
import { DefaultGridProperties, type PaintProperties } from "./PaintProperties.js"

export type RowData = {
    [key : number] : {
        height : number
        properties?: PaintProperties
    }
}

export class Row {
    _rowDataCache : RowData = {
        1 : {
            height : 100
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

}