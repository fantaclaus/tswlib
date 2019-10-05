import { ElementGeneric } from './elm';
import { Ref } from './Ref';
import { boolValType, singleStringValType, PropDef, ElementValueInfo, IElementWithValue } from "./types";

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

export abstract class ElementWithValue<T extends elmValue> extends ElementGeneric implements IElementWithValue
{
	protected propDef: PropDef<T> | undefined;

	constructor(tagName: string, private propName: string)
	{
		super(tagName);
	}
	z_getValueInfos(): ElementValueInfo | ElementValueInfo[] | null | undefined
	{
		return this.propDef == null ? null : { propName: this.propName, propVal: this.propDef };
	}
}
export class ElementInput<T extends elmValue> extends ElementWithValue<T>
{
	constructor(type: string, propName: string)
	{
		super('input', propName);

		this.attr('type', type);
	}
	value(propDef: PropDef<T>)
	{
		this.propDef = propDef;

		return this;
	}
}
export class ElementInputText extends ElementInput<string>
{
	constructor()
	{
		super('text', 'value');
		this.autocomplete('off');
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
	constructor(type: string)
	{
		super(type, 'checked');
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
		super('textarea', 'value')
	}
	// value(propDef: PropDef<string>)
	// {
	// 	this.propDef = propDef;

	// 	return this;
	// }
	placeholder(v: string)
	{
		this.attr('placeholder', v);

		return this;
	}
}
export class ElementSelect extends ElementGeneric implements IElementWithValue
{
	private propInfos: ElementValueInfo[] | undefined;

	constructor()
	{
		super('select')
	}

	value(propDef: PropDef<string | null>)
	{
		if (this.propInfos == null) this.propInfos = [];

		this.propInfos.push({ propVal: propDef, propName: 'value' });

		return this;
	}
	selectedIndex(propDef: PropDef<number | null>)
	{
		if (this.propInfos == null) this.propInfos = [];

		this.propInfos.push({ propVal: propDef, propName: 'selectedIndex' });

		return this;
	}
	z_getValuePropName(): string
	{
		return "value";
	}
	z_getValueInfos(): ElementValueInfo | ElementValueInfo[] | null | undefined
	{
		return this.propInfos;
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
