
import { GridConstants } from "../constants.js"
import { DefaultGridProperties, type PaintProperties } from "./PaintProperties.js"

export type ColumnData = {
    [key : number] : {
        width : number
        properties?: PaintProperties
    }
}


export class Column {
    _colDataCache : ColumnData = {
        1 : {
            width : 100
        },
        2 : {
            width : 200
        },
    }
    
    get getData() : ColumnData {
        return this._colDataCache
    }

    setProperties(
        key : number , 
        width : number , 
        properties : PaintProperties
    ) : void
    {
        if(JSON.stringify(properties) 
            !== 
        JSON.stringify(DefaultGridProperties) || width !== GridConstants.WIDTH){
            this._colDataCache[key] = {
                width : width,
                properties : properties
            }

        }

    }

}