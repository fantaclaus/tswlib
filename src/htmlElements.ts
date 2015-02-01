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
		private propDef: tsw.props.PropDef<any>;

		value(propDef: tsw.props.PropDef<any>): elm
		{
			this.propDef = propDef;

			return this;
		}

		z_getPropDef(): tsw.props.PropDef<any>
		{
			return this.propDef;
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
	export class select extends elmWithValue
	{
		constructor()
		{
			super('select')
		}
	}
	export class option extends elm
	{
		constructor()
		{
			super('option')
		}

		value(val: string): option;
		value(val: () => string): option;
		value(val: any): option
		{
			this.attr('value', val);

			return this;
		}
		selected(val: boolean): option;
		selected(val: () => boolean): option;
		selected(val: any): option
		{
			this.attr('selected', val);

			return this;
		}
	}

	export class label extends elm
	{
		constructor()
		{
			super('label')
		}

		// "for" is a keyword. it can not be used as a property name in IE before version 9. so we use name "forRef" instead.
		forRef(ref: tsw.elements.Ref): label
		{
			this.attr('for', ref);

			return this;
		}
	}

	export class RadioGroup<T>
	{
		private propVal: tsw.props.PropVal<T>;
		private groupName: string;
		private refs: { key: T; ref: tsw.elements.Ref }[] = [];

		constructor(propVal: tsw.props.PropVal<T>, groupName: string)
		{
			this.propVal = propVal;
			this.groupName = groupName;
		}
		item(v: T): tsw.elements.input
		{
			var p = {
				get: () => this.propVal.get() == v,
				set: () => this.propVal.set(v),
			};

			var elm = new tsw.elements.input();
			elm.type('radio').value(p).attr('name', this.groupName).addRef(this.getRefFor(v));
			return elm;
		}
		label(v: T): tsw.elements.label
		{
			var elm = new tsw.elements.label();
			elm.forRef(this.getRefFor(v));
			return elm;
		}
		private getRefFor(v: T): tsw.elements.Ref
		{
			var keyRef = utils.arrayUtils.find(this.refs, kr => kr.key == v);
			if (keyRef == null)
			{
				keyRef = { key: v, ref: new tsw.elements.Ref() };
				this.refs.push(keyRef);
			}
			return keyRef.ref;
		}
	}
}
