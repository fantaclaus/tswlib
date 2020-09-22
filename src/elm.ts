import { tswRef } from './ref';
import { attrValType, childValType, boolValType, multiStringValType, singleStringValType, AttrNameValue, ElmEventMapItem, EventHandler, WindowEventMap2, EventKind } from "./types";

export namespace privates
{
	export namespace ElementGeneric
	{
		export const tagName = Symbol('ElementGeneric_tagName');
		export const ns = Symbol('ElementGeneric_ns');
		export const children = Symbol('ElementGeneric_children');
		export const addHandler = Symbol('ElementGeneric_addHandler');
		export const attrs = Symbol('ElementGeneric_attrs');
		export const events = Symbol('ElementGeneric_events');
		export const getRefs = Symbol('ElementGeneric_getRefs');
	}
	export namespace ElementWithValueBase
	{
		export const getValueInfos = Symbol('ElementGeneric_getValueInfos');
	}
}

export class tswStyleRule
{
	constructor(public propName: string, public propValue: singleStringValType)
	{
	}
}

export class tswElement
{
	private _tagName: string;
	private _ns: string | undefined;
	private _attrs: AttrNameValue[] | undefined;
	private _children: childValType[] | undefined;
	private _eventHandlers: ElmEventMapItem[] | undefined;
	protected _refs: tswRef[] | undefined;

	constructor(tagName: string, ns?: string)
	{
		// empty tagName means this is a document fragment
		this._tagName = tagName;
		this._ns = ns;
	}

	attr(name: string, val: attrValType)
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
			const sr = new tswStyleRule(name, val);
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
			this[privates.ElementGeneric.addHandler]({ eventName, handleEvent: handler, eventType: 'dom', eventKind: EventKind.onRoot });
		}

		return this;
	}
	onEventDirect<K extends keyof WindowEventMap2>(eventName: K, handler: EventHandler<WindowEventMap2[K]> | null | undefined): this;
	onEventDirect(eventName: string, handler: EventHandler<Event> | null | undefined)
	{
		if (eventName && handler instanceof Function)
		{
			this[privates.ElementGeneric.addHandler]({ eventName, handleEvent: handler, eventType: 'dom', eventKind: EventKind.direct });
		}

		return this;
	}
	[privates.ElementGeneric.addHandler](item: ElmEventMapItem)
	{
		if (this._eventHandlers == null) this._eventHandlers = [];

		this._eventHandlers.push(item);
	}

	addRef(ref: tswRef<Element> | null)
	{
		if (ref != null)
		{
			this._refs = this._refs || [];
			this._refs.push(ref);
		}
		return this;
	}

	private addAttr(name: string, val: attrValType | multiStringValType | tswStyleRule): void
	{
		if (!this._tagName) throw new Error("Can not set attributes on document fragment");

		this._attrs = this._attrs || [];

		this._attrs.push({ attrName: name, attrValue: val });
	}

	// implementation

	[privates.ElementGeneric.tagName]() { return this._tagName; }
	[privates.ElementGeneric.ns]() { return this._ns; }
	[privates.ElementGeneric.children]() { return this._children; }
	[privates.ElementGeneric.attrs]() { return this._attrs; }
	[privates.ElementGeneric.events]() { return this._eventHandlers; }
	[privates.ElementGeneric.getRefs]() { return this._refs; }
}
