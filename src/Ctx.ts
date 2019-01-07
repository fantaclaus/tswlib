import { CtxScope } from './CtxScope';
import * as CtxUtils from './CtxUtils';
import { childValType } from "./types";
import * as utils from './utils';

export abstract class Ctx
{
	private lastChildId: number | null = null;
	private childCtxs: Ctx[] | null = null;
	private parentCtx: Ctx | null = null;

	public rootCtx: Ctx;

	protected id: string | undefined;

	constructor(rootCtx: Ctx | null)
	{
		this.rootCtx = rootCtx ? rootCtx : this;
	}

	getId()
	{
		if (this.id == null) throw new Error('id is undefined');

		return this.id;
	}
	getParent()
	{
		return this.parentCtx;
	}
	getParentHtmlElmOwnerCtx()
	{
		return this.findSelfOrParent<CtxHtmlElementOwner>(ctx => ctx instanceof CtxHtmlElementOwner);
	}
	getParentUpdatableCtx()
	{
		return this.findSelfOrParent<CtxUpdatable>(ctx => ctx instanceof CtxUpdatable);
	}
	getRootCtx()
	{
		return this.rootCtx;
	}
	protected beforeAttach()
	{
	}
	private findSelfOrParent<T extends Ctx>(predicate: (ctx: Ctx) => boolean)
	{
		let ctx: Ctx | null = this;

		while (ctx != null)
		{
			if (predicate(ctx)) return <T>ctx;

			ctx = ctx.parentCtx;
		}

		return null;
	}
	protected forEachChild(action: (ctx: Ctx) => void)
	{
		if (this.childCtxs) this.childCtxs.forEach(ctx => action(ctx));
	}

	addChildCtx(ctx: Ctx)
	{
		this.childCtxs = this.childCtxs || [];
		this.childCtxs.push(ctx);
		ctx.parentCtx = this;
	}
	protected removeChildren()
	{
		if (this.childCtxs)
		{
			this.childCtxs.forEach(ctx =>
			{
				ctx.removeChildren();

				ctx.parentCtx = null;
			});

			this.childCtxs = null;
		}
	}
	hasChildren()
	{
		return this.childCtxs != null && this.childCtxs.length > 0;
	}
	protected unregisterEventHandlers()
	{
		const ctxRoot = this.getRootCtx();

		this.unregisterEventHandlersFromRoot(ctxRoot);
	}
	unregisterEventHandlersFromRoot(ctxRoot: Ctx)
	{
		this.forEachChild(ctx => ctx.unregisterEventHandlersFromRoot(ctxRoot));
	}
	protected afterAttach()
	{
		this.forEachChild(ctx => ctx.afterAttach());
	}
	protected beforeDetach()
	{
		this.forEachChild(ctx => ctx.beforeDetach());
	}
	protected getHtmlElement(): HTMLElement | null
	{
		const ctxElm = this.getParentHtmlElmOwnerCtx();
		return ctxElm && ctxElm.getHtmlElement();
	}

	private getNextChildId()
	{
		if (this.id == null) throw new Error('id is undefined');

		this.lastChildId = (this.lastChildId || 0) + 1;
		return utils.appendDelimited(this.id, '-', this.lastChildId.toString());
	}
	generateNextChildId(): string
	{
		const ctxRoot = this.getRootCtx();

		return ctxRoot.getNextChildId();
	}

	protected _update(content: childValType)
	{
		this.beforeDetach();

		this.detachPropKeys();

		this.unregisterEventHandlers();

		this.removeChildren();

		const htmlElement = this.getHtmlElement();
		if (htmlElement)
		{
			const innerHtml = CtxScope.use(this, () => this._renderHtml(content));

			const ctxRoot = this.getRootCtx();
			ctxRoot.beforeAttach(); // call between _renderHtml and setInnerHtml to give a chance to insert css styles

			this.setInnerHtml(htmlElement, innerHtml || '');
			this.afterAttach();
		}
	}
	protected abstract _renderHtml(content: childValType): string;
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string)
	{
		throw new Error("setInnerHtml is not supported by this class");
	}
	private detachPropKeys()
	{
		const ctxs: Ctx[] = [];
		this.collectChildContexts(ctxs);

		CtxUtils.removeCtxs(ctxs);
	}
	private collectChildContexts(ctxs: Ctx[])
	{
		ctxs.push(this);

		this.forEachChild(ctx => ctx.collectChildContexts(ctxs));
	}
}

export abstract class CtxHtmlElementOwner extends Ctx
{
	abstract getTagName(): string;
}

export abstract class CtxUpdatable extends Ctx
{
	abstract update(): void;
}
