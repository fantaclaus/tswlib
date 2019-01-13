import * as CtxUtils from './CtxUtils';
import { IPropVal, ICtxUpdatable } from './interfaces';

export class PropValBase implements IPropVal
{
	private ctxs = new Set<ICtxUpdatable>();

	ctxAdd(ctx: ICtxUpdatable)
	{
		this.ctxs.add(ctx);
	}
	ctxRemove(ctx: ICtxUpdatable)
	{
		this.ctxs.delete(ctx);
	}
	ctxGetAll()
	{
		return this.ctxs;
	}

	protected ctxAttach()
	{
		CtxUtils.attach(this);
	}
	protected ctxUpdate()
	{
		CtxUtils.update(this);
	}
}