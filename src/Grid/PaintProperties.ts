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
	bordercolor: "#e1e3e6",
	borderwidth: 1,

	textalign: "center",

	fontcolor: "#202124",
	fontweight: "",
	fontstyle: "Arial, sans-serif",
	fontsize: "14px",
};

export const HeaderDefaultGridProperties: PaintProperties = {
	backgroundcolor: "#f8f9fa",
	bordercolor: "#c0c0c0",
	borderwidth: 1,

	textalign: "center",

	fontcolor: "#444746",
	fontweight: "bold",
	fontstyle: "Arial, sans-serif",
	fontsize: "14px",
};

export const DarkGridProperties: PaintProperties = {
	backgroundcolor: "#202124",
	bordercolor: "#3c4043",
	borderwidth: 1,

	textalign: "center",

	fontcolor: "#e8eaed",
	fontweight: "",
	fontstyle: "Arial, sans-serif",
	fontsize: "14px",
};

export const DarkHeaderProperties: PaintProperties = {
	backgroundcolor: "#303134",
	bordercolor: "#5f6368",
	borderwidth: 1,

	textalign: "center",

	fontcolor: "#e8eaed",
	fontweight: "bold",
	fontstyle: "Arial, sans-serif",
	fontsize: "14px",
};


export const DefaultSelectedProperties: PaintProperties = {
    backgroundcolor: "rgba(26, 115, 232, 0.04)", // Subtle blue transparent fill
    bordercolor: "#1a73e8",                       // Classic spreadsheet blue outline
    borderwidth: 0,
    textalign: "center",
    fontcolor: "#1a73e8",
    fontweight: "",
    fontstyle: "Arial, sans-serif",
    fontsize: "14px",
};

export const DarkSelectedProperties: PaintProperties = {
    backgroundcolor: "rgba(138, 180, 248, 0.08)", 
    bordercolor: "#f0c419",                       
    borderwidth: 0,
    textalign: "center",
    fontcolor: "#8ab4f8",
    fontweight: "",
    fontstyle: "Arial, sans-serif",
    fontsize: "14px",
};