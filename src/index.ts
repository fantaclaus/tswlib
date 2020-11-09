/*!
 * tswlib v0.17
 * https://github.com/fantaclaus/tswlib
 * Copyright 2020 fantaclaus
 */

import { childValType, tswRenderer } from "./types";
import { tswElementButton } from "./htmlElements";

export { tswRef as Ref } from "./ref";

export type Renderer = tswRenderer;
export { tswPropVal as PropVal, tswPropValArray as PropValArray } from './PropVals';
export * as html from "./html";
import { tswCtxRoot } from "./CtxRoot";

export const elements = {
	ElementButton: tswElementButton,
};


export function setContent(htmlElement: Element, content: childValType)
{
	const ctxRoot = new tswCtxRoot(htmlElement);
	ctxRoot.setContent(content);
	return ctxRoot;
}
