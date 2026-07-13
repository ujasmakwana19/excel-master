import { Defaults, GridConstants, HeaderConstants } from "../Grid/constants.js";
import {
	DefaultGridProperties,
	type PaintProperties,
} from "../Grid/PaintProperties.js";

export type RowData = {
	[key: number]: {
		height: number;
		properties?: PaintProperties | undefined
	};
};

export class Row {
	_rowDataCache: RowData = {
		1: {
			height: 90,
		},
		2: {
			height: 200,
		},
	};

	get getData(): RowData {
		return this._rowDataCache;
	}

	getRowHeight(r : number) : number {
		return this._rowDataCache?.[r]?.height ?? GridConstants.HEIGHT;
	}


	getRow(
		row: number
	) : {height : number , properties? : PaintProperties | undefined} | undefined{

		return this._rowDataCache?.[row];
	}

	setProperties(
		key: number,
		height: number,
		properties?: PaintProperties,
	): void {
		if (
			JSON.stringify(properties) !==
				JSON.stringify(DefaultGridProperties) ||
			height !== GridConstants.HEIGHT
		) {
			this._rowDataCache[key] = {
				height: height,
				properties: properties,
			};
		}
	}

	calCulateTotalHeight(): number {
		const rowCount = Object.keys(this._rowDataCache).length;
		const remainingRows = Defaults.ROW - rowCount ;

		let sum = 0;
		for (const key in this._rowDataCache) {
			if (!Object.hasOwn(this._rowDataCache, key)) continue;
			sum += this._rowDataCache[key]?.height ?? 0;
		}

		return ((remainingRows * GridConstants.HEIGHT) + sum + HeaderConstants.TOPHEIGHT);
	}
}
