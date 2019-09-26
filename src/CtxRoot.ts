import { childValType, childValTypePropDefReadable, Renderer } from "./types";
import { RawHtml } from "./htmlElements";
import { ElementGeneric } from "./elm";
import { Scope } from "./CtxScope";
import { Ctx } from "./Ctx";
import { addNodesTo } from "./renderNodes";

export class CtxRoot extends Ctx
{
	private htmlElement: HTMLElement;

	onBeforeAttach: (() => void) | undefined;

	constructor(htmlElement: HTMLElement)
	{
		super();

		this.htmlElement = htmlElement;
	}
	setContent(content: childValType)
	{
		Scope.use(this, () =>
		{
			const f = document.createDocumentFragment();

			addNodesTo(f, content);

			if (this.onBeforeAttach) this.onBeforeAttach();

			this.htmlElement.innerHTML = '';
			this.htmlElement.appendChild(f);
		});
	}
	update()
	{
		throw new Error("not implemented");
	}
}
