/**
 * @internal
 */
namespace tsw.internal
{
	export class StyleRule
	{
		propName: string;
		propValue: tsw.elements.attrValType;
	}
	export interface NameValue
	{
		name: string;
		value: tsw.elements.attrValType | StyleRule;
	}
	export interface EventHandlerMap
	{
		[eventName: string]: tsw.elements.EventHandler;
	}
}

namespace tsw.elements
{
	export type attrValSimpleType = string | number | boolean;
	export type attrValType = attrValSimpleType | (() => attrValSimpleType) | tsw.global.PropDefReadable<attrValSimpleType>;
	export type stringValType = string | (() => string) | tsw.global.PropDefReadable<string>;
	export type boolValType = boolean | (() => boolean) | tsw.global.PropDefReadable<boolean>;

	export interface EventHandler
	{
		(e: JQueryEventObject, target: HTMLElement): void;
	}

	export class ElementGeneric
	{
		private tagName: string = null;
		private _attrs: tsw.internal.NameValue[] = null;
		private _children: tsw.internal.NameValue[] = null;
		private eventHandlers: tsw.internal.EventHandlerMap = null;
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
				var v = new tsw.internal.StyleRule();
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
		onclick(handler: EventHandler)
		{
			return this.on('click', handler);
		}
		onEvents(eventNames: string[], handler: EventHandler)
		{
			eventNames.forEach(e => this.on(e, handler));
			return this;
		}
		on(eventName: string, handler: EventHandler)
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

		private addAttr(name: string, val: attrValType | tsw.internal.StyleRule): void
		{
			this._attrs = this._attrs || [];
			this._attrs.push({ name: name.toLowerCase(), value: val });
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
}
