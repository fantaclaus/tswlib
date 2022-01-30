import { privates, tswElement } from './elm';
import { boolValType, singleStringValType, PropDef, ElementValueInfo, ValueChangeHandler, nothing } from "./types";
import { tswRef } from './ref';

export class tswRawHtml
{
	constructor(public value: string)
	{
	}
}

export class tswElementButton extends tswElement
{
	constructor()
	{
		super('button')
	}
	type(val: singleStringValType)
	{
		this.addAttr('type', val);

		return this;
	}
}
export class tswElementA extends tswElement
{
	constructor()
	{
		super('a')
		this.href("#");
	}
	href(val: singleStringValType)
	{
		this.addAttr('href', val);

		return this;
	}
}
export class tswElementImg extends tswElement
{
	constructor()
	{
		super('img')
	}
	src(val: singleStringValType)
	{
		this.addAttr('src', val);

		return this;
	}
}

export type elmValue = string | number | boolean | null;

export abstract class tswElementWithValueBase extends tswElement
{
	protected onChange: ValueChangeHandler | nothing;

	onValueChanged(onChange: ValueChangeHandler | nothing)
	{
		this.onChange = onChange;

		return this;
	}

	[privates.ElementWithValueBase.getOnValueChanged](): ValueChangeHandler | nothing
	{
		return this.onChange;
	}

	abstract [privates.ElementWithValueBase.getValueInfos](): ElementValueInfo | ElementValueInfo[] | nothing;
}

export abstract class tswElementWithValue<T extends elmValue> extends tswElementWithValueBase
{
	protected propDef: PropDef<T> | undefined;

	constructor(tagName: string, private propName: string)
	{
		super(tagName);
	}
	value(propDef: PropDef<T>)
	{
		this.propDef = propDef;

		return this;
	}
	[privates.ElementWithValueBase.getValueInfos](): ElementValueInfo | ElementValueInfo[] | nothing
	{
		return this.propDef == null ? null : cast<ElementValueInfo>({
			propName: this.propName,
			propVal: this.propDef,
		});
	}
}
export class tswElementInput<T extends elmValue> extends tswElementWithValue<T>
{
	constructor(type: string, propName: string)
	{
		super('input', propName);

		this.addAttr('type', type);
	}
}
export class tswElementInputText extends tswElementInput<string>
{
	constructor()
	{
		super('text', 'value');
		this.autocomplete('off');
	}

	placeholder(v: singleStringValType)
	{
		this.addAttr('placeholder', v);

		return this;
	}
	autocomplete(v: singleStringValType)
	{
		this.addAttr('autocomplete', v);

		return this;
	}
}
export class tswElementInputCheckboxBase extends tswElementInput<boolean>
{
	constructor(type: string)
	{
		super(type, 'checked');
	}
}
export class tswElementInputCheckbox extends tswElementInputCheckboxBase
{
	constructor()
	{
		super('checkbox');
	}
}
export class tswElementInputRadio extends tswElementInputCheckboxBase
{
	constructor()
	{
		super('radio');
	}
}
export class tswElementTextArea extends tswElementWithValue<string>
{
	constructor()
	{
		super('textarea', 'value')
	}
	placeholder(v: singleStringValType)
	{
		this.addAttr('placeholder', v);

		return this;
	}
}
export class tswElementSelect extends tswElementWithValueBase
{
	private propInfos?: ElementValueInfo[];

	constructor()
	{
		super('select')
	}

	value(propDef: PropDef<string>)
	{
		if (this.propInfos == null) this.propInfos = [];

		this.propInfos.push(cast<ElementValueInfo>({
			propVal: propDef,
			propName: 'value',
		}));

		return this;
	}
	selectedIndex(propDef: PropDef<number>)
	{
		if (this.propInfos == null) this.propInfos = [];

		this.propInfos.push(cast<ElementValueInfo>({
			propVal: propDef,
			propName: 'selectedIndex',
		}));

		return this;
	}
	[privates.ElementWithValueBase.getValueInfos](): ElementValueInfo | ElementValueInfo[] | nothing
	{
		return this.propInfos;
	}
}
export class tswElementOption extends tswElement
{
	constructor()
	{
		super('option')
	}
	value(val: singleStringValType)
	{
		this.addAttr('value', val);

		return this;
	}
	selected(val: boolValType)
	{
		this.addAttr('selected', val);

		return this;
	}
}
export class tswElementLabel extends tswElement
{
	constructor()
	{
		super('label')
	}

	// "for" is a keyword. it can not be used as a property name in IE before version 9. so we use name "forRef" instead.
	forId(id: singleStringValType)
	{
		this.addAttr('for', id);

		return this;
	}
	/** @deprecated Use forId() instead */
	forRef(ref: tswRef | nothing)
	{
		console.warn('obsolete method: tswElementLabel forRef(). replace it with forId()');
		return this;
	}
}
export class tswElementTD extends tswElement
{
	colSpan(val: number)
	{
		this.addAttr('colSpan', val);

		return this;
	}
	rowSpan(val: number)
	{
		this.addAttr('rowSpan', val);

		return this;
	}
}

export function cast<T>(v: T)
{
	return v;
}
