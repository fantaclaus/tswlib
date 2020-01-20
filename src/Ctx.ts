import { IPropVal, ICtx, ICtxRoot } from "./types";
import { log, logcolor, logCtx, logPV } from "lib/dbgutils";
import * as UpdateQueue from './UpdateQueue';
import { tswRef } from "./ref";

export const enum NodeKind
{
	first,
	last,
}

export abstract class tswCtx implements ICtx
{
	id: number;
	private propVals: Set<IPropVal> | undefined | null;
	private childCtxs: Set<tswCtx> | undefined;
	protected ctxParent: tswCtx | null | undefined; // undefined -- not assigned yet; null -- detached, ctx should not be used anymore

	private static CtxLastId = 0;

	constructor()
	{
		this.id = ++tswCtx.CtxLastId;

		log(console.debug, logcolor("orange"), `CTX: new `, logCtx(this));
	}
	getRootCtx(): ICtxRoot | undefined
	{
		return undefined;
	}
	getParent(): ICtx | null | undefined
	{
		return this.ctxParent;
	}
	addCtxToParent(ctxParent: tswCtx)
	{
		if (ctxParent == null)
		{
			log(console.warn, logcolor("orange"), `CTX: not added: ctx `, logCtx(this), ` NO PARENT`);
		}
		else if (this.shouldBeAddedToParent())
		{
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
	protected shouldBeAddedToParent()
	{
		return this.hasChildren() || this.hasPropVals();
	}
	protected hasPropVals()
	{
		return isNotEmptySet(this.propVals);
	}
	protected hasChildren()
	{
		return isNotEmptySet(this.childCtxs);
	}
	protected forEachChild(action: (ctx: tswCtx) => void)
	{
		if (this.childCtxs) this.childCtxs.forEach(action);
	}
	public removeChildren()
	{
		this.cleanup();

		this.forEachChild(ctx =>
		{
			log(console.debug, logcolor("orange"), `CTX: remove child `, logCtx(ctx), ` from `, logCtx(this));

			ctx.ctxParent = null; // null means ctx is removed

			ctx.removeChildren();
		});

		if (this.childCtxs) this.childCtxs.clear();
	}
	protected cleanup()
	{
		UpdateQueue.removeFromUpdateQueue(this);
		this.detachPropVals();
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
	}

	abstract update(): void;
	addRef(ref: tswRef<Element>): void
	{
		throw new Error("Not implemented");
	}

	addChild(ctx: tswCtx)
	{
		if (this.childCtxs == null) this.childCtxs = new Set<tswCtx>();
		this.childCtxs.add(ctx);
		ctx.ctxParent = this;
	}
	replaceNode(nodeKind: NodeKind, oldNode: Node | null, newNode: Node | null): void
	{
	}
	protected notifySelfAndChildren(action: (ctx: tswCtx, beforeChildren: boolean) => void)
	{
		action(this, true);

		this.forEachChild(ctx =>
		{
			ctx.notifySelfAndChildren(action);
		});

		action(this, false);
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

export function isNotEmptySet<T>(s: Set<T> | null | undefined)
{
	return s && s.size > 0;
}
