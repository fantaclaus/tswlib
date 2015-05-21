module tsw.internal
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
	export interface JQueryEventHandlerMap
	{
		[eventName: string]: tsw.elements.JQueryEventHandler;
	}
}

module tsw.elements
{
	export type attrValSimpleType = string|number|boolean;
	export type attrValType = attrValSimpleType | (() => attrValSimpleType) | tsw.global.PropDefReadable<attrValSimpleType>;
	export type stringValType = string | (() => string) | tsw.global.PropDefReadable<string>;
	export type boolValType = boolean | (() => boolean) | tsw.global.PropDefReadable<boolean>;

	export interface JQueryEventHandler
	{
		(e: JQueryEventObject, target: HTMLElement): void;
	}

	export class ElementGeneric
	{
		private tagName: string = null;
		private _attrs: tsw.internal.NameValue[] = null;
		private _children: tsw.internal.NameValue[] = null;
		private eventHandlers: tsw.internal.JQueryEventHandlerMap = null;
		private _refs: Ref[] = null;

		constructor(tagName: string)
		{
			this.tagName = tagName.toLowerCase();
		}

		attr(name: string, val?: attrValType): ElementGeneric
		{
			if (name != null)
			{
				if (tsw.internal.utils.isUndefined(val)) val = true;
	
				this.z_addAttr(name, val);
			}

			return this;
		}
		cls(val: stringValType): ElementGeneric
		{
			this.attr('class', val);
			return this;
		}
		style(val: attrValType): ElementGeneric
		{
			this.attr('style', val);

			return this;
		}
		styleRule(name: string, val: attrValType): ElementGeneric
		{
			if (name != null && val != null)
			{
				var v = new tsw.internal.StyleRule();
				v.propName = name;
				v.propValue = val;
				
				this.z_addAttr('style', v);
			}

			return this;
		}
		data(name: string, val: stringValType): ElementGeneric
		{
			this.attr('data-' + name, val);

			return this;
		}
		disabled(val: boolValType): ElementGeneric
		{
			this.attr('disabled', val);
			return this;
		}
		children(items: any): ElementGeneric
		{
			this._children = this._children || [];
			this._children.push(items);
			return this;
		}
		onclick(handler: tsw.elements.JQueryEventHandler): ElementGeneric
		{
			return this.on('click', handler);
		}
		onEvents(eventNames: string[], handler: tsw.elements.JQueryEventHandler): ElementGeneric
		{
			eventNames.forEach(e => this.on(e, handler));
			return this;
		}
		on(eventName: string, handler: tsw.elements.JQueryEventHandler): ElementGeneric
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

		addRef(ref: Ref): ElementGeneric
		{
			this._refs = this._refs || [];
			this._refs.push(ref);
			return this;
		}

		z_addAttr(name: string, val: attrValType | tsw.internal.StyleRule): void
		{
			this._attrs = this._attrs || [];
			this._attrs.push({ name: name.toLowerCase(), value: val });
		}
		z_getTagName(): string
		{
			return this.tagName;
		}
		z_getChildren(): any[]
		{
			return this._children;
		}
		z_getAttrs(): tsw.internal.NameValue[]
		{
			return this._attrs;
		}
		z_getEventHandlers(): tsw.internal.JQueryEventHandlerMap
		{
			return this.eventHandlers;
		}
		z_getRefs(): Ref[]
		{
			return this._refs;
		}
	}
}
