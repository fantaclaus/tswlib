module tsw.props
{
	export interface PropDef<T>
	{
		get: () => T;
		set?: (v: T, fireOnChange?: boolean) => void;
	}

	export class PropVal<T> implements PropDef<T>
	{
		private val: T;
		private insideSet = false; // to prevent infinite loops
		name: string;

		//
		//toString(): string
		//{
		//	return this.name;
		//}

		constructor(initialValue?: T)
		{
			this.val = initialValue;
		}
		get(): T
		{
			tsw.render.CtxUtils.attach(this);

			return this.val;
		}
		set(v: T, fireOnChange: boolean = false): void
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

					if (fireOnChange && this.onChanged) this.onChanged();
				}

				//console.groupEnd();
			}
			finally
			{
				this.insideSet = false;
			}
		}
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
	}
}
