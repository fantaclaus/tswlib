import * as html from './html';
import * as global from './PropDefs';
import * as elements from "./htmlElements";
import * as components from "./RadioGroup";
import { CtxRoot } from "./Ctx";
import { childValType, Renderer } from "./elm";

export { html };
export { global };
export { elements };
export { components };
export { Renderer };

export { Ref } from './Ref';
export { PropVal, PropValArray } from './PropVals';

export function setContent(htmlElement: HTMLElement | null, content: childValType)
{
	if (htmlElement != null)
	{
		const ctxRoot = new CtxRoot();
		ctxRoot.render(content, htmlElement);
	}
}
