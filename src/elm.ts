module tsw.elements
{
	interface NameValue
	{
		name: string;
		value: any;
	}

	export class elm
	{
		private tagName: string;
		private _attrs: NameValue[];
		private _children: NameValue[];

		constructor(tagName: string)
		{
			this.tagName = tagName;
		}

		attr(name: string, val: string): elm;
		attr(name: string, val: () => string): elm;
		attr(name: string, val: any): elm
		{
			if (val != null)
			{
				this._attrs = this._attrs || [];
				this._attrs.push({name: name, value: val});
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
				this.attr('style', <any>{name: name, value: val});
			}

			return this;
		}

		data(name: string, val: string): elm;
		data(name: string, val: () => string): elm;
		data(name: string, val: any): elm
		{
			this.attr('data-' + name, val);

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
			return this;
		}

		// TODO: addRef(ref: tsw.elRefs.elementRef): elm
		//{
		//
		//}

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
	}
}
