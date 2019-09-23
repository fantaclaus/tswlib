export interface IPropVal
{

}

export abstract class Ctx
{
	private propVals: Set<IPropVal> | undefined;

	addPropVal(propVal: IPropVal)
	{
		if (this.propVals == null) this.propVals = new Set<IPropVal>();

		this.propVals.add(propVal);
		// propVal.ctxAdd(this);
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