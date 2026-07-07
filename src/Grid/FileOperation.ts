// import {promises as fs} from 'fs'
// import { DB } from '../DB/DBContants.js';
// import type { RowData } from './row.js';
// import type { ColumnData } from './column.js';

// export interface FileOperations {
//     readJsonFile<T>(filePath: string) : Promise<T | undefined>
//     writeJsonFile<T>(filePath : string, data : T) : Promise<void>
// }

// export class FileState implements FileOperations{
    
//     async readJsonFile<T>(filePath : string) : Promise<T | undefined>{
//         try {
//             const rawData = await fs.readFile(filePath, 'utf8');
//             const parsedData: T = JSON.parse(rawData);
//             return parsedData;

//         } catch (error) {
//             console.log(error)
//             throw new Error("Error while reading the data..")
//         }
//     }

//     async writeJsonFile<T>(filePath : string, data : T) : Promise<void>{
//         try {
//             const jsonString = JSON.stringify(data, null, 2)
//             await fs.writeFile(filePath, jsonString, 'utf-8')
//             console.log(data , "Added Successfully");
//         } catch (error) {
//             throw new Error("Error while saving the data..")
//         }
//     }
// }
// const f : FileState = new FileState();
// let newData : RowData = {
//     1 : {
//         height : 100
//     },
//     2 : {
//         height : 200
//     }
// }

// f.writeJsonFile<RowData>(DB.ROW, newData)

// let val : RowData | undefined= await new FileState().readJsonFile<RowData>(DB.ROW)
// if(val !== undefined)
// console.log(val[1]?.height)


// let newData2 : ColumnData = {
//     1 : {
//         width : 100
//     },
//     2 : {
//         width : 200
//     }
// }

// f.writeJsonFile<ColumnData>(DB.COLUMN, newData2)
// let val2 : ColumnData | undefined= await new FileState().readJsonFile<ColumnData>(DB.COLUMN)
// if(val2 !== undefined)
// console.log(val2[1]?.width)
