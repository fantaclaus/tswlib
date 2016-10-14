import * as html from './html';
import * as global from './PropDefs';
import * as elements from "./htmlElements";
import * as components from "./RadioGroup";
import { CtxRoot } from './Ctx';

export { html };
export { global };
export { elements };
export { components };

export { Ref } from './Ref';
export { PropVal, PropValArray } from './PropVals';

export function setContent(htmlElement: HTMLElement | null, content: any): void
{
	if (htmlElement != null)
	{
		var ctxRoot = new CtxRoot();
		ctxRoot.render(content, htmlElement);
	}
}

export interface Renderer
{
	render: () => any;
	afterAttach?: () => void;
	beforeDetach?: () => void;
}

