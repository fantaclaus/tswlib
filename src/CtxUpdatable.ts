import { Ctx } from './Ctx';
import { IPropVal, ICtxUpdatable, implements_CtxUpdatable, isCtxUpdatable } from './interfaces';
import * as CtxUtils from './CtxUtils';

export abstract class CtxUpdatable extends Ctx implements ICtxUpdatable
{
	private [implements_CtxUpdatable] = true;

	private propVals: Set<IPropVal> | undefined;

	abstract update(): void;

	protected detachPropKeys()
	{
		CtxUtils.removeCtx(this);

		if (this.propVals)
		{
			this.propVals.forEach(pv => pv.ctxRemove(this));

			this.propVals = undefined;
		}
	}
	addPropVal(propVal: IPropVal)
	{
		if (this.propVals == null) this.propVals = new Set<IPropVal>();

		this.propVals.add(propVal);
		propVal.ctxAdd(this);
	}
	isAnyParentInList(contexts: Set<ICtxUpdatable>)
	{
		let ctx: Ctx = this;

		while (true)
		{
			const ctxParent = ctx.getParent();
			if (!ctxParent) return false;

			if (isCtxUpdatable(ctxParent) && contexts.has(ctxParent)) return true;

			ctx = ctxParent;
		}
	}
}
