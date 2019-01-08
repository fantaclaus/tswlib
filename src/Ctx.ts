import { CtxHtmlElementOwner, isCtxHtmlElementOwner, isCtxUpdatable, ICtxRoot, isICtxRoot } from './interfaces';

export abstract class Ctx
{
	private childCtxs: Ctx[] | null = null;
	private parentCtx: Ctx | null = null;
	private ctxHtmlOwner: CtxHtmlElementOwner | null = null; // performance cache
	private ctxUpdateable: Ctx | null = null; // performance cache
	private rootCtx: ICtxRoot | null; // performance cache

	protected id: string | undefined;

	constructor(rootCtx: ICtxRoot | null)
	{
		this.rootCtx = rootCtx;
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
		if (!this.ctxHtmlOwner)
		{
			const ctx = this.findSelfOrParent(ctx => isCtxHtmlElementOwner(ctx));
			if (ctx == null) throw new Error("CtxHtmlElementOwner not found");

			this.ctxHtmlOwner = <CtxHtmlElementOwner><unknown>ctx;
		}

		return this.ctxHtmlOwner;
	}
	getParentUpdatableCtx()
	{
		if (!this.ctxUpdateable)
		{
			this.ctxUpdateable = this.findSelfOrParent(ctx => isCtxUpdatable(ctx));
		}

		return this.ctxUpdateable;
	}
	getRootCtx()
	{
		if (!this.rootCtx) throw new Error("this.rootCtx is undefined");

		return this.rootCtx;
	}
	private findSelfOrParent(predicate: (ctx: Ctx) => boolean)
	{
		let ctx: Ctx | null = this;

		while (ctx != null)
		{
			if (predicate(ctx)) return ctx;

			ctx = ctx.parentCtx;
		}

		return null;
	}
	forEachChild(action: (ctx: Ctx) => void)
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
	protected getHtmlElement()
	{
		const ctxElm = this.getParentHtmlElmOwnerCtx();
		return ctxElm.getHtmlElement();
	}

	generateNextChildId(): string
	{
		const ctxRoot = this.getRootCtx();
		return ctxRoot.getNextChildId();
	}
	protected unregisterEventHandlersFromRoot()
	{
		this.forEachChild(ctx => ctx.unregisterEventHandlersFromRoot());
	}
	protected afterAttach()
	{
		this.forEachChild(ctx => ctx.afterAttach());
	}
	protected beforeDetach()
	{
		this.forEachChild(ctx => ctx.beforeDetach());
	}
}
