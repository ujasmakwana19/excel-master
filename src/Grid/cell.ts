import {  type PaintProperties } from "./PaintProperties.js"

export type CellData = {
    [key : string] : {
        text : string 
        properties : PaintProperties
    }
}

// export class Cell {
//     _cellDataCache : CellData = {}
//     _fileInstance : FileState

//     constructor(){
//         this._fileInstance = new FileState()
        
//     }

//     public async initialize(): Promise<void> {
//         const temp = await this._fileInstance.readJsonFile<CellData>(DB.CELL);
//         if (temp) this._cellDataCache = temp;
//     }


//     get getData() : CellData {
//         return this._cellDataCache
//     }

//     setProperties(
//         row : number , 
//         col : number , 
//         text : string , 
//         properties : PaintProperties
//     ) : void
//     {
//         if(
//             JSON.stringify(properties) 
//             !== 
//             JSON.stringify(DefaultGridProperties) 
//             || text !== undefined 
//             || text !== ""
//         ){
//             this._cellDataCache[this.cellId(row, col)] = {
//                 text : text,
//                 properties : properties
//             }

//             this._fileInstance.writeJsonFile<CellData>(DB.CELL, this._cellDataCache)
//         }

//     }

//     public cellId(row : number, col : number) : string 
//     {
//         return `${row}` + `:` + `${col}`
//     }

// }