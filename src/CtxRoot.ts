import { childValType, ICtxRoot } from "./types";
import { Scope } from "./CtxScope";
import { Ctx } from "./Ctx";
import { addNodesTo } from "./CtxNodes";
import { log } from "lib/dbgutils";

export class CtxRoot extends Ctx implements ICtxRoot
{
	private htmlElement: Element;

	onBeforeAttach: (() => void) | undefined;

	constructor(htmlElement: Element)
	{
		super();

		this.htmlElement = htmlElement;
	}
	setContent(content: childValType)
	{
		const f = document.createDocumentFragment();

		Scope.use(this, () =>
		{
			addNodesTo(f, content);
		});

		this.invokeBeforeAttach();

		this.htmlElement.appendChild(f);
	}
	update()
	{
		throw new Error("not implemented");
	}
	getRootCtx()
	{
		return this;
	}
	invokeBeforeAttach()
	{
		log(console.debug, 'invokeBeforeAttach');

		if (this.onBeforeAttach) this.onBeforeAttach();
	}
}
