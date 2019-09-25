import { IPropVal, ICtx } from "./types";

export interface ICtxDbg
{
	dbg_getChildren(): Set<Ctx> | undefined;
	dbg_getPropVals(): Set<IPropVal> | undefined | null;
}

export abstract class Ctx implements ICtx, ICtxDbg
{
	private propVals: Set<IPropVal> | undefined | null;
	private childCtxs: Set<Ctx> | undefined;

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

		if (propVals) propVals.forEach(pv => pv.ctxRemove(this));
	}
	abstract update(): void;

	addChild(ctx: Ctx)
	{
		if (this.childCtxs == null) this.childCtxs = new Set<Ctx>();
		this.childCtxs.add(ctx);
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