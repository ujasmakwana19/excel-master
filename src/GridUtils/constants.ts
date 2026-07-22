export const GridConstants = {
	WIDTH: 120,
	HEIGHT: 25,
};

export const HeaderConstants = {
	LEFTWIDTH: 60,
	TOPHEIGHT: 23
};

export const Defaults = {
	ROW: 100000,
	COLUMN: 500,
};

export const thresHoldConstants = {
	resizeHitTolerance : 4,
	selectionHitTolerance : 4,
	minWidth : 30,
	minHeight : 25,
	edge_operation : 2
} 

export const MAX_HISTORY  = 200;
export const EDGE_SCROLL_SPEED = 6;
export const MAX_CELLS_PER_FORMAT_ACTION = 20000;

export function isColumnHeader(x : number , y : number) : boolean {
	if(x >= HeaderConstants.LEFTWIDTH 
		&& y <= HeaderConstants.TOPHEIGHT)
		return true
	return false
}

export function isRowHeader(x : number , y : number) : boolean {
	if(x <= HeaderConstants.LEFTWIDTH 
		&& y >= HeaderConstants.TOPHEIGHT)
		return true
	return false
}

export function isCellBody(x : number , y : number) : boolean {
	if(x > HeaderConstants.LEFTWIDTH 
		&& y > HeaderConstants.TOPHEIGHT)
		return true
	return false
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export const arrowMap: Record<string, [number, number]> = {
    ArrowRight: [0, 1],
    ArrowLeft: [0, -1],
    ArrowDown: [1, 0],
    ArrowUp: [-1, 0],
};

export function getColLabel(colIndex: number): string {
	let label = "";
	let temp = colIndex;
	while (temp > 0) {
		let modulo = (temp - 1) % 26;
		label = String.fromCharCode(65 + modulo) + label;
		temp = Math.floor((temp - modulo) / 26);
	}
	return label;
}
