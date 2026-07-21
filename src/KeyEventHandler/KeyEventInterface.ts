export interface KeyBoardEvents {
    handleKeyDown() : boolean
    handleShiftSelection(event : KeyboardEvent) : void
    handleMovementKeyDown(event : KeyboardEvent) : void
    handleTabKeyDown(event : KeyboardEvent) : void
}