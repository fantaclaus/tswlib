// import { childValType } from "./types";
// import { CtxRoot } from "./CtxRoot";

// export function setContent(htmlElement: Element, content: childValType)
// {
// 	const ctxRoot = new CtxRoot(htmlElement);
// 	ctxRoot.setContent(content);
// 	return ctxRoot;
// }

/* TODO:

+ onBeforeAttach: call before nodes inserted
+ event handlers
+ handle 'input', 'change' for input and select elements to change attached propval
+ refs
+ before/after attach/detach (call)
+ delayed context updates
+ jquery support
- IE 9-11 support, maybe IE8
- delegated/direct event handlers, with/without bubble
- sync propVals of 'select' elm: value and selectedIndex
- hide private methods with help of Symbols
- dom-style layout (non-functional)
- CtxRoot.setContent: add cleanup code before add nodes
*/
