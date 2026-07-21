export interface PointerEventInterface {
    handleDown(event : PointerEvent , x : number , y : number): boolean 
    handleMove(x : number , y : number): void
    handleUp() : void
} 