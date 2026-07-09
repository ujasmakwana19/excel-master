export type PaintProperties = {
	backgroundcolor: string ;

	bordercolor: string ;
	borderwidth: number ;

	textalign: "left" | "center" | "right";

	fontcolor: string ;
	fontweight: "bold" | "" ;
	fontstyle: string ;
	fontsize: string ;
};

export const DefaultGridProperties: PaintProperties = {
	backgroundcolor: "#ffffff",
    bordercolor: "#e4e4e7", // Ultra-clean, subtle gray (Zinc 200)
    borderwidth: 1,

    textalign: "center",

    fontcolor: "#09090b", // Deep ink black/charcoal
    fontweight: "",
    fontstyle: "Inter, system-ui, sans-serif",
    fontsize: "14px",
};

export const HeaderDefaultGridProperties: PaintProperties = {
	backgroundcolor: "#8d928f", // Soft off-white header zone
    bordercolor: "#000000", // High-energy emerald green border
    borderwidth: 2,

    textalign: "center",

    fontcolor: "#09090b",
    fontweight: "bold",
    fontstyle: "Inter, system-ui, sans-serif",
    fontsize: "14px",
};
