module tsw.props
{
	export interface PropDef<T>
	{
		get: () => T;
		set: (v: T, fireOnChange: boolean) => void;
	}

	export class PropValBase
	{
		private contexts: tsw.render.CtxUpdatable[] = null;

		getContexts(): tsw.render.CtxUpdatable[]
		{
			return this.contexts;
		}
		bindCtx(ctx: tsw.render.CtxUpdatable): void
		{
			this.contexts = this.contexts || [];

			if (!tsw.utils.arrayUtils.contains(this.contexts, ctx))
			{
				//console.log('propDef %o: bindCtx from ctx %o', this, ctx);
				this.contexts.push(ctx);
			}
		}
		unbindCtx(ctx: tsw.render.CtxUpdatable): void
		{
			if (this.contexts)
			{
				var index = this.contexts.indexOf(ctx);
				if (index >= 0)
				{
					//console.log('propDef %o: unbindCtx from ctx %o; index=%o', this, ctx, index);
					this.contexts.splice(index, 1);
				}
			}
		}
	}

	export class PropVal<T> extends PropValBase implements PropDef<T>
	{
		private val: T;
		private insideSet = false;

		constructor(initialValue?: T)
		{
			super();
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

		isTrue(content: any): () => any
		{
			return () => this.get() && content;
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
