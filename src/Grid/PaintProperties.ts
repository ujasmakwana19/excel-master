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

// Bonus — Sheets' active-cell outline. Useful since your footer
// already computes range/sum/avg/count from a selection.
export const SelectedCellLightProperties: PaintProperties = {
	backgroundcolor: "#e8f0fe",   // Sheets' selection fill
	bordercolor: "#1a73e8",       // Sheets' selection outline blue
	borderwidth: 2,

	textalign: "center",

	fontcolor: "#202124",
	fontweight: "",
	fontstyle: "Arial, sans-serif",
	fontsize: "14px",
};

export const SelectedCellDarkProperties: PaintProperties = {
	backgroundcolor: "#28313f",   // dimmed blue-gray fill
	bordercolor: "#8ab4f8",       // Google's dark-mode blue accent
	borderwidth: 2,

	textalign: "center",

	fontcolor: "#e8eaed",
	fontweight: "",
	fontstyle: "Arial, sans-serif",
	fontsize: "14px",
};