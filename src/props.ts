namespace tsw.global
{
	export interface PropDefReadable<T>
	{
		get: () => T;
	}
	export interface PropDef<T> extends PropDefReadable<T>
	{
		set: (v: T) => void;
	}
}

namespace tsw
{
	export class PropVal<T> implements tsw.global.PropDef<T>
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
			tsw.global.attachContext(this);

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

					tsw.global.updateContext(this);

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

		convert<U>(converter: { to: (v: T) => U; from: (v: U) => T; }): tsw.global.PropDef<U>
		{
			var p: tsw.global.PropDef<U> = {
				get: () => converter.to(this.get()),
				set: v => this.set(converter.from(v)),
			};

			return p;
		}
		convert2<U>(to: (v: T) => U, from: (v: U) => T): tsw.global.PropDef<U>
		{
			var p: tsw.global.PropDef<U> = {
				get: () => to(this.get()),
				set: v => this.set(from(v)),
			};

			return p;
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

			if (tsw.internal.utils.isUndefined(index))
			{
				a.push(item);
			}
			else
			{
				a.splice(index, 0, item);
			}

			tsw.global.updateContext(this);
		}
	}

	export class Ref implements tsw.global.PropDef<string>
	{
		private refId: string;

		get(): string
		{
			tsw.global.attachContext(this);

			return this.refId;
		}
		set(v: string): void
		{
			if (this.refId !== v)
			{
				//console.group('ref %s %o: set value %o', this.name, this, v);

				this.refId = v;

				tsw.global.updateContext(this);

				//console.groupEnd();
			}
		}

		asJQuery(): JQuery
		{
			return jQuery('#' + this.refId);
		}
	}
}
