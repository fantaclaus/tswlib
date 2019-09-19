import { PropDef, PropDefReadable } from './PropDefs';

export class PropVal<T> implements PropDef<T>
{
	val: T;
	private insideSet = false; // to prevent infinite loops
	//name: string;

	constructor(initialValue: T)
	{
		this.val = initialValue;
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
			// console.group('propDef %o: set value %o', this, v);

			if (this.val !== v)
			{
				this.val = v;

				this.ctxUpdate();
			}
		}
		finally
		{
			// console.groupEnd();

			this.insideSet = false;
		}
	}

	protected ctxAttach()
	{
		throw new Error("not implemented");
	}
	protected ctxUpdate()
	{
		throw new Error("not implemented");
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
