import { Ref } from './Ref';
import { attrValType, childValType, StyleRule, boolValType } from "./types";
import { EventHandler, ElmEventMapItem } from './EventHandler';
import { RootEventHandlerDom } from './RootEventHandler';

interface AttrNameValue
{
	attrName: string;
	attrValue: attrValType;
}

interface WindowEventMap2 extends WindowEventMap
{
	"input": InputEvent;
}

export class ElementGeneric
{
	private _tagName: string | null = null;
	private _attrs: AttrNameValue[] | null = null;
	private _children: childValType[] | null = null;
	private _eventHandlers: ElmEventMapItem[] | null = null;
	private _refs: Ref[] | null = null;

	constructor(tagName: string)
	{
		this._tagName = tagName.toLowerCase();
	}

	attr(name: string, val: attrValType = true)
	{
		if (name != null)
		{
			this.addAttr(name, val);
		}

		return this;
	}
	cls(val: attrValType)
	{
		if (val instanceof Array)
		{
			val.forEach(v => this.cls(v));
		}
		else
		{
			this.attr('class', val);
		}

		return this;
	}
	style(val: attrValType)
	{
		this.attr('style', val);

		return this;
	}
	styleRule(name: string, val: attrValType)
	{
		if (name != null && val != null)
		{
			const v = new StyleRule(name, val);
			this.addAttr('style', v);
		}

		return this;
	}
	data(name: string, val: attrValType)
	{
		this.attr('data-' + name, val);

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
			this.addHandler({ eventName, handler, eventType: RootEventHandlerDom.EventType });
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

	private addAttr(name: string, val: attrValType): void
	{
		this._attrs = this._attrs || [];
		this._attrs.push({ attrName: name.toLowerCase(), attrValue: val });
	}

	// internal methods

	z_getTagName()
	{
		return this._tagName;
	}
	z_getChildren()
	{
		return this._children;
	}
	z_getAttrs()
	{
		return this._attrs;
	}
	z_getEventHandlers()
	{
		return this._eventHandlers;
	}
	z_getRefs()
	{
		return this._refs;
	}
}
