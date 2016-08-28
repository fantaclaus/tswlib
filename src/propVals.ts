import * as CtxUtils from './CtxUtils';
import { utils } from './utils';
import { PropDef, PropDefReadable } from './PropDefs';

export class PropVal<T> implements PropDef<T>
{
	val: T;
	private insideSet = false; // to prevent infinite loops
	name: string;

	constructor(initialValue?: T)
	{
		this.val = initialValue;
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
	select<U>(to: (v: T) => U): PropDefReadable<U>
	{
		return {
			get: () => to(this.get()),
		};
	}
}

export class PropValArray<T> extends PropVal<T[]>
{
	constructor(items?: T[])
	{
		super(items);
	}
	addItem(item: T, index?: number)
	{
		let a = this.get();

		if (utils.isUndefined(index))
		{
			a.push(item);
		}
		else
		{
			a.splice(index, 0, item);
		}

		CtxUtils.update(this);
	}
}
