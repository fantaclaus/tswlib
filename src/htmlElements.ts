import { ElementGeneric } from './elm';
import { Ref } from './Ref';
import { PropDef } from './PropDefs';
import { boolValType, singleStringValType } from "./types";

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
	type(val: singleStringValType)
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
		this.href("#");
	}
	href(val: singleStringValType)
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
	src(val: singleStringValType)
	{
		this.attr('src', val);

		return this;
	}
}

export type elmValue = string | number | boolean | null;

export interface IElementWithValue
{
	z_getValueAttrName(): string | null;
	z_getValuePropName(): string;
}

export abstract class ElementWithValue<T extends elmValue> extends ElementGeneric implements IElementWithValue
{
	protected propDef: PropDef<T> | undefined;

	/**
	 * @internal
	 */
	z_getPropDef()
	{
		return this.propDef;
	}
	/**
	 * @internal
	 */
	z_getValueAttrName(): string | null
	{
		return null;
	}
	/**
	 * @internal
	 */
	abstract z_getValuePropName(): string;
}
export class ElementInput<T extends elmValue> extends ElementWithValue<T>
{
	constructor(type: string)
	{
		super('input')
		this.attr('type', type);
	}
	value(propDef: PropDef<T>)
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
		this.autocomplete('off');
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
	autocomplete(v: singleStringValType)
	{
		this.attr('autocomplete', v);

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
export class ElementTextArea extends ElementWithValue<string>
{
	constructor()
	{
		super('textarea')
	}
	value(propDef: PropDef<string>)
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
export class ElementSelect extends ElementWithValue<string | null>
{
	constructor()
	{
		super('select')
	}

	value(propDef: PropDef<string | null>)
	{
		this.propDef = propDef;

		return this;
	}
	z_getValuePropName(): string
	{
		return "value";
	}
}
export class ElementSelectByIndex extends ElementWithValue<number | null>
{
	constructor()
	{
		super('select')
	}

	selectedIndex(propDef: PropDef<number | null>)
	{
		this.propDef = propDef;

		return this;
	}
	/**
	 * @internal
	 */
	z_getValuePropName(): string
	{
		return "selectedIndex";
	}
}
export class ElementOption extends ElementGeneric
{
	constructor()
	{
		super('option')
	}
	value(val: singleStringValType)
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
export class ElementTD extends ElementGeneric
{
	colSpan(val: number)
	{
		this.attr('colSpan', val);

		return this;
	}
	rowSpan(val: number)
	{
		this.attr('rowSpan', val);

		return this;
	}
}
