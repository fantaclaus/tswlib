import { tswElement } from "./elm";

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
		super(tagName.toLowerCase(), svgNS, true); // NOTE: svg tagnames must be lowercase! attribute names are case-sensitive!
	}
	stroke(v: string) { this.attr('stroke', v); return this; }
	strokeWidth(v: number) { this.attr('stroke-width', v); return this; }
	fill(v: string) { this.attr('fill', v); return this; }
}

export class tswElementSVG_SVG extends tswElementSVG
{
	constructor()
	{
		super('svg');
	}
	width(v: number) { this.attr('width', v); return this; }
	height(v: number) { this.attr('height', v); return this; }
}

export class tswElementSVG_Circle extends tswElementSVG
{
	constructor()
	{
		super('circle');
	}
	cx(v: number) { this.attr('cx', v); return this; }
	cy(v: number) { this.attr('cy', v); return this; }
	r(v: number) { this.attr('r', v); return this; }
}

export class tswElementSVG_Rect extends tswElementSVG
{
	constructor()
	{
		super('rect');
	}
	x(v: number) { this.attr('x', v); return this; }
	y(v: number) { this.attr('y', v); return this; }
	width(v: number) { this.attr('width', v); return this; }
	height(v: number) { this.attr('height', v); return this; }
}

export class tswElementSVG_Path extends tswElementSVG
{
	constructor()
	{
		super('path');
	}
	d(v: string) { this.attr('d', v); return this; }
}
