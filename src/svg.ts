import { ElementGeneric } from "tswlibDom/elm";

export function el(tagName: string) { return new ElementSVG(tagName); }
export function svg() { return new ElementSVG_SVG(); }
export function circle() { return new ElementSVG_Circle(); }
export function rect() { return new ElementSVG_Rect(); }

const svgNS = "http://www.w3.org/2000/svg";

export class ElementSVG extends ElementGeneric
{
	constructor(tagName: string)
	{
		super(tagName.toLowerCase(), svgNS); // NOTE: svg tagnames must be lowercase!
	}
	stroke(v: string) { this.attr('stroke', v); return this; }
	strokeWidth(v: number) { this.attr('stroke-width', v); return this; }
	fill(v: string) { this.attr('fill', v); return this; }
}

export class ElementSVG_SVG extends ElementSVG
{
	constructor()
	{
		super('svg');
	}
	width(v: number) { this.attr('width', v); return this; }
	height(v: number) { this.attr('height', v); return this; }
}

export class ElementSVG_Circle extends ElementSVG
{
	constructor()
	{
		super('circle');
	}
	cx(v: number) { this.attr('cx', v); return this; }
	cy(v: number) { this.attr('cy', v); return this; }
	r(v: number) { this.attr('r', v); return this; }
}

export class ElementSVG_Rect extends ElementSVG
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
