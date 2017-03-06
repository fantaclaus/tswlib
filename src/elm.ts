/**
 * @internal
 */
namespace tsw.internal
{
	export class StyleRule
	{
		propName: string;
		propValue: elements.attrValType;
	}
	export interface EventHandlerMap
	{
		[eventName: string]: elements.EventHandler;
	}
}

namespace tsw.elements
{
	export type attrValSimpleType = string | number | boolean | null;
	export type attrValType = attrValSimpleType | (() => attrValSimpleType) | global.PropDefReadable<attrValSimpleType>;
	export type attrValType2 = attrValType | internal.StyleRule;
	export type stringValType = string | null | (() => string | null) | global.PropDefReadable<string | null>;
	export type boolValType = boolean | (() => boolean) | global.PropDefReadable<boolean>;

	export type childSimpleValType = string | number | boolean | null;
	export type childComplexValType = childSimpleValType | childSimpleValType[];
	export type childValType = childComplexValType | (() => childComplexValType) | global.PropDefReadable<childComplexValType> | Renderer;

	interface AttrNameValue
	{
		attrName: string;
		attrValue: elements.attrValType2;
	}

	export interface EventHandler
	{
		(e: JQueryEventObject, target: HTMLElement): void;
	}

	export class ElementGeneric
	{
		private tagName: string | null = null;
		private _attrs: AttrNameValue[] | null = null;
		private _children: childValType[] | null = null;
		private eventHandlers: internal.EventHandlerMap | null = null;
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
				const v = new internal.StyleRule();
				v.propName = name;
				v.propValue = val;

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
		children(items: childValType)
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

		private addAttr(name: string, val: attrValType2): void
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
}
