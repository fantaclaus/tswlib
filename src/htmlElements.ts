module tsw.elements
{
	export class RawHtml
	{
		constructor(public value: string)
		{
		}
	}

	export class ElementButton extends ElementGeneric
	{
		constructor()
		{
			super('button')
		}
		type(val: stringValType)
		{
			this.attr('type', val);

			return this;
		}
	}
	export class ElementA extends ElementGeneric
	{
		constructor()
		{
			super('a')
		}
		href(val: stringValType)
		{
			this.attr('href', val);

			return this;
		}
	}
	export class ElementImg extends ElementGeneric
	{
		constructor()
		{
			super('img')
		}
		src(val: stringValType)
		{
			this.attr('src', val);

			return this;
		}
	}
	export class ElementWithValue extends ElementGeneric
	{
		protected propDef: tsw.global.PropDef<any>;

		z_getPropDef(): tsw.global.PropDef<any>
		{
			return this.propDef;
		}
		z_getValueAttrName(): string
		{
			return null;
		}
		z_getValuePropName(): string  // for jQuery.prop
		{
			return null;
		}
	}
	export class ElementInput<T> extends ElementWithValue
	{
		constructor(type: string)
		{
			super('input')
			this.attr('type', type);
		}
		value(propDef: tsw.global.PropDef<T>)
		{
			this.propDef = propDef;

			return this;
		}
		z_getValuePropName(): string
		{
			return 'value';
		}
	}
	export class ElementInputText extends ElementInput<string>
	{
		constructor()
		{
			super('text');
		}

		z_getValueAttrName(): string
		{
			return 'value';
		}

		placeholder(v: string)
		{
			this.attr('placeholder', v);

			return this;
		}
	}
	export class ElementInputCheckboxBase extends ElementInput<boolean>
	{
		z_getValueAttrName(): string
		{
			return 'checked';
		}
		z_getValuePropName(): string
		{
			return 'checked';
		}
	}
	export class ElementInputCheckbox extends ElementInputCheckboxBase
	{
		constructor()
		{
			super('checkbox');
		}
	}
	export class ElementInputRadio extends ElementInputCheckboxBase
	{
		constructor()
		{
			super('radio');
		}
	}
	export class ElementTextArea extends ElementWithValue
	{
		constructor()
		{
			super('textarea')
		}
		value(propDef: tsw.global.PropDef<string>)
		{
			this.propDef = propDef;

			return this;
		}
		z_getValuePropName(): string
		{
			return 'value';
		}
	}
	export class ElementSelect extends ElementWithValue
	{
		protected valuePropName: string;

		constructor()
		{
			super('select')
		}

		value(propDef: tsw.global.PropDef<string>)
		{
			this.propDef = propDef;
			this.valuePropName = "value";

			return this;
		}
		selectedIndex(propDef: tsw.global.PropDef<number>)
		{
			this.propDef = propDef;
			this.valuePropName = "selectedIndex";

			return this;
		}
		z_getValuePropName(): string
		{
			return this.valuePropName;
		}
	}
	export class ElementOption extends ElementGeneric
	{
		constructor()
		{
			super('option')
		}
		value(val: stringValType)
		{
			this.attr('value', val);

			return this;
		}
		selected(val: boolValType)
		{
			this.attr('selected', val);

			return this;
		}
	}
	export class ElementLabel extends ElementGeneric
	{
		constructor()
		{
			super('label')
		}

		// "for" is a keyword. it can not be used as a property name in IE before version 9. so we use name "forRef" instead.
		forRef(ref: tsw.Ref)
		{
			this.attr('for', ref);

			return this;
		}
	}

	export class RadioGroup<T>
	{
		private propVal: tsw.PropVal<T>;
		private groupName: string;
		private refs: { key: T; ref: tsw.Ref }[] = [];

		constructor(propVal: tsw.PropVal<T>, groupName: string)
		{
			this.propVal = propVal;
			this.groupName = groupName;
		}
		item(v: T): tsw.elements.ElementInputRadio
		{
			var p =
			{
				get: () => this.propVal.get() == v,
				set: () => this.propVal.set(v),
			};

			var elm = new tsw.elements.ElementInputRadio();
			elm.value(p).attr('name', this.groupName).addRef(this.getRefFor(v));
			return elm;
		}
		label(v: T): tsw.elements.ElementLabel
		{
			var elm = new tsw.elements.ElementLabel();
			elm.forRef(this.getRefFor(v));
			return elm;
		}
		private getRefFor(v: T): tsw.Ref
		{
			var keyRef = tsw.internal.arrayUtils.find(this.refs, kr => kr.key == v);
			if (keyRef == null)
			{
				keyRef = { key: v, ref: new tsw.Ref() };
				this.refs.push(keyRef);
			}
			return keyRef.ref;
		}
	}
}
