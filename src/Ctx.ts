import { IPropVal, ICtx, ICtxRoot } from "./types";
import { Scope } from "./CtxScope";
import { log } from "lib/dbgutils";

export abstract class Ctx implements ICtx
{
	id: number;
	private propVals: Set<IPropVal> | undefined | null;
	private childCtxs: Set<Ctx> | undefined;
	protected ctxParent: Ctx | null = null;
	protected ctxRoot: ICtxRoot | undefined;

	private static CtxLastId = 0;
	private static Ctxs = new Set<Ctx>();

	constructor()
	{
		this.id = ++Ctx.CtxLastId;
		Ctx.Ctxs.add(this);

		log(console.debug,
			["%c", "color: orange"],
			`CTX: new `,
			["%c", "color: blue"],
			`<${this.id}> `,
			["%c", "color: black"],
			this);
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
			log(console.warn, `CTX: not added: ctx <${this.id}> this NO PARENT`);
		}
		else if (this.hasPropVals() || this.hasChildren())
		{
			// const ctxParent = Scope.getCurrent();
			// if (!ctxParent) throw new Error("No scope parent");

			ctxParent.addChild(this);

			log(console.debug,
				`CTX: addChild: `,
				["%c", "color: blue"],
				`<${this.id}> `,
				["%c", "color: black"],
				["%O", this],
				` to parent `,
				["%c", "color: blue"],
				`<${ctxParent.id}> `,
				["%c", "color: black"],
				["%O", ctxParent]);
		}
		else
		{
			log(console.warn,
				`CTX: not added: `,
				["%c", "color: blue"],
				`<${this.id}> `,
				["%c", "color: black"],
				["%O", this],
				` to parent `,
				["%c", "color: blue"],
				`<${ctxParent.id}> `,
				["%c", "color: black"],
				["%O", ctxParent]);
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

		if (propVals) propVals.forEach(pv =>
		{
			log(console.debug,
				`CTX: remove pv: `,
				["%c", "color: blue"],
				`<${pv.dbg_name}> `,
				["%c", "color: black"],
				['%O', pv],
				` from `,
				["%c", "color: blue"],
				`<${this.id}> `,
				["%c", "color: black"],
				['%O', this]);

			pv.ctxRemove(this);
		});
		if (this.childCtxs) this.childCtxs.forEach(ch => ch.detachPropVals());
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
				log(console.debug,
					`CTX: remove child `,
					["%c", "color: blue"],
					`<${ctx.id}> `,
					["%c", "color: black"],
					['%O', ctx],
					` from `,
					["%c", "color: blue"],
					`<${this.id}> `,
					["%c", "color: black"],
					['%O', this]);

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
	replaceNode(oldNode: Node | null, newNode: Node | null): void
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
