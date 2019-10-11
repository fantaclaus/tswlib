import { childValType, ICtxRoot, ElmEventMapItem } from "./types";
import { g_CurrentContext } from "./Scope";
import { Ctx } from "./Ctx";
import { addNodesTo } from "./CtxNodes";
import { log } from "lib/dbgutils";
import { RootEventHandler } from "./RootEventHandler";

export class CtxRoot extends Ctx implements ICtxRoot
{
	private htmlElement: Element;

	// give a chance to insert generated style rules into stylesheet (css-in-js) to avoid twitching before inserting nodes into DOM
	onBeforeAttach: (() => void) | undefined;
	private rootEventHandler: RootEventHandler | undefined;

	constructor(htmlElement: Element)
	{
		super();

		this.htmlElement = htmlElement;
	}
	setContent(content: childValType)
	{
		const f = document.createDocumentFragment();

		g_CurrentContext.use(this, () =>
		{
			addNodesTo(f, content);
		});

		this.invokeBeforeAttach();

		this.htmlElement.appendChild(f);

		this.notifyChildren((ctx, beforeChildren) => ctx.domChange(beforeChildren, true));
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
	attachElmEventHandler(el: Element, elmEventMapItem: ElmEventMapItem)
	{
		if (this.rootEventHandler == null) this.rootEventHandler = new RootEventHandler(this.htmlElement);

		this.rootEventHandler.attachElmEventHandler(el, elmEventMapItem);
	}
	detachElmEventHandlers(el: Element): void
	{
		if (this.rootEventHandler != null)
		{
			this.rootEventHandler.detachElmEventHandlers(el);
			if (!this.rootEventHandler.hasHandlers()) this.rootEventHandler = undefined;
		}
	}
	get dbg_rootEventHandler() { return this.rootEventHandler; }
}
