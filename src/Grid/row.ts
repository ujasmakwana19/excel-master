
import { type PaintProperties } from "./PaintProperties.js"

export type RowData = {
    [key : number] : {
        height : number
        properties?: PaintProperties
    }
}


// export class Row {
//     _rowDataCache : RowData = {}
//     _fileInstance : FileState

//     constructor(){
//         this._fileInstance = new FileState()
//     }

//     public async initialize(): Promise<void> {
//         const temp = await this._fileInstance.readJsonFile<RowData>(DB.ROW);
//         if (temp) this._rowDataCache = temp;
//     }

//     get getData() : RowData {
//         return this._rowDataCache
//     }

//     setProperties(
//         key : number , 
//         height : number , 
//         properties : PaintProperties
//     ) : void
//     {
//         if(JSON.stringify(properties) 
//             !== 
//         JSON.stringify(
//             DefaultGridProperties) || 
//             height !== GridConstants.HEIGHT
//         ){
            
//             this._rowDataCache[key] = {
//                 height : height,
//                 properties : properties
//             }

//             this._fileInstance.writeJsonFile<RowData>(
//                 DB.ROW, 
//                 this._rowDataCache
//             )
//         }

//     }

// }