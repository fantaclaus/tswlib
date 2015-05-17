module tsw.elements
{
	export class RawHtml
	{
		constructor(public value: string)
		{
		}
	}

	export class ElementButton extends Element
	{
		constructor()
		{
			super('button')
		}

		type(val: string): ElementButton;
		type(val: () => string): ElementButton;
		type(val: tsw.props.PropDefReadable<string>): ElementButton;
		type(val: any): ElementButton
		{
			this.attr('type', val);

			return this;
		}
	}
	export class ElementA extends Element
	{
		constructor()
		{
			super('a')
		}

		href(val: string): ElementA;
		href(val: () => string): ElementA;
		href(val: tsw.props.PropDefReadable<string>): ElementA;
		href(val: any): ElementA
		{
			this.attr('href', val);

			return this;
		}
	}
	export class ElementImg extends Element
	{
		constructor()
		{
			super('img')
		}

		src(val: string): ElementImg;
		src(val: () => string): ElementImg;
		src(val: tsw.props.PropDefReadable<string>): ElementImg;
		src(val: any): ElementImg
		{
			this.attr('src', val);

			return this;
		}
	}
	export class ElementWithValue extends Element
	{
		protected propDef: tsw.props.PropDef<any>;

		z_getPropDef(): tsw.props.PropDef<any>
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
		value(propDef: tsw.props.PropDef<T>): Element
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

		placeholder(v: string): ElementInput<string>
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
		value(propDef: tsw.props.PropDef<string>): Element
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

		value(propDef: tsw.props.PropDef<string>): Element
		{
			this.propDef = propDef;
			this.valuePropName = "value";

			return this;
		}
		selectedIndex(propDef: tsw.props.PropDef<number>): ElementSelect
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
	export class ElementOption extends Element
	{
		constructor()
		{
			super('option')
		}

		value(val: string): ElementOption;
		value(val: () => string): ElementOption;
		value(val: any): ElementOption
		{
			this.attr('value', val);

			return this;
		}
		selected(val: boolean): ElementOption;
		selected(val: () => boolean): ElementOption;
		selected(val: any): ElementOption
		{
			this.attr('selected', val);

			return this;
		}
	}
	export class ElementLabel extends Element
	{
		constructor()
		{
			super('label')
		}

		// "for" is a keyword. it can not be used as a property name in IE before version 9. so we use name "forRef" instead.
		forRef(ref: tsw.elements.Ref): ElementLabel
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
		private getRefFor(v: T): tsw.elements.Ref
		{
			var keyRef = tsw.internal.arrayUtils.find(this.refs, kr => kr.key == v);
			if (keyRef == null)
			{
				keyRef = { key: v, ref: new tsw.elements.Ref() };
				this.refs.push(keyRef);
			}
			return keyRef.ref;
		}
	}
}
