﻿import { tswRef } from './ref';
import { attrValType, childValType, boolValType, multiStringValType, singleStringValType, AttrNameValue, ElmEventMapItem, EventHandler, EventKind, nothing, attrValTypeInternal, attrValTypeEx } from "./types";

export namespace privates
{
	export namespace ElementGeneric
	{
		export const tagName = Symbol('ElementGeneric_tagName');
		export const ns = Symbol('ElementGeneric_ns');
		export const children = Symbol('ElementGeneric_children');
		export const addHandler = Symbol('ElementGeneric_addHandler');
		export const attrs = Symbol('ElementGeneric_attrs');
		export const attrsCaseSensitive = Symbol('ElementGeneric_attrsCaseSensitive');
		export const events = Symbol('ElementGeneric_events');
		export const getRefs = Symbol('ElementGeneric_getRefs');
	}
	export namespace ElementWithValueBase
	{
		export const getValueInfos = Symbol('ElementGeneric_getValueInfos');
		export const getOnValueChanged = Symbol('ElementGeneric_getOnValueChanged');
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
	private _ns?: string;
	private _attrs?: AttrNameValue[];
	private _attrsCaseSensitive: boolean;
	private _children?: childValType[];
	private _eventHandlers?: ElmEventMapItem[];
	protected _refs?: tswRef[];

	constructor(tagName: string, ns?: string, _attrsCaseSensitive = false)
	{
		// empty tagName means this is a document fragment
		this._tagName = tagName;
		this._ns = ns;
		this._attrsCaseSensitive = _attrsCaseSensitive;
	}

	attr(name: string, val: attrValType)
	{
		this.addAttr(name, val);

		return this;
	}
	attrEx(name: string, conv: (v: any) => string, val: attrValTypeEx)
	{
		this.addAttr(name, val, conv);

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
			this.addAttr('style', val, v => name + ':' + v);
		}

		return this;
	}
	data(name: string, val: singleStringValType)
	{
		this.addAttr('data-' + name.toLowerCase(), val);

		return this;
	}
	disabled(val: boolValType)
	{
		this.addAttr('disabled', val);
		return this;
	}
	hidden(val: boolValType)
	{
		this.addAttr('hidden', val);
		return this;
	}
	children(items: childValType)
	{
		if (items != null)
		{
			this._children = this._children ?? [];
			this._children.push(items);
		}
		return this;
	}

	onClick(handler: EventHandler<MouseEvent> | nothing)
	{
		return this.onEvent('click', handler);
	}
	onEvent<K extends keyof WindowEventMap>(eventName: K, handler: EventHandler<WindowEventMap[K]> | nothing): this;
	onEvent(eventName: string, handler: EventHandler<Event> | nothing): this;
	onEvent(eventName: string, handler: EventHandler<Event> | nothing)
	{
		if (eventName && handler instanceof Function)
		{
			this[privates.ElementGeneric.addHandler]({ eventName, handleEvent: handler, eventType: 'dom', eventKind: EventKind.onRoot });
		}

		return this;
	}
	onEventDirect<K extends keyof WindowEventMap>(eventName: K, handler: EventHandler<WindowEventMap[K]> | nothing): this;
	onEventDirect(eventName: string, handler: EventHandler<Event> | nothing): this;
	onEventDirect(eventName: string, handler: EventHandler<Event> | nothing)
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

	addRef(ref: tswRef | null)
	{
		if (ref != null)
		{
			const el = ref.get();
			if (el != null) throw new Error('ref is already attached');

			this._refs = this._refs ?? [];
			this._refs.push(ref);
		}
		return this;
	}

	protected addAttr(name: string, val: attrValTypeInternal, conv?: (v: string | object) => string): void
	{
		if (!this._tagName) throw new Error("Can not set attributes on document fragment");

		this._attrs = this._attrs ?? [];

		this._attrs.push({ attrName: name, attrValue: val, conv: conv });
	}

	// implementation

	[privates.ElementGeneric.tagName]() { return this._tagName; }
	[privates.ElementGeneric.ns]() { return this._ns; }
	[privates.ElementGeneric.children]() { return this._children; }
	[privates.ElementGeneric.attrs]() { return this._attrs; }
	[privates.ElementGeneric.attrsCaseSensitive]() { return this._attrsCaseSensitive; }
	[privates.ElementGeneric.events]() { return this._eventHandlers; }
	[privates.ElementGeneric.getRefs]() { return this._refs; }
}
