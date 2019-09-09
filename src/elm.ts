import { Ref } from './Ref';
import { attrValType, childValType, StyleRule, boolValType, EventHandlerMap, EventHandler } from "./types";

interface AttrNameValue
{
	attrName: string;
	attrValue: attrValType;
}

export class ElementGeneric
{
	private tagName: string | null = null;
	private _attrs: AttrNameValue[] | null = null;
	private _children: childValType[] | null = null;
	private eventHandlers: EventHandlerMap | null = null;
	private _refs: Ref[] | null = null;

	constructor(tagName: string)
	{
		this.tagName = tagName.toLowerCase();
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
	onclick(handler: EventHandler<MouseEvent> | null | undefined)
	{
		return this.on('click', handler);
	}

	on(eventName: "keydown" | "keyup", handler: EventHandler<KeyboardEvent> | null | undefined): this;
	on(eventName: "mouseup" | "click", handler: EventHandler<MouseEvent> | null | undefined): this;
	on(eventName: string, handler: EventHandler | null | undefined): this;
	on(eventName: string, handler: any)
	{
		if (eventName && handler instanceof Function)
		{
			if (this.eventHandlers == null) this.eventHandlers = new Map<string, EventHandler>();

			if (this.eventHandlers.has(eventName))
			{
				throw new Error(`Event handler "${eventName}" is already installed.`);
			}

			this.eventHandlers.set(eventName, <EventHandler>handler);
		}

		return this;
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
	/**
	 * @internal
	 */
	z_getTagName()
	{
		return this.tagName;
	}
	/**
	 * @internal
	 */
	z_getChildren()
	{
		return this._children;
	}
	/**
	 * @internal
	 */
	z_getAttrs()
	{
		return this._attrs;
	}
	/**
	 * @internal
	 */
	z_getEventHandlers()
	{
		return this.eventHandlers;
	}
	/**
	 * @internal
	 */
	z_getRefs()
	{
		return this._refs;
	}
}
