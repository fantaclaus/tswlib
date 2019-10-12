import { IPropVal, ICtx, ICtxRoot } from "./types";
import { g_CurrentContext } from "./Scope";
import { log, logcolor, logCtx, logPV } from "lib/dbgutils";

export const enum NodeKind
{
	first,
	last,
}

export abstract class Ctx implements ICtx
{
	id: number;
	private propVals: Set<IPropVal> | undefined | null;
	protected childCtxs: Set<Ctx> | undefined;
	protected ctxParent: Ctx | null = null;
	protected ctxRoot: ICtxRoot | undefined;

	private static CtxLastId = 0;

	constructor()
	{
		this.id = ++Ctx.CtxLastId;

		log(console.debug, logcolor("orange"), `CTX: new `, logCtx(this));
	}
	getRootCtx()
	{
		return this.ctxRoot;
	}
	getParent(): ICtx | null
	{
		return this.ctxParent;
	}
	addCtxToParent()
	{
		const ctxParent = g_CurrentContext.getCurrent();
		if (ctxParent == null)
		{
			log(console.warn, logcolor("orange"), `CTX: not added: ctx `, logCtx(this), ` NO PARENT`);
		}
		else if (this.hasPropVals() || this.hasChildren())
		{
			// const ctxParent = g_CurrentContext.getCurrent();
			// if (!ctxParent) throw new Error("No scope parent");

			ctxParent.addChild(this);

			log(console.debug, logcolor("orange"), `CTX: addChild: `, logCtx(this), ` to parent `, logCtx(ctxParent));
		}
		else
		{
			log(console.warn, logcolor("orange"), `CTX: not added: `, logCtx(this), ` to parent `, logCtx(ctxParent));
		}
	}
	addPropVal(propVal: IPropVal)
	{
		if (!this.propVals) this.propVals = new Set<IPropVal>();

		this.propVals.add(propVal);
	}
	protected hasPropVals()
	{
		return this.propVals && this.propVals.size > 0;
	}
	protected detachPropVals()
	{
		// detach first since collection could be changed

		const propVals = this.propVals;
		this.propVals = null;

		if (propVals)
		{
			propVals.forEach(pv =>
			{
				log(console.debug, logcolor("orange"), `CTX: remove pv: `, logPV(pv), ` from `, logCtx(this));

				pv.ctxRemove(this);
			});
		}

		if (this.childCtxs)
		{
			this.childCtxs.forEach(ctx =>
			{
				ctx.detachPropVals();
			});
		}
	}
	detachEventHandlers(): void
	{
		if (this.childCtxs)
		{
			this.childCtxs.forEach(ctx =>
			{
				ctx.detachEventHandlers();
			});
		}
	}
	protected hasChildren()
	{
		return this.childCtxs && this.childCtxs.size > 0;
	}
	protected removeChildren()
	{
		if (this.childCtxs)
		{
			this.childCtxs.forEach(ctx =>
			{
				log(console.debug, logcolor("orange"), `CTX: remove child `, logCtx(ctx), ` from `, logCtx(this));

				ctx.ctxParent = null;
			});

			this.childCtxs.clear();
		}
	}

	abstract update(): void;

	addChild(ctx: Ctx)
	{
		if (this.childCtxs == null) this.childCtxs = new Set<Ctx>();
		this.childCtxs.add(ctx);
		ctx.ctxParent = this;
	}
	replaceNode(nodeKind: NodeKind, oldNode: Node | null, newNode: Node | null): void
	{
	}
	protected notifyChildren(action: (ctx: Ctx, beforeChildren: boolean) => void)
	{
		if (this.childCtxs)
		{
			this.childCtxs.forEach(ctx =>
			{
				action(ctx, true);
				ctx.notifyChildren(action);
				action(ctx, false);
			});
		}
	}
	domChange(beforeChildren: boolean, attach: boolean): void
	{
	}

	dbg_getChildren()
	{
		return this.childCtxs;
	}
	dbg_getPropVals()
	{
		return this.propVals;
	}
}

/*
contexts:
	attrs (detach propvals)
	event handlers (unsubscribe)
	refs (set null & detach)
	before/after attach/detach (call)
	child nodes
*/
