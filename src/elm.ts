import { Ref } from './Ref';
import { attrValType, childValType, StyleRule, boolValType, multiStringValType, singleStringValType } from "./types";
import { PropDefReadable } from './PropDefs';

type attrValTypeInternal = attrValType | singleStringValType | multiStringValType | StyleRule;
type attrValTypeInternal2 = attrValTypeInternal | attrValTypeInternal[];

interface AttrNameValue
{
	attrName: string;
	attrValue: attrValTypeInternal;
}

interface WindowEventMap2 extends WindowEventMap
{
	"input": InputEvent;
}

interface EventHandler<T>
{
	(e: T, target: Element): void;
}

interface ElmEventMapItem
{
	eventName: string;
	eventType: string;
	handler: EventHandler<any>;
}

export class ElementGeneric
{
	private _tagName: string;
	private _attrs: AttrNameValue[] | undefined;
	private _children: childValType[] | undefined;
	private _eventHandlers: ElmEventMapItem[] | undefined;
	private _refs: Ref[] | undefined;

	constructor(tagName: string)
	{
		// empty tagName means this is a document fragment
		this._tagName = tagName.toLowerCase();
	}

	attr(name: string, val: attrValType = '')
	{
		this.addAttr(name, val);

		return this;
	}
	cls(val: multiStringValType)
	{
		this.addAttr('class', val);

		return this;
	}
	style(val: multiStringValType)
	{
		this.addAttr('style', val);

		return this;
	}
	styleRule(name: string, val: singleStringValType)
	{
		if (name != null)
		{
			const sr = new StyleRule(name, val);
			this.addAttr('style', sr);
		}

		return this;
	}
	data(name: string, val: singleStringValType)
	{
		this.attr('data-' + name.toLowerCase(), val);

		return this;
	}
	disabled(val: boolValType)
	{
		this.attr('disabled', val);
		return this;
	}
	hidden(val: boolValType)
	{
		this.attr('hidden', val);
		return this;
	}
	children(items: childValType)
	{
		if (items != null)
		{
			this._children = this._children || [];
			this._children.push(items);
		}
		return this;
	}

	onClick(handler: EventHandler<MouseEvent> | null | undefined)
	{
		return this.onEvent('click', handler);
	}
	onEvent<K extends keyof WindowEventMap2>(eventName: K, handler: EventHandler<WindowEventMap2[K]> | null | undefined): this;
	onEvent(eventName: string, handler: EventHandler<Event> | null | undefined)
	{
		if (eventName && handler instanceof Function)
		{
			this.addHandler({ eventName, handler, eventType: 'dom' });
		}

		return this;
	}

	addHandler(item: ElmEventMapItem)
	{
		if (this._eventHandlers == null) this._eventHandlers = [];

		this._eventHandlers.push(item);
	}

	addRef(ref: Ref | null)
	{
		if (ref != null)
		{
			this._refs = this._refs || [];
			this._refs.push(ref);
		}
		return this;
	}

	private addAttr(name: string, val: attrValType | multiStringValType | StyleRule): void
	{
		if (!this._tagName) throw new Error("Can not set attributes on document fragment");

		this._attrs = this._attrs || [];

		this._attrs.push({ attrName: name, attrValue: val });
	}

	// implementation

	z_addNodesTo(f: DocumentFragment)
	{
		if (this._tagName)
		{
			const el = document.createElement(this._tagName);

			if (this._attrs)
			{
				const attrs = new Map<string, attrValTypeInternal2>();

				this._attrs.forEach(a =>
				{
					if (a.attrName)
					{
						const attrName = a.attrName.toLowerCase();

						const v = attrs.get(attrName);
						if (v == null)
						{
							attrs.set(attrName, a.attrValue);
						}
						else if (v instanceof Array)
						{
							const vals: attrValTypeInternal[] = v;
							vals.push(a.attrValue);
						}
						else
						{
							const vals: attrValTypeInternal[] = [];
							vals.push(v);
							vals.push(a.attrValue);
							attrs.set(attrName, vals);
						}
					}
				});

				attrs.forEach((attrValue, attrName) =>
				{
					setAttrVal(el, attrName, attrValue);
				});
			}
			f.appendChild(el);
		}
		else
		{
			throw new Error("not implemented");
		}
	}
}

function setAttrVal(el: HTMLElement, attrName: string, attrVals: attrValTypeInternal2)
{
	const f = () =>
	{
		_setAttrVal(el, attrName, attrVals);
	};
	
	return f();
}
function _setAttrVal(el: HTMLElement, attrName: string, attrVals: attrValTypeInternal2)
{
	let result: string | null = null;

	const isMultiValueType = attrName == "class" || attrName == "style";
	const separator = attrName == "class" ? ' ' : attrName == "style" ? ';' : null;

	addAttrString(attrVals);

	if (result != null) el.setAttribute(attrName, result);

	function addAttrString(attrValue: attrValTypeInternal2)
	{
		if (attrValue == null || attrValue === false)
		{
			// single: remove attr
			// multi: not added
			if (!isMultiValueType) result = null;
		}
		else if (typeof attrValue == "string")
		{
			// single: set attr val
			// multi: add separated with separator
			if (isMultiValueType)
			{
				if (attrValue)
				{
					if (result)
					{
						result += separator;
						result += attrValue;
					}
					else
					{
						result = attrValue;
					}
				}
			}
			else
			{
				result = attrValue;
			}
		}
		else if (attrValue instanceof StyleRule)
		{
			if (attrValue.propName)
			{
				const ruleValue = getRuleValue(attrValue.propValue);
				if (ruleValue) addAttrString(attrValue.propName + ':' + ruleValue);
			}
		}
		else if (attrValue === true)
		{
			addAttrString('');
		}
		else if (attrValue instanceof Array)
		{
			attrValue.forEach(v => addAttrString(v));
		}
		else if (attrValue instanceof Function)
		{
			const v = attrValue();
			addAttrString(v);
		}
		else if (isPropDefReadable<any>(attrValue))
		{
			const v = attrValue.get();
			addAttrString(v);
		}
		else
		{
			addAttrString(attrValue.toString());
		}
	}
}

function getRuleValue(s: singleStringValType)
{
	if (s instanceof Function)
	{
		const v = s();
		return v;
	}
	else if (isPropDefReadable(s))
	{
		const v = s.get();
		return v;
	}
	else
	{
		return s;
	}
}
function isPropDefReadable<T>(v: any): v is PropDefReadable<T>
{
	return v && v.get instanceof Function;
}

