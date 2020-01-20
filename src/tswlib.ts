import { childValType, tswRenderer } from "./types";
import { tswPropVal } from "./PropVals";
import { tswElementButton } from "./htmlElements";

export { tswRef as Ref } from "./ref";

export type Renderer = tswRenderer;
export { tswPropVal as PropVal, tswPropValArray as PropValArray } from './PropVals';
import * as _html from "./html";
import { tswCtxRoot } from "./CtxRoot";

export const html = _html;

export const elements = {
	ElementButton: tswElementButton,
};


export function setContent(htmlElement: Element, content: childValType)
{
	const ctxRoot = new tswCtxRoot(htmlElement);
	ctxRoot.setContent(content);
	return ctxRoot;
}

/* TODO:

+ onBeforeAttach: call before nodes inserted
+ event handlers
+ handle 'input', 'change' for input and select elements to change attached propval
+ refs
+ before/after attach/detach (call)
+ delayed context updates
+ jquery support
+ refs: clear reference to el on nodes removal
+ IE 9-11 support
+ delegated/direct event handlers, with/without bubble
- sync propVals of 'select' elm: value and selectedIndex
+ hide private methods with help of Symbols
- dom-style layout (non-functional)
+ CtxRoot.setContent: add cleanup code before add nodes
- id-generator for label for

*/
