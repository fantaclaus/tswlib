import * as html from './html';
// import * as global from './PropDefs';
// import * as elements from "./htmlElements";
// import * as components from "./RadioGroup";
import { CtxRoot } from "./CtxRoot";
import { childValType, Renderer } from "./types";

export { html, childValType, Renderer, CtxRoot };

export { Ref } from './Ref';
export { PropVal, PropValArray } from './PropVals';

export function setContent(htmlElement: HTMLElement, content: childValType)
{
	const ctxRoot = new CtxRoot(htmlElement);
	ctxRoot.setContent(content);
	return ctxRoot;
}
