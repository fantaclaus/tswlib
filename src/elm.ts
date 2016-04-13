﻿import { PropDefReadable,Ref } from './props';

export class StyleRule
{
	propName: string;
	propValue: attrValType;
}
interface NameValue
{
	name: string;
	value: attrValType | StyleRule;
}
export interface JQueryEventHandlerMap
{
	[eventName: string]: JQueryEventHandler;
}

type attrValSimpleType = string|number|boolean;
export type attrValType = attrValSimpleType | (() => attrValSimpleType) | PropDefReadable<attrValSimpleType>;
export type stringValType = string | (() => string) | PropDefReadable<string>;
export type boolValType = boolean | (() => boolean) | PropDefReadable<boolean>;

interface JQueryEventHandler
{
	(e: JQueryEventObject, target: HTMLElement): void;
}

export class ElementGeneric
{
	private tagName: string = null;
	private _attrs: NameValue[] = null;
	private _children: NameValue[] = null;
	private eventHandlers: JQueryEventHandlerMap = null;
	private _refs: Ref[] = null;

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
	cls(val: stringValType)
	{
		this.attr('class', val);
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
			var v = new StyleRule();
			v.propName = name;
			v.propValue = val;

			this.addAttr('style', v);
		}

		return this;
	}
	data(name: string, val: stringValType)
	{
		this.attr('data-' + name, val);

		return this;
	}
	disabled(val: boolValType)
	{
		this.attr('disabled', val);
		return this;
	}
	children(items: any)
	{
		if (items != null)
		{
			this._children = this._children || [];
			this._children.push(items);
		}
		return this;
	}
	onclick(handler: JQueryEventHandler)
	{
		return this.on('click', handler);
	}
	onEvents(eventNames: string[], handler: JQueryEventHandler)
	{
		eventNames.forEach(e => this.on(e, handler));
		return this;
	}
	on(eventName: string, handler: JQueryEventHandler)
	{
		if (eventName && handler instanceof Function)
		{
			this.eventHandlers = this.eventHandlers || {};

			if (this.eventHandlers[eventName])
			{
				throw new Error(`Event handler "${eventName}" is already installed.`);
			}

			this.eventHandlers[eventName] = handler;
		}

		return this;
	}

	addRef(ref: Ref)
	{
		if (ref != null)
		{
			this._refs = this._refs || [];
			this._refs.push(ref);
		}
		return this;
	}

	private addAttr(name: string, val: attrValType | StyleRule): void
	{
		this._attrs = this._attrs || [];
		this._attrs.push({ name: name.toLowerCase(), value: val });
	}
	/**
	 * @internal
	 */
	z_getTagName(): string
	{
		return this.tagName;
	}
	/**
	 * @internal
	 */
	z_getChildren(): any[]
	{
		return this._children;
	}
	/**
	 * @internal
	 */
	z_getAttrs(): NameValue[]
	{
		return this._attrs;
	}
	/**
	 * @internal
	 */
	z_getEventHandlers(): JQueryEventHandlerMap
	{
		return this.eventHandlers;
	}
	/**
	 * @internal
	 */
	z_getRefs(): Ref[]
	{
		return this._refs;
	}
}
