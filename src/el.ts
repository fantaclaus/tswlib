/// <reference path="d.ts/jquery.d.ts" />
/// <reference path="clsref.ts" />
/// <reference path="control.ts" />
/// <reference path="elrefs.ts" />
/// <reference path="utils.ts" />

module tsw.elements
{
	interface EventHandlerInfo
	{
		eventName: string;
		selector: string;
		handler: JQueryEventHandler;
	}

	export interface JQueryEventHandler
	{
		(e: JQueryEventObject): void;
	}

	interface JQueryEventHandlerMap
	{
		[eventName: string]: JQueryEventHandler;
	}

	class EventManager
	{
		private static _NextId: number = 0;
		private static _AttachedDocumentEvents: { [name: string]: boolean };
		private static _EventHandlerMaps: { [eventHandlerId: string]: JQueryEventHandlerMap };

		public static EventHandlerIdAttrName: string = 'data-eventhandlerid';

		static GetFreeId(): string
		{
			return (EventManager._NextId++).toString();
		}

		static setHandlers(eventHandlerId: string, handlerMap: JQueryEventHandlerMap): void
		{
			if (!EventManager._EventHandlerMaps) EventManager._EventHandlerMaps = {};

			EventManager._EventHandlerMaps[eventHandlerId] = handlerMap;

			for (var eventName in handlerMap)
			{
				if (handlerMap.hasOwnProperty(eventName))
				{
					EventManager.ensureDocEventAttached(eventName);
				}
			}
		}

		private static ensureDocEventAttached(eventName: string): void
		{
			if (!EventManager._AttachedDocumentEvents) EventManager._AttachedDocumentEvents = {};

			if (!EventManager._AttachedDocumentEvents[eventName])
			{
				$(document).on(eventName, e =>
				{
					var r = EventManager.findHandler($(e.target), e.type);
					if (r)
					{
						if (eventName == 'click' && r.el.get(0).tagName == 'A')
						{
							e.preventDefault();
						}

						r.h(e);
					}
				});

				EventManager._AttachedDocumentEvents[eventName] = true;
			}
		}
		static findHandler(el: JQuery, eventName: string): { el: JQuery; h: JQueryEventHandler; }
		{
			while (el && el.length)
			{
				//var $target = el.closest('[' + EventManager.EventHandlerIdAttrName + ']');
				var eventHandlerId = el.attr(EventManager.EventHandlerIdAttrName);
				if (eventHandlerId)
				{
					var handlerMap = EventManager._EventHandlerMaps[eventHandlerId];
					if (handlerMap)
					{
						var h = handlerMap[eventName];
						if (h) return { el: el, h: h };
					}
				}

				el = el.parent();
			}

			return <any> null;
		}
		static removeInnerEventHandlers(jqParent: JQuery): void
		{
			var $els = jqParent.find('[' + EventManager.EventHandlerIdAttrName + ']');

			$els.each((index, el) =>
			{
				EventManager.removeEventHandlers($(el));
			});
		}
		static removeEventHandlers(jq: JQuery): void
		{
			if (EventManager._EventHandlerMaps)
			{
				//do not use .data('eventhandlerid') -- it is very memory consuming!
				var eventHandlerId = jq.attr(EventManager.EventHandlerIdAttrName);

				if (eventHandlerId) delete EventManager._EventHandlerMaps[eventHandlerId];
			}
		}
	}
	export class el
	{
		private tagName: string;
		private _attrs: { [name: string]: string };
		private _elements: any[];
		private _classes: string[];
		private _eventHandlers: EventHandlerInfo[];
		private _eventHandlers2: JQueryEventHandlerMap;

		constructor(tagName?: string)
		{
			this.tagName = tagName;
		}

		attr(name: string, val: any): el
		{
			if (this._attrs == null) this._attrs = {};

			if (val == null)
			{
				delete this._attrs[name];
			}
			else
			{
				this._attrs[name] = val.toString();
			}

			return this;
		}

		getattr(name: string): string
		{
			return this._attrs ? this._attrs[name] : null;
		}

		bind(ref: tsw.elRefs.elementRef): el
		{
			ref.attachToEl(this);

			return this;
		}

		id(v: string): el
		{
			this.attr('id', v);

			return this;
		}

		getId(): string
		{
			return this.getattr('id');
		}

		getOrCreateId(): string
		{
			var id = this.getId();

			if (!id)
			{
				id = idManager.getNextId();
				this.attr('id', id);
			}

			return id;
		}

		cls(className: string[]): el;
		cls(className: string): el;
		cls(className: clsRef): el;
		cls(className: any): el
		{
			this._classes = this._classes || [];

			if (className instanceof clsRef)
			{
				this._classes.push((<clsRef>className).getName());
			}
			else if (className instanceof Array)
			{
				(<string[]>className).forEach(name => this._classes.push(name));
			}
			else
			{
				this._classes.push(className);
			}

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
			this.appendChild(vals);

			return this;
		}

		private appendChild(v: any): void
		{
			if (v != null)
			{
				if (v instanceof Array)
				{
					for (var i = 0; i < v.length; i++)
					{
						var v2 = v[i];

						this.appendChild(v2);
					}
				}
				else if (v instanceof tsw.Control)
				{
					var subElements = (<tsw.Control> v).internalCreateElement();
					this.appendChild(subElements);
				}
				else
				{
					if (!this._elements) this._elements = [];

					this._elements.push(v);
				}
			}
		}

		text(v: any): el
		{
			var html = tsw.htmlEncode((v || '').toString());

			this.html(html);

			return this;
		}

		html(v: string): el
		{
			this._elements = this._elements || [];

			this._elements.push(v || '');

			return this;
		}

		render(): string
		{
			var innerHtml = elUtils.render(this._elements);

			if (!this.tagName) return innerHtml || '';

			var html: string = '<' + this.tagName;

			if (this._classes != null)
			{
				var classes = this._classes.join(' ');
				this.attr('class', classes);
			}

			if (this._attrs != null)
			{
				for (var attr in this._attrs)
				{
					html += ' ' + attr;

					var attrVal = this._attrs[attr];
					if (attrVal !== '') html += '="' + attrVal + '"';
				}
			}

			if (innerHtml == null)
			{
				html += ' />';
			}
			else
			{
				html += '>' + innerHtml + '</' + this.tagName + '>';
			}

			return html;
		}

		on(eventName: string, handler: JQueryEventHandler): el
		{
			var eventHandlerId = this.getattr(EventManager.EventHandlerIdAttrName);
			if (!eventHandlerId)
			{
				eventHandlerId = EventManager.GetFreeId();
				this.attr(EventManager.EventHandlerIdAttrName, eventHandlerId);
			}

			if (!this._eventHandlers2) this._eventHandlers2 = {};

			if (this._eventHandlers2[eventName])
			{
				throw new Error(tsw.format('Event handler "${eventName}" is already installed.', {eventName: eventName}));
			}

			this._eventHandlers2[eventName] = handler;

			return this;
		}

		onclick(handler: JQueryEventHandler): el
		{
			return this.on('click', handler);
		}

		onEvent(eventName: string, selector: string, handler: JQueryEventHandler): el
		{
			var ehi = <EventHandlerInfo>
			{
				eventName: eventName,
				selector: selector,
				handler: handler
			};

			if (!this._eventHandlers) this._eventHandlers = [];

			this._eventHandlers.push(ehi);

			this.getOrCreateId(); // ensure id exists for use in _attachEventHandlers later after inserting html to DOM

			return this;
		}

		attachEventHandlers(): void
		{
			this._attachEventHandlers();

			elUtils.attachEventHandlers(this._elements);
		}

		private _attachEventHandlers(): void
		{
			if (this._eventHandlers)
			{
				var id = this.getId();
				if (!id) throw 'id is not assigned';

				var jqThis = $('#' + id);

				for (var i = 0; i < this._eventHandlers.length; i++)
				{
					var ehi = this._eventHandlers[i];

					jqThis.on(ehi.eventName, ehi.selector, ehi.handler);
				}
			}

			if (this._eventHandlers2)
			{
				var eventHandlerId = this.getattr(EventManager.EventHandlerIdAttrName);
				EventManager.setHandlers(eventHandlerId, this._eventHandlers2);
			}
		}
	}

	export class elUtils
	{
		static setElements(jqParent: JQuery, els?: any): void
		{
			EventManager.removeInnerEventHandlers(jqParent);

			if (els)
			{
				if (els instanceof tsw.Control)
				{
					els = (<tsw.Control>els).internalCreateElement();
				}

				var html = elUtils.render(els);

				jqParent.html(html);

				elUtils.attachEventHandlers(els);
			}
			else
			{
				jqParent.empty();
			}
		}
		static replaceWithElements(jq: JQuery, elm?: tsw.elements.el): void
		{
			EventManager.removeEventHandlers(jq);
			EventManager.removeInnerEventHandlers(jq);

			if (elm)
			{
				var html = elUtils.render(elm);

				jq.replaceWith(html);

				elUtils.attachEventHandlers(elm);
			}
			else
			{
				jq.remove();
			}
		}

		public static render(els: any): string
		{
			if (!els) return '';

			if (els instanceof Array)
			{
				var innerHtml = '';

				for (var i = 0; i < els.length; i++)
				{
					var child = els[i];

					innerHtml += this.render(child);
				}

				return innerHtml;
			}
			else if (els instanceof el)
			{
				return (<el> els).render();
			}
			else
			{
				return els.toString();
			}
		}

		public static attachEventHandlers(els: any): void
		{
			if (!els) return;

			if (els instanceof Array)
			{
				for (var i = 0; i < els.length; i++)
				{
					var child = els[i];

					this.attachEventHandlers(child);
				}
			}
			else if (els instanceof el)
			{
				(<el> els).attachEventHandlers();
			}
		}
	}

	class idManager
	{
		private static nextId: number = 0;

		public static getNextId(): string
		{
			idManager.nextId++;
			return idManager.nextId.toString();
		}
	}
}
