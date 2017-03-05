namespace tsw.elements
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
	export abstract class ElementWithValue extends ElementGeneric
	{
		protected propDef: tsw.global.PropDef<any>;

		/**
		 * @internal
		 */
		z_getPropDef(): tsw.global.PropDef<any>
		{
			return this.propDef;
		}
		/**
		 * @internal
		 */
		z_getValueAttrName(): string
		{
			return null;
		}
		/**
		 * @internal
		 */
		abstract z_getValuePropName(): string;  // for jQuery.prop
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
		/**
		 * @internal
		 */
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

		/**
		 * @internal
		 */
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
		/**
		 * @internal
		 */
		z_getValueAttrName(): string
		{
			return 'checked';
		}
		/**
		 * @internal
		 */
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
		placeholder(v: string)
		{
			this.attr('placeholder', v);

			return this;
		}
		/**
		 * @internal
		 */
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
		/**
		 * @internal
		 */
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
		forRef(ref: Ref)
		{
			this.attr('for', ref);

			return this;
		}
	}
}
