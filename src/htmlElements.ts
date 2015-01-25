module tsw.elements
{
	export class button extends elm
	{
		constructor()
		{
			super('button')
		}

		type(val: string): button;
		type(val: () => string): button;
		type(val: any): button
		{
			this.attr('type', val);

			return this;
		}
	}

	export class a extends elm
	{
		constructor()
		{
			super('a')
		}

		href(val: string): a;
		href(val: () => string): a;
		href(val: any): a
		{
			this.attr('href', val);

			return this;
		}
	}

	export class img extends elm
	{
		constructor()
		{
			super('img')
		}

		src(val: string): img;
		src(val: () => string): img;
		src(val: any): img
		{
			this.attr('src', val);

			return this;
		}
	}

	export class elmWithValue extends elm
	{
		private _valuePropDef: tsw.props.PropDef<any>;

		value<T>(propDef: tsw.props.PropDef<T>): elm
		{
			this._valuePropDef = propDef;

			return this;
		}

		z_getValuePropDef(): tsw.props.PropDef<any>
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

		type(val: string): input;
		type(val: () => string): input;
		type(val: any): input
		{
			this.attr('type', val);

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
