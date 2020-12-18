import { privates, tswElement } from './elm';
import { boolValType, singleStringValType, PropDef, ElementValueInfo, ValueChangeHandler } from "./types";
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
		this.attr('type', val);

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
		this.attr('href', val);

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
		this.attr('src', val);

		return this;
	}
}

export type elmValue = string | number | boolean | null;

export abstract class tswElementWithValueBase extends tswElement
{
	abstract [privates.ElementWithValueBase.getValueInfos](): ElementValueInfo | ElementValueInfo[] | null | undefined;
}

export abstract class tswElementWithValue<T extends elmValue> extends tswElementWithValueBase
{
	protected propDef: PropDef<T> | undefined;
	protected onChange?: ValueChangeHandler<T>;

	constructor(tagName: string, private propName: string)
	{
		super(tagName);
	}
	value(propDef: PropDef<T>, onChange?: ValueChangeHandler<T>)
	{
		this.propDef = propDef;
		this.onChange = onChange;

		return this;
	}
	[privates.ElementWithValueBase.getValueInfos](): ElementValueInfo | ElementValueInfo[] | null | undefined
	{
		return this.propDef == null ? null : cast<ElementValueInfo>({
			propName: this.propName,
			propVal: this.propDef,
			onChange: this.onChange,
		});
	}
}
export class tswElementInput<T extends elmValue> extends tswElementWithValue<T>
{
	constructor(type: string, propName: string)
	{
		super('input', propName);

		this.attr('type', type);
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
		this.attr('placeholder', v);

		return this;
	}
	autocomplete(v: singleStringValType)
	{
		this.attr('autocomplete', v);

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
		this.attr('placeholder', v);

		return this;
	}
}
export class tswElementSelect extends tswElementWithValueBase
{
	private propInfos: ElementValueInfo[] | undefined;

	constructor()
	{
		super('select')
	}

	value(propDef: PropDef<string | null>, onChange?: ValueChangeHandler<string>)
	{
		if (this.propInfos == null) this.propInfos = [];

		this.propInfos.push(cast<ElementValueInfo>({
			propVal: propDef,
			propName: 'value',
			onChange: onChange,
		}));

		return this;
	}
	selectedIndex(propDef: PropDef<number | null>, onChange?: ValueChangeHandler<number>)
	{
		if (this.propInfos == null) this.propInfos = [];

		this.propInfos.push(cast<ElementValueInfo>({
			propVal: propDef,
			propName: 'selectedIndex',
			onChange: onChange,
		}));

		return this;
	}
	[privates.ElementWithValueBase.getValueInfos](): ElementValueInfo | ElementValueInfo[] | null | undefined
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
		this.attr('value', val);

		return this;
	}
	selected(val: boolValType)
	{
		this.attr('selected', val);

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
		this.attr('for', id);

		return this;
	}
	/**
	 * @deprecated replace it with forId()
	 */
	forRef(ref: tswRef | undefined)
	{
		console.warn('obsolete method: tswElementLabel forRef(). replace it with forId()');
		return this;
	}
}
export class tswElementTD extends tswElement
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

export function cast<T>(v: T)
{
	return v;
}
