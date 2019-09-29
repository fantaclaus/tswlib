import { childValType } from "./types";
import { Scope } from "./CtxScope";
import { Ctx } from "./Ctx";
import { addNodesTo } from "./CtxNodes";

export class CtxRoot extends Ctx
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
		Scope.use(this, () =>
		{
			addNodesTo(this.htmlElement, content);
		});
	}
	update()
	{
		throw new Error("not implemented");
	}
}
