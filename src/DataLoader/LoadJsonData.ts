import type { Grid } from "../Grid.js"
import type { RandomData } from "./jsonDataMaker.js";

export class JsonDataLoader {
	_grid: Grid;
    _parsedData: RandomData[] = []
    _userOffset: number = 1
	constructor(grid: Grid) {
		this._grid = grid;
	}

	LoadToTheGrid(parsedData: RandomData[] , userOffset: number): void {
        this._parsedData = parsedData
        this._userOffset = userOffset

        let column = 1
        let row = this._userOffset 

        this._grid._cellState.setProperties(row, column, "Id")
        this._grid._cellState.setProperties(row, column+1, "firstName")
        this._grid._cellState.setProperties(row, column+2, "lastName")
        this._grid._cellState.setProperties(row, column+3, "Age")
        this._grid._cellState.setProperties(row, column+4, "Salary")
        
        try {

            for (const i of parsedData) {
                row+=1
                this._grid._cellState.setProperties(row, column, i.id.toString())
                this._grid._cellState.setProperties(row, column+1, i.firstName)
                this._grid._cellState.setProperties(row, column+2, i.lastName)
                this._grid._cellState.setProperties(row, column+3, i.Age.toString())
                this._grid._cellState.setProperties(row, column+4, i.Salary.toString())
            }
        }
        catch (error){
            console.error("Unsupported Type")
        }

        this._grid.render()
	}
}