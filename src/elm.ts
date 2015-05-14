module tsw.elements
{
	export class Ref implements tsw.props.PropDef<string>
	{
		private refId: string;

		get(): string
		{
			tsw.render.CtxUtils.attach(this);

			return this.refId;
		}
		set(v: string): void
		{
			if (this.refId !== v)
			{
				//console.group('ref %s %o: set value %o', this.name, this, v);

				this.refId = v;

				tsw.render.CtxUtils.update(this);

				//console.groupEnd();
			}
		}

		asJQuery(): JQuery
		{
			return jQuery('#' + this.refId);
		}
	}

	export type attrValSimpleType = string|number|boolean;
	export type attrValType = tsw.props.PropDefReadable<attrValSimpleType> | (() => attrValSimpleType) | attrValSimpleType;
	
	export class StyleRule
	{
		propName: string;
		propValue: attrValType;
	}	
	
    export interface NameValue
	{
		name: string;
		value: attrValType | StyleRule;
	}

	export class elm
	{
		private tagName: string = null;
		private _attrs: NameValue[] = null;
		private _children: NameValue[] = null;
		private eventHandlers: tsw.common.JQueryEventHandlerMap = null;
		private _refs: Ref[] = null;

		constructor(tagName: string)
		{
			this.tagName = tagName.toLowerCase();
		}

		attr(name: string, val?: attrValType): elm
		{
			if (!name) return;

			if (utils.isUndefined(val)) val = true;

			if (val != null)
			{
				this.z_addAttr(name, val);
			}

			return this;
		}
		cls(val: string | (() => string) | tsw.props.PropDefReadable<string>): elm
		{
			this.attr('class', val);
			return this;
		}
		style(val: attrValType): elm
		{
			this.attr('style', val);

			return this;
		}
		styleRule(name: string, val: attrValType): elm
		{
			if (val != null)
			{
				var v = new StyleRule();
				v.propName = name;
				v.propValue = val;
				
				this.z_addAttr('style', v);
			}

			return this;
		}
		data(name: string, val: string | (() => string) | tsw.props.PropDefReadable<string>): elm
		{
			this.attr('data-' + name, val);

			return this;
		}
		disabled(val: boolean | (() => boolean) | tsw.props.PropDefReadable<boolean>): elm
		{
			this.attr('disabled', val);
			return this;
		}
		children(items: any): elm
		{
			this._children = this._children || [];
			this._children.push(items);
			return this;
		}
		onclick(handler: tsw.common.JQueryEventHandler): elm
		{
			return this.on('click', handler);
		}
		onEvents(eventNames: string[], handler: tsw.common.JQueryEventHandler): elm
		{
			eventNames.forEach(e => this.on(e, handler));
			return this;
		}
		on(eventName: string, handler: tsw.common.JQueryEventHandler): elm
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

		addRef(ref: Ref): elm
		{
			this._refs = this._refs || [];
			this._refs.push(ref);
			return this;
		}

		z_addAttr(name: string, val: attrValType | StyleRule): void
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
		z_getAttrs(): NameValue[]
		{
			return this._attrs;
		}
		z_getEventHandlers(): tsw.common.JQueryEventHandlerMap
		{
			return this.eventHandlers;
		}
		z_getRefs(): Ref[]
		{
			return this._refs;
		}
	}
}
