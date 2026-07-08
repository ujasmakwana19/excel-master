import {  DefaultGridProperties, type PaintProperties } from "./PaintProperties.js"

export type CellData = {
    [key : string] : {
        text : string 
        properties? : PaintProperties
    }
}

export class Cell {
    _cellDataCache : CellData = {}

    get getData() : CellData {
        return this._cellDataCache
    }

    setProperties(
        row : number , 
        col : number , 
        text : string , 
        properties : PaintProperties
    ) : void
    {
        if(
            JSON.stringify(properties) 
            !== 
            JSON.stringify(DefaultGridProperties) 
            || text !== undefined 
            || text !== ""
        ){
            this._cellDataCache[this.cellId(row, col)] = {
                text : text,
                properties : properties
            }

        }

    }

    public cellId(row : number, col : number) : string 
    {
        return `${row}` + `:` + `${col}`
    }

}