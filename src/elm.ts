module tsw.elements
{
	export interface NameValue
	{
		name: string;
		value: any;
	}

	export class elementRef
	{
		asJQuery(): JQuery
		{
			return null;
		}
	}

	export class elm
	{
		private tagName: string;
		private _attrs: NameValue[];
		private _children: NameValue[];
		private eventHandlers: tsw.common.JQueryEventHandlerMap;

		constructor(tagName: string)
		{
			this.tagName = tagName.toLowerCase();
		}

		attr(name: string, val: any): elm;
		attr(name: string, val: () => any): elm;
		attr(name: string, val: any): elm
		{
			if (val != null)
			{
				this._attrs = this._attrs || [];
				this._attrs.push({name: name.toLowerCase(), value: val});
			}
			return this;
		}

		cls(val: string): elm;
		cls(val: () => string): elm;
		cls(val: any): elm
		{
			this.attr('class', val);
			return this;
		}

		style(name: string, val: string): elm;
		style(name: string, val: () => string): elm;
		style(val: string): elm;
		style(val: () => string): elm;
		style(name: any, val?: any): elm
		{
			if (tsw.utils.isUndefined(val))
			{
				this.attr('style', name);
			}
			else if (val != null)
			{
				this.attr('style', <any>{ name: name, value: val });
			}

			return this;
		}

		data(name: string, val: string): elm;
		data(name: string, val: () => string): elm;
		data(name: string, val: tsw.common.PropDef<any>): elm;
		data(name: string, val: any): elm
		{
			this.attr('data-' + name, val);

			return this;
		}

		disabled(val: boolean): elm;
		disabled(val: () => boolean): elm;
		disabled(val: any): elm
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
					throw new Error(tsw.utils.format('Event handler "${eventName}" is already installed.', {eventName: eventName}));
				}

				this.eventHandlers[eventName] = handler;
			}

			return this;
		}

		addRef(ref: elementRef): elm
		{
			// TODO: addRef
			return this;
		}

		// TODO: bind()

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
		z_setId(id: string): void
		{
			var item = tsw.utils.arrayUtils.find(this._attrs, a => a.name == 'id');
			if (item)
			{
				item.value = id;
			}
			else
			{
				this.attr('id', id);
			}
		}
		z_getEventHandlers(): tsw.common.JQueryEventHandlerMap
		{
			return this.eventHandlers;
		}
	}
}
