module tsw.props
{
	export interface PropDef<T>
	{
		get: () => T;
		set?: (v: T) => void;
	}

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
			tsw.render.CtxUtils.attach(this);

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

					tsw.render.CtxUtils.update(this);

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
		//converted<U>(to: (v: T) => U, from: (v: U) => T): PropVal<U>
		//{
		//	var curVal = to(this.val);
		//
		//	var p = new PropVal<U>(curVal);
		//
		//	this.onChanged = () => p.set(to(this.val));
		//	p.onChanged = () => this.set(from(p.val));
		//
		//	return p;
		//}
	}
}
