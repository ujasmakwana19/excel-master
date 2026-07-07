
import { type PaintProperties } from "./PaintProperties.js"

export type ColumnData = {
    [key : number] : {
        width : number
        properties?: PaintProperties
    }
}


// export class Column {
//     _colDataCache : ColumnData = {}
//     // _fileInstance : FileState

//     // constructor(){
//     //     // this._fileInstance = new FileState()
//     // }

//     public async initialize(): Promise<void> {
//             const temp = await this._fileInstance.readJsonFile<ColumnData>(DB.COLUMN);
//             if (temp) this._colDataCache = temp;
//         }

//     get getData() : ColumnData {
//         return this._colDataCache
//     }

//     setProperties(
//         key : number , 
//         width : number , 
//         properties : PaintProperties
//     ) : void
//     {
//         if(JSON.stringify(properties) 
//             !== 
//         JSON.stringify(DefaultGridProperties) || width !== GridConstants.WIDTH){
//             this._colDataCache[key] = {
//                 width : width,
//                 properties : properties
//             }

//             this._fileInstance.writeJsonFile<ColumnData>(DB.COLUMN, this._colDataCache)
//         }

//     }

// }