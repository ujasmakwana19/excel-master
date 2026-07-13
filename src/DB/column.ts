import { Defaults, GridConstants, HeaderConstants } from "../Grid/constants.js";
import {
	DefaultGridProperties,
	type PaintProperties,
} from "../Grid/PaintProperties.js";

export type ColumnData = {
	[key: number]: {
		width: number;
		properties?: PaintProperties | undefined;
	};
};

export class Column {
	_colDataCache: ColumnData = {
		1: {
			width: 90,
		},
		2: {
			width: 200,
		}
	};

	get getData(): ColumnData {
		return this._colDataCache;
	}

	getColWidth(c : number) : number {
		return this._colDataCache?.[c]?.width ?? GridConstants.WIDTH;
	}

	getCol(
		col: number
	) : {width : number , properties? : PaintProperties | undefined} | undefined{

		return this._colDataCache?.[col];
	}

	setProperties(
		key: number,
		width: number,
		properties?: PaintProperties,
	): void {
		if (
			(properties !== undefined &&
				JSON.stringify(properties) !==
					JSON.stringify(DefaultGridProperties)) ||
			width !== GridConstants.WIDTH
		) {
			this._colDataCache[key] = {
				width: width,
				properties: properties,
			};
		}
	}

	calCulateTotalWidth(): number {
		const colCount = Object.keys(this._colDataCache).length;
		const remainingCols = Defaults.COLUMN - colCount ;

		let sum = 0;
		for (const key in this._colDataCache) {
			if (!Object.hasOwn(this._colDataCache, key)) continue;
			sum += this._colDataCache[key]?.width ?? 0;
		}

		return ((remainingCols * GridConstants.WIDTH) + sum + HeaderConstants.LEFTWIDTH);
	}
}
