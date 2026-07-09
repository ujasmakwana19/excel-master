import { Defaults, GridConstants, LeftHeaderConstants } from "../constants.js";
import {
	DefaultGridProperties,
	type PaintProperties,
} from "./PaintProperties.js";

export type ColumnData = {
	[key: number]: {
		width: number;
		properties?: PaintProperties | undefined;
	};
};

export class Column {
	totalWidth: number = 0;
	_colDataCache: ColumnData = {
		1: {
			width: 90,
		},
		2: {
			width: 200,
		},
	};

	get getData(): ColumnData {
		return this._colDataCache;
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
		const remainingCols = Defaults.COLUMN - colCount - 1;

		console.log(remainingCols);
		let sum = 0;
		for (const key in this._colDataCache) {
			if (!Object.hasOwn(this._colDataCache, key)) continue;
			sum += this._colDataCache[key]?.width ?? 0;
		}

		this.totalWidth = remainingCols * GridConstants.WIDTH + sum;
		return this.totalWidth + LeftHeaderConstants.WIDTH;
	}
}
