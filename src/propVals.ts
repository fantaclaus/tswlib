import * as CtxUtils from './CtxUtils';
import { PropDef, PropDefReadable } from './PropDefs';

export class PropVal<T> implements PropDef<T>
{
	val: T;
	private insideSet = false; // to prevent infinite loops
	name: string;

	constructor(initialValue?: T)
	{
		if (initialValue !== undefined) this.val = initialValue;
	}
	get(): T
	{
		CtxUtils.attach(this);

		return this.val;
	}
	set(v: T): void
	{
		if (this.insideSet) return;
		this.insideSet = true;

		try
		{
			//console.group('propDef %s %o: set value %o', this.name, this, v);

			if (this.val !== v)
			{
				this.val = v;

				CtxUtils.update(this);

				if (this.onChanged) this.onChanged();
			}

			//console.groupEnd();
		}
		finally
		{
			this.insideSet = false;
		}
	}

	//getWithoutAttach(): T
	//{
	//	return this.val;
	//}
	//setWithoutUpdate(newVal: T): void
	//{
	//	this.val = newVal;
	//}

	onChanged: () => void;

	isTrue<V1, V2>(contentTrue: V1, contentFalse: V2)
	{
		return () => this.get() ? contentTrue : contentFalse;
	}
	isFalse<U>(content: U): () => false | U
	{
		return () => !this.get() && content;
	}
	isEqual<U>(val: T, content: U): () => false | U
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
	to<U>(to: (v: T) => U)
	{
		return {
			get: () => to(this.get()),
		};
	}
	asReadOnly()
	{
		return new PropValReadable(this);
	}
}

export class PropValReadable<T> implements PropDefReadable<T>
{
	private src: PropDefReadable<T>;

	constructor(src: PropDefReadable<T>)
	{
		this.src = src;
	}
	get()
	{
		return this.src.get();
	}
	clone()
	{
		return new PropValReadable(this.src);
	}
}

export class PropValArray<T> extends PropVal<T[]>
{
	constructor(items?: T[])
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

		CtxUtils.update(this);
	}
	setLength(length: number)
	{
		let a = this.get();

		if (a.length != length)
		{
			a.length = length;

			CtxUtils.update(this);
		}
	}
}
