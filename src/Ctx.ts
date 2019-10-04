import { IPropVal, ICtx, ICtxRoot } from "./types";
import { Scope } from "./CtxScope";
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
	private childCtxs: Set<Ctx> | undefined;
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
	addCtxToParent()
	{
		const ctxParent = Scope.getCurrent();
		if (ctxParent == null)
		{
			log(console.warn, `CTX: not added: ctx `, logCtx(this), ` NO PARENT`);
		}
		else if (this.hasPropVals() || this.hasChildren())
		{
			// const ctxParent = Scope.getCurrent();
			// if (!ctxParent) throw new Error("No scope parent");

			ctxParent.addChild(this);

			log(console.debug, `CTX: addChild: `, logCtx(this), ` to parent `, logCtx(ctxParent));
		}
		else
		{
			log(console.warn, `CTX: not added: `, logCtx(this), ` to parent `, logCtx(ctxParent));
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
			for (let pv of propVals)
			{
				log(console.debug, `CTX: remove pv: `, logPV(pv), ` from `, logCtx(this));

				pv.ctxRemove(this);
			}
		}

		if (this.childCtxs)
		{
			for (let ctx of this.childCtxs)
			{
				ctx.detachPropVals();
			}
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
			for (let ctx of this.childCtxs)
			{
				log(console.debug, `CTX: remove child `, logCtx(ctx), ` from `, logCtx(this));

				ctx.ctxParent = null;
			}

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
