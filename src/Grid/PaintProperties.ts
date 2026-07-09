export type PaintProperties = {
	backgroundcolor: string | undefined;

	bordercolor: string | undefined;
	borderwidth: number | undefined;

	textalign: "left" | "center" | "middle";

	fontcolor: string | undefined;
	fontweight: "bold" | "" | undefined;
	fontstyle: string | undefined;
	fontsize: string | undefined;
};

export const DefaultGridProperties: PaintProperties = {
	backgroundcolor: "#ffffff",
	bordercolor: "#e2e3e5",
	borderwidth: 1.5,

	textalign: "left",

	fontcolor: "#000000",
	fontweight: "",
	fontstyle: "sans-serif",
	fontsize: "14px",
};

export const HeaderDefaultGridProperties: PaintProperties = {
	backgroundcolor: "#f8f9fa",
	bordercolor: "#b0b3b8",
	borderwidth: 2,

	textalign: "center",

	fontcolor: "#444444",
	fontweight: "bold",
	fontstyle: "sans-serif",
	fontsize: "16px",
};
