import { PropDef, PropDefReadable } from './PropDefs';
import { Scope } from './CtxScope';
import { IPropVal, ICtx } from './types';

export class PropVal<T> implements PropDef<T>, IPropVal
{
	private ctxs = new Set<ICtx>();
	private insideSet: boolean | undefined; // to prevent infinite loops
	private _name: string | undefined;
	val: T;

	constructor(initialValue: T, name?: string)
	{
		this.val = initialValue;
		this._name = name;
	}

	get name()
	{
		return this._name;
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

				this.ctxUpdate();
			}
		}
		finally
		{
			this.insideSet = undefined;
		}
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

	ctxAdd(ctx: ICtx)
	{
		this.ctxs.add(ctx);
	}
	ctxRemove(ctx: ICtx)
	{
		this.ctxs.delete(ctx);
	}
	protected ctxAttach()
	{
		const ctx = Scope.getCurrent();
		if (ctx) ctx.addPropVal(this);
	}
	protected ctxUpdate()
	{
		this.ctxs.forEach(ctx => ctx.update());
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

		this.ctxUpdate();
	}
	setLength(length: number)
	{
		let a = this.get();

		if (a.length != length)
		{
			a.length = length;

			this.ctxUpdate();
		}
	}
}
