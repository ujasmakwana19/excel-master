import { fileURLToPath } from "url"
import path from "path"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const DB ={
    ROW : path.join(__dirname,"rowState.json"),
    COLUMN : path.join(__dirname,"columnState.json"),
    CELL : path.join(__dirname,"cellState.json")
}