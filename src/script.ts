import { Defaults, GridConstants } from "./constants.js";

// console.log("Shree Ganeshay Namah");
class Main {
    _canvas : HTMLCanvasElement
    constructor(canvas : HTMLCanvasElement){
        this._canvas = canvas
    }

    get2DContext() : CanvasRenderingContext2D {
        if(!canvas){
            throw new Error("Canvas element not found!")
        }

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        if (!ctx) {
            throw new Error("2D context not supported or failed to initialize.");
        }
        return ctx
    }

}

class Grid {
    _ctx : CanvasRenderingContext2D
    _startX : number = 0
    _startY : number = 0
    constructor(ctx : CanvasRenderingContext2D){
        this._ctx = ctx
    }

    drawInitGrid(startX : number , startY : number, rows : number , columns : number){
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const cellX = 5 + (GridConstants.WIDTH * j)
                const cellY = 5 + (GridConstants.HEIGHT * i)

                this._ctx.strokeStyle = '#cccccc';
                this._ctx.lineWidth = 1
                this._ctx.strokeRect(cellX, cellY, GridConstants.WIDTH, GridConstants.HEIGHT)

                this._ctx.fillStyle = "#333333"
                this._ctx.font = '14px sans-serif'

                this._ctx.textBaseline = 'middle'

                const paddingX = 10;
                const paddingY = GridConstants.HEIGHT / 2;
                this._ctx.fillText("", cellX + paddingX, cellY + paddingY);
            }
        }

    }
}
const canvas = document.getElementById('myCanvas')as HTMLCanvasElement
const app : CanvasRenderingContext2D = new Main(canvas).get2DContext()

const gridBuilder = new Grid(app)

gridBuilder.drawInitGrid(5, 5, Defaults.ROW, Defaults.COLUMN)




// let activeInput :  HTMLDivElement | undefined = undefined;
// canvas.addEventListener('click',(event : MouseEvent) => {
//     // Client Absolute value to calculate the 
//     // values relatively
//     const rect = canvas.getBoundingClientRect()
//     console.log(rect);
    
//     const localX = event.clientX - rect.left - 50
//     const localY = event.clientY - rect.top -50

//     console.log({
//         localX : localX,
//         localY : localY,
//         X : event.clientX,
//         Y : event.clientY
//     });

//     if(localX > 0 && localY > 0){
//         const rowIndex = Math.floor(localY / rowHeight)
//         const columnIndex = Math.floor(localX / cellWidth)
//         console.log(rowIndex +" <> " +columnIndex);
        
//         if (activeInput !== undefined) {
//             activeInput.remove()
//             activeInput = undefined; 
//         }

//         const absX = (columnIndex * cellWidth) + 50 + rect.left;
//         const absY = (rowIndex * rowHeight) + 50 + rect.top;

//         activeInput = showOutlineInput(absX , absY, rowIndex, columnIndex)
//     }    
// });


// function showOutlineInput(absoluteX: number, absoluteY: number, rowIndex: number, colIndex: number): HTMLInputElement {
//     const input = document.createElement('input');
//     input.type = 'text';
//     input.value = rows[colIndex] || "";

//     input.style.position = 'absolute';
//     input.style.left = `${absoluteX}px`;
//     input.style.top = `${absoluteY}px`;
//     input.style.width = `${cellWidth}px`;
//     input.style.height = `${rowHeight}px`;
//     input.style.boxSizing = 'border-box';
//     input.style.font = '14px sans-serif';
//     input.style.zIndex = '10';

//     input.style.border = '2px solid #107c41'; 
//     input.style.backgroundColor = 'transparent';
//     input.style.color = 'transparent';       
//     input.style.caretColor = 'transparent'; 

//     const handleGlobalTyping = (event: KeyboardEvent) => {
//         if (event.key === 'Enter' || event.key === 'Escape' || event.key === 'Tab') 
//             return;

//         window.removeEventListener('keydown', handleGlobalTyping);

//         input.style.backgroundColor = '#ffffff';
//         input.style.color = '#333333';
//         input.style.caretColor = 'auto'; 
        
//         input.value = event.key;
//         input.focus();
//     };

//     window.addEventListener('keydown', handleGlobalTyping);

//     input.addEventListener('blur', () => {
//         window.removeEventListener('keydown', handleGlobalTyping);
//         input.remove();
//         if (activeInput === input) 
//             activeInput = undefined;
//     });

//     document.body.appendChild(input);
//     return input;
// }