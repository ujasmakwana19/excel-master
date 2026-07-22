import type { CellValue } from "../States/cell.js";

export function setInputFieldProps (input : HTMLInputElement, isDark : boolean = false){
    input.type = "text";
	input.style.position = "absolute";
	input.style.boxSizing = "border-box";
	input.style.outline = "none";
	input.style.padding = "0 4px";
	input.style.font = "14px Arial, sans-serif";
	input.style.display = "none";
	input.style.zIndex = "10";
}

export function setOnEditCellProps (input : HTMLInputElement, existing : CellValue | undefined, isDark : boolean = false){
    input.style.border = isDark ? "2.5px solid #f0c419" : "2.5px solid #1a73e8";
    input.style.backgroundColor =
    existing?.properties?.backgroundcolor ?? 
        (isDark ? "#202124" : "#ffffff");
    
    input.style.color = 
        existing?.properties?.fontcolor ?? 
        (isDark ? "#e8eaed" : "#202124");

    const fontsize = existing?.properties?.fontsize ?? "14px"
    const fontstyle = existing?.properties?.fontstyle ?? "Arial, sans-serif"

    input.style.font = `${fontsize} ` + `${fontstyle}`
}