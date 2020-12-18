import { tswElement } from "./elm";
import { Fn, nothing, PropDefReadable, singleStringValType } from "./types";

type numberNullable = number | nothing | false;
type numberValType = numberNullable | Fn<numberNullable> | PropDefReadable<numberNullable>;

export function el(tagName: string) { return new tswElementSVG(tagName); }
export function svg() { return new tswElementSVG_SVG(); }
export function circle() { return new tswElementSVG_Circle(); }
export function rect() { return new tswElementSVG_Rect(); }
export function path() { return new tswElementSVG_Path(); }

const svgNS = "http://www.w3.org/2000/svg";

export class tswElementSVG extends tswElement
{
	constructor(tagName: string)
	{
		super(tagName, svgNS, true); // NOTE: svg tag and attribute names are case-sensitive!
	}
	stroke(v: singleStringValType) { this.attr('stroke', v); return this; }
	strokeWidth(v: numberValType) { this.attr('stroke-width', v); return this; }
	fill(v: singleStringValType) { this.attr('fill', v); return this; }
}

export class tswElementSVG_SVG extends tswElementSVG
{
	constructor()
	{
		super('svg');
	}
	width(v: numberValType) { this.attr('width', v); return this; }
	height(v: numberValType) { this.attr('height', v); return this; }
	viewBox(v: singleStringValType) { this.attr('viewBox', v); return this; }
}

export class tswElementSVG_Circle extends tswElementSVG
{
	constructor()
	{
		super('circle');
	}
	cx(v: numberValType) { this.attr('cx', v); return this; }
	cy(v: numberValType) { this.attr('cy', v); return this; }
	r(v: numberValType) { this.attr('r', v); return this; }
}

export class tswElementSVG_Rect extends tswElementSVG
{
	constructor()
	{
		super('rect');
	}
	x(v: numberValType) { this.attr('x', v); return this; }
	y(v: numberValType) { this.attr('y', v); return this; }
	width(v: numberValType) { this.attr('width', v); return this; }
	height(v: numberValType) { this.attr('height', v); return this; }
}

export class tswElementSVG_Path extends tswElementSVG
{
	constructor()
	{
		super('path');
	}
	d(v: singleStringValType) { this.attr('d', v); return this; }
}
