import { Ref } from './Ref';
import { attrValType, childValType, boolValType, multiStringValType, singleStringValType, AttrNameValue, ElmEventMapItem, EventHandler, WindowEventMap2, privates } from "./types";

export class StyleRule
{
	constructor(public propName: string, public propValue: singleStringValType)
	{
	}
}

export class ElementGeneric
{
	private _tagName: string;
	private _attrs: AttrNameValue[] | undefined;
	private _children: childValType[] | undefined;
	private _eventHandlers: ElmEventMapItem[] | undefined;
	protected _refs: Ref[] | undefined;

	constructor(tagName: string)
	{
		// empty tagName means this is a document fragment
		this._tagName = tagName.toUpperCase();
	}

	attr(name: string, val: attrValType = '')
	{
		this.addAttr(name, val);

		return this;
	}
	id(val: singleStringValType)
	{
		this.addAttr('id', val);

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
			this.addHandler({ eventName, handleEvent: handler, eventType: 'dom' });
		}

		return this;
	}
	private addHandler(item: ElmEventMapItem)
	{
		if (this._eventHandlers == null) this._eventHandlers = [];

		this._eventHandlers.push(item);
	}

	addRef(ref: Ref<Element> | null)
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

	[privates.ElementGeneric.tagName]()
	{
		return this._tagName;
	}
	z_children()
	{
		return this._children;
	}
	z_attrs()
	{
		return this._attrs;
	}
	z_events()
	{
		return this._eventHandlers;
	}
	z_getRefs()
	{
		return this._refs;
	}
}
