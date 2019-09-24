import { IPropVal, ICtx } from "./types";

export abstract class Ctx implements ICtx
{
	private propVals: Set<IPropVal> | undefined;
	private childCtxs: Set<Ctx> | undefined;

	addPropVal(propVal: IPropVal)
	{
		if (this.propVals == null) this.propVals = new Set<IPropVal>();

		this.propVals.add(propVal);
	}
	protected hasPropVals()
	{
		return this.propVals && this.propVals.size > 0;
	}
	protected attachToPropVals()
	{
		if (this.propVals)
		{
			this.propVals.forEach(pv => pv.ctxAdd(this));
		}
	}
	protected removePropVals()
	{
		if (this.propVals)
		{
			this.propVals.forEach(pv => pv.ctxRemove(this));
			this.propVals.clear();
		}
	}
	abstract update(): void;

	addChild(ctx: Ctx)
	{
		if (this.childCtxs == null) this.childCtxs = new Set<Ctx>();
		this.childCtxs.add(ctx);
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