import { ICtxHtmlElementOwner, isCtxHtmlElementOwner, isCtxUpdatable, ICtxRoot, IPropVal, ICtxUpdatable } from './interfaces';
import { childValType } from './types';
import { CtxScope } from './CtxScope';

export abstract class Ctx
{
	private childCtxs: Ctx[] | null = null;
	private parentCtx: Ctx | null = null;
	private ctxHtmlOwner: ICtxHtmlElementOwner | null = null; // performance cache
	private ctxUpdateable: ICtxUpdatable | null = null; // performance cache
	private rootCtx: ICtxRoot | null; // performance cache

	constructor(rootCtx: ICtxRoot | null)
	{
		this.rootCtx = rootCtx;
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

			this.ctxHtmlOwner = <ICtxHtmlElementOwner><unknown>ctx;
		}

		return this.ctxHtmlOwner;
	}
	getParentUpdatableCtx()
	{
		if (!this.ctxUpdateable)
		{
			this.ctxUpdateable = <ICtxUpdatable><unknown>this.findSelfOrParent(ctx => isCtxUpdatable(ctx));
		}

		return <ICtxUpdatable>this.ctxUpdateable;
	}
	getRootCtx()
	{
		if (!this.rootCtx) throw new Error("this.rootCtx is undefined");

		return this.rootCtx;
	}
	protected findSelfOrParent(predicate: (ctx: Ctx) => boolean)
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
	protected _update(content: childValType)
	{
		this.removeChildren();

		const htmlElement = this.getHtmlElement();
		const innerHtml = CtxScope.use(this, () => this._renderHtml(content));

		const ctxRoot = this.getRootCtx();
		ctxRoot.beforeAttach(); // call between _renderHtml and setInnerHtml to give a chance to insert css styles

		this.setInnerHtml(htmlElement, innerHtml || '');
		this.setupChildren();
	}
	protected setupChildren()
	{
		this.afterAttach(true);

		this.forEachChild(ctx => ctx.setupChildren());

		this.afterAttach(false);
	}

	protected _renderHtml(content: childValType): string
	{
		throw new Error("Not implemented");
	}
	protected setInnerHtml(htmlElement: HTMLElement, innerHtml: string): void
	{
		throw new Error("Not implemented");
	}
	protected removeChildren()
	{
		this.beforeDetach(true);

		this.detachPropKeys();

		this.unregisterEventHandlersFromRoot();

		this.forEachChild(ctx =>
		{
			ctx.removeChildren();

			ctx.parentCtx = null;
		});

		this.childCtxs = null;

		this.beforeDetach(false);
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

	generateNextChildId()
	{
		const ctxRoot = this.getRootCtx();
		return ctxRoot.getNextChildId();
	}
	protected unregisterEventHandlersFromRoot()
	{
	}
	protected afterAttach(beforeChildren: boolean)
	{
	}
	protected beforeDetach(beforeChildren: boolean)
	{
	}
	protected detachPropKeys()
	{
	}
}
