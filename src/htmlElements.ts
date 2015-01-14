module tsw.elements
{
	export class button extends elm
	{
		constructor()
		{
			super('button')
		}

		type(v: string): button
		{
			this.attr('type', v);

			return this;
		}
	}

	export class a extends elm
	{
		constructor()
		{
			super('a')
		}

		href(v: string): a
		{
			this.attr('href', v);

			return this;
		}
	}

	export class img extends elm
	{
		constructor()
		{
			super('img')
		}

		src(v: string): img
		{
			this.attr('src', v);

			return this;
		}
	}

	export class elmWithValue extends elm
	{
		private _valuePropDef: tsw.common.PropDef<any>;

		value<T>(propDef: tsw.common.PropDef<T>): elm
		{
			this._valuePropDef = propDef;

			return this;
		}

		z_getValuePropDef(): tsw.common.PropDef<any>
		{
			return this._valuePropDef;
		}
	}
	export class input extends elmWithValue
	{
		constructor()
		{
			super('input')
		}

		type(v: string): input
		{
			this.attr('type', v);

			return this;
		}

		// todo: may be remove this. replace with value
		checked(val: boolean): elm;
		checked(val: () => boolean): elm;
		checked(val: any): elm
		{
			this.attr('checked', val);
			return this;
		}

		placeholder(v: string): input
		{
			this.attr('placeholder', v);

			return this;
		}
	}
	export class textarea extends elmWithValue
	{
		constructor()
		{
			super('textarea')
		}
	}

	export class label extends elm
	{
		constructor()
		{
			super('label')
		}

//		for_(v: string): label
//		{
//			this.attr('for', v);
//
//			return this;
//		}

		// TODO: label for
//		forRef(ref: tsw.elRefs.elementRef): label
//		{
//			this.attr('for', () => ref.getId());
//
//			return this;
//		}
	}
}
