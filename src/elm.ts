import { Ref } from './Ref';
import { attrValType, childValType, StyleRule, boolValType, multiStringValType, singleStringValType, attrValTypeInternal, attrValTypeInternal2 } from "./types";
import { Scope } from './CtxScope';
import { CtxAttr } from './CtxAttr';

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
					const ctx = new CtxAttr(el, attrName, attrValue);
					ctx.setAttrVal();
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
