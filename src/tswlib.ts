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
- refs (set null & detach)
- before/after attach/detach (call)
- delayed context updates with hierarchy
- jquery support
- IE 9-11 support
- sync propVals of 'select' elm: value and selectedIndex
*/