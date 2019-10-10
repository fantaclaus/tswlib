import { g_CurrentContext } from './Scope';
import { IPropVal, ICtx, PropDef, PropDefReadable } from './types';
import { log, logPV, logCtx, logcolor } from 'lib/dbgutils';
import { addToUpdateQueue } from './UpdateQueue';

export class PropVal<T> implements PropDef<T>, IPropVal
{
	private ctxs: Set<ICtx> | undefined | null;
	private insideSet = false; // to prevent infinite loops
	dbg_name: string | undefined;
	val: T;

	constructor(initialValue: T, name?: string)
	{
		this.val = initialValue;
		this.dbg_name = name;
	}

	dbg_ctxs()
	{
		return this.ctxs;
	}
	ctxRemove(ctx: ICtx)
	{
		if (this.ctxs) this.ctxs.delete(ctx);
	}
	protected ctxAttach()
	{
		const ctx = g_CurrentContext.getCurrent();
		if (ctx)
		{
			ctx.addPropVal(this);

			if (!this.ctxs) this.ctxs = new Set<ICtx>();
			this.ctxs.add(ctx);

			log(console.debug, logcolor("magenta"), `PV: ctxAttach: `, logPV(this), ` <--o--> `, logCtx(ctx));
		}
	}
	get()
	{
		this.ctxAttach();

		return this.val;
	}
	set(v: T): void
	{
		if (this.insideSet) return;
		this.insideSet = true;

		try
		{
			if (this.val !== v)
			{
				this.val = v;

				this.updateContexts();
			}
		}
		finally
		{
			this.insideSet = false;
		}
	}
	protected updateContexts()
	{
		// detach first since it could be changed inside ctx.update()
		const ctxs = this.ctxs;
		this.ctxs = null;

		if (ctxs) addToUpdateQueue(ctxs); // UpdateQueue may take ownership of ctxs
	}
	isTrue(contentTrue: any, contentFalse?: any): () => any
	{
		return () => this.get() ? contentTrue : contentFalse;
	}
	isFalse(content: any): () => any
	{
		return () => !this.get() && content;
	}
	isEqual(val: T, content: any): () => any
	{
		return () => this.get() == val && content;
	}

	convert<U>(converter: { to: (v: T) => U; from: (v: U) => T; }): PropDef<U>
	{
		return {
			get: () => converter.to(this.get()),
			set: v => this.set(converter.from(v)),
		};
	}
	convert2<U>(to: (v: T) => U, from: (v: U) => T): PropDef<U>
	{
		return {
			get: () => to(this.get()),
			set: v => this.set(from(v)),
		};
	}
	to<U>(to: (v: T) => U): PropDefReadable<U>
	{
		return {
			get: () => to(this.get()),
		};
	}
}

export class PropValArray<T> extends PropVal<T[]>
{
	constructor(items: T[])
	{
		super(items);
	}
	getItem(index: number)
	{
		let a = this.get();
		return a[index];
	}
	addItem(item: T, index?: number)
	{
		let a = this.get();

		if (index == null)
		{
			a.push(item);
		}
		else
		{
			a.splice(index, 0, item);
		}

		this.updateContexts();
	}
	setLength(length: number)
	{
		let a = this.get();

		if (a.length != length)
		{
			a.length = length;

			this.updateContexts();
		}
	}
}
