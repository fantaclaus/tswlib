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
	export type attrValType = attrValSimpleType | (() => attrValSimpleType) | tsw.PropDefReadable<attrValSimpleType>;
	export type stringValType = string | (() => string) | tsw.PropDefReadable<string>;
	export type boolValType = boolean | (() => boolean) | tsw.PropDefReadable<boolean>;

	export interface JQueryEventHandler
	{
		(e: JQueryEventObject, target: HTMLElement): void;
	}

	export class Element
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

		attr(name: string, val?: attrValType): Element
		{
			if (!name) return;

			if (tsw.internal.utils.isUndefined(val)) val = true;

			if (val != null)
			{
				this.z_addAttr(name, val);
			}

			return this;
		}
		cls(val: stringValType): Element
		{
			this.attr('class', val);
			return this;
		}
		style(val: attrValType): Element
		{
			this.attr('style', val);

			return this;
		}
		styleRule(name: string, val: attrValType): Element
		{
			if (val != null)
			{
				var v = new tsw.internal.StyleRule();
				v.propName = name;
				v.propValue = val;
				
				this.z_addAttr('style', v);
			}

			return this;
		}
		data(name: string, val: stringValType): Element
		{
			this.attr('data-' + name, val);

			return this;
		}
		disabled(val: boolValType): Element
		{
			this.attr('disabled', val);
			return this;
		}
		children(items: any): Element
		{
			this._children = this._children || [];
			this._children.push(items);
			return this;
		}
		onclick(handler: tsw.elements.JQueryEventHandler): Element
		{
			return this.on('click', handler);
		}
		onEvents(eventNames: string[], handler: tsw.elements.JQueryEventHandler): Element
		{
			eventNames.forEach(e => this.on(e, handler));
			return this;
		}
		on(eventName: string, handler: tsw.elements.JQueryEventHandler): Element
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

		addRef(ref: Ref): Element
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
