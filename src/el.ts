module tsw.elements
{
	export interface JQueryEventHandler
	{
		(e: JQueryEventObject): void;
	}

	export interface JQueryEventHandlerMap
	{
		[eventName: string]: JQueryEventHandler;
	}

	export class rawHtml
	{
		constructor(public value: string)
		{
		}
	}

	export class el
	{
		private tagName: string;
		private _attrs: { [name: string]: any };
		private _elements: any[];
		private classes: string[];
		private eventHandlers: JQueryEventHandlerMap;
		private refs: tsw.elRefs.elementRef[];

		z_renderId = false;

		constructor(tagName: string)
		{
			this.tagName = tagName;
		}

		attr(name: string, val: any): el
		{
			if (val == null)
			{
				if (this._attrs) delete this._attrs[name];
			}
			else
			{
				if (!this._attrs) this._attrs = {};
				this._attrs[name] = val;
			}

			return this;
		}

		private getAttr(name: string): string
		{
			if (!this._attrs) return null;

			var v = this._attrs[name];
			if (!v) return null;

			if (v instanceof Function)
			{
				v = v();
			}
			if (!v) return null;

			var s = v.toString();
			return s;
		}

		addRef(ref: tsw.elRefs.elementRef): el
		{
			if (!this.refs) this.refs = [];
			this.refs.push(ref);
			return this;
		}

		bind<T>(getter: () => T, setter?: (v: T) => void, eventFn?: () => void): el
		{
			var oldValue = getter();
			var isBool = typeof oldValue == 'boolean';
			if (isBool)
			{
				if (oldValue) this.attr('checked', 'checked')
			}
			else
			{
				this.attr('value', oldValue);
			}

			if (setter)
			{
				this.onEvents(['change', 'input'], e =>
				{
					var jqInput = $(e.target);
					var newValue = isBool ? jqInput.prop('checked') : jqInput.val();
					if (oldValue != newValue)
					{
						setter(newValue);

						if (eventFn) eventFn();
					}
				});
			}

			return this;
		}

		id(v: string): el
		{
			this.attr('id', v);

			if (this.refs)
			{
				this.refs.forEach(r => r.setRefId(v));
				this.z_renderId = true;
			}

			return this;
		}

		getId(): string
		{
			return this.getAttr('id');
		}

		cls(className: string[]): el;
		cls(className: string): el;
		cls(className: clsRef): el;
		cls(v: any): el
		{
			this.classes = this.classes || [];

			var vals = [];
			arrayUtils.addExpanded(vals, v);

			vals.forEach(v =>
			{
				var v2 = v instanceof clsRef ? (<clsRef>v).getName() : v;

				if (v2) this.classes.push(v2);
			});

			return this;
		}

		style(v: string): el
		{
			this.attr('style', v);

			return this;
		}

		data(name: string, val: string): el
		{
			this.attr('data-' + name, val);

			return this;
		}

		//getdata(name: string): string
		//{
		//	return this.getattr('data-' + name);
		//}

		children(vals: any): el
		{
			if (vals)
			{
				if (!this._elements) this._elements = [];

				arrayUtils.addExpanded(this._elements, vals);
			}

			return this;
		}
		z_getElements(): any[]
		{
			return this._elements;
		}

//		text(v: any): el
//		{
//			this.children(v);
//
//			return this;
//		}
//
//		html(v: string): el
//		{
//			this.children(new rawHtml(v));
//
//			return this;
//		}

		z_render(innerHtml: string): string
		{
			if (!this.tagName) return innerHtml || '';

			var html = '<' + this.tagName;

			if (this.classes)
			{
				var classes = this.classes.join(' ');
				if (classes) html += ' class=' + this.quoted(classes);
			}

			if (this._attrs)
			{
				for (var attrName in this._attrs)
				{
					if (this.z_renderId || attrName != 'id')
					{
						html += ' ' + attrName;

						var attrVal = this.getAttr(attrName);
						if (attrVal) html += '=' + this.quoted(attrVal);
					}
				}
			}

			if (innerHtml)
			{
				html += '>' + innerHtml + '</' + this.tagName + '>';
			}
			else
			{
				var tagName = this.tagName.toUpperCase();

				if (tagName == "IMG" || tagName == "INPUT" || tagName == "BR" ||
					tagName == "HR" || tagName == "BASE" || tagName == "COL" ||
					tagName == "COLGROUP" || tagName == "KEYGEN" || tagName == "META" || tagName == "WBR")
				{
					html += '>';
				}
				else
				{
					html += '></' + this.tagName + '>';
				}
			}

//			if (innerHtml)
//			{
//				html += '>' + innerHtml + '</' + this.tagName + '>';
//			}
//			else
//			{
//				html += ' />';
//			}

			return html;
		}
		private quoted(s: string): string
		{
			return '"' + htmlAttrEncode(s) + '"';

			function htmlAttrEncode(input: string): string
			{
				var encoded = '';

				for (var i = 0; i < input.length; i++)
				{
					var ch = input.charAt(i);
					var cc = input.charCodeAt(i);

					var ch2: string;

					if (cc < 32 || ch == '"' || ch == "'")
					{
						ch2 = '&#x' + cc.toString(16) + ';';
					}
					else
					{
						ch2 = ch;
					}

					encoded += ch2;
				}

				return encoded;
			}
		}

		z_getEventHandlers(): JQueryEventHandlerMap
		{
			return this.eventHandlers;
		}
		onclick(handler: JQueryEventHandler): el
		{
			return this.on('click', handler);
		}
		onEvents(eventNames: string[], handler: JQueryEventHandler): el
		{
			eventNames.forEach(e => this.on(e, handler));
			return this;
		}
		on(eventName: string, handler: JQueryEventHandler): el
		{
			if (!this.eventHandlers) this.eventHandlers = {};

			if (this.eventHandlers[eventName])
			{
				throw new Error(tsw.format('Event handler "${eventName}" is already installed.', {eventName: eventName}));
			}

			this.eventHandlers[eventName] = handler;

			return this;
		}
	}
}
