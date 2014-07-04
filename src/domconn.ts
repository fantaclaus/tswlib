module tsw
{
	export class DomConnector
	{
		private static nextId: number = 0;

		private attachedDocumentEvents: { [name: string]: boolean };
		private topHtmlElement: HTMLElement;
		private topControl: Control;
		private updateQueue: Control[];
		private id: string;
		preventLinkClickDefaultBehaviour = true;

		setId(v: string)
		{
			this.id = v;
		}
		attachTo(topHtmlElement: HTMLElement)
		{
			this.detach();

			this.topHtmlElement = topHtmlElement;
		}
		detach()
		{
			if (this.topHtmlElement)
			{
				jQuery(this.topHtmlElement).off();
				delete this.topHtmlElement;
			}
			if (this.attachedDocumentEvents)
			{
				delete this.attachedDocumentEvents;
			}
		}
		z_getTopControl(): Control
		{
			return this.topControl;
		}
		setTopControl(ctl: Control)
		{
			this.topControl = ctl;
			this.topControl.z_setDomConnector(this);
			this.topControl.update();
		}
		z_getPrefix(): string
		{
			if (!this.id)
			{
				var id = ++DomConnector.nextId;
				var idstr = id == 1 ? "" : id.toString();
				this.id = "tsw" + idstr;
			}
			return this.id;
		}
		z_getTopHtmlElement(): HTMLElement
		{
			return this.topHtmlElement;
		}
		z_addToUpdateQueue(ctl: Control)
		{
			if (!this.updateQueue)
			{
				this.updateQueue = [];

				window.setTimeout(() => this.onUpdateQueueTimer(), 0);
			}

			this.updateQueue.push(ctl);
		}
		private onUpdateQueueTimer()
		{
			if (!this.updateQueue) return;

			this.topControl.z_updateControls(this.updateQueue);

			delete this.updateQueue;
		}
		z_ensureDocEventAttached(eventName: string): void
		{
			if (!this.attachedDocumentEvents) this.attachedDocumentEvents = {};

			if (!this.attachedDocumentEvents[eventName])
			{
				jQuery(this.topHtmlElement).on(eventName, e =>
				{
					this.handleEvent(e);
				});

				this.attachedDocumentEvents[eventName] = true;
			}
		}
		private handleEvent(e: JQueryEventObject)
		{
			var r = this.findHandler(jQuery(e.target), e.type);
			if (r)
			{
				if (this.preventLinkClickDefaultBehaviour && e.type == 'click' && r.el.get(0).tagName == 'A')
				{
					e.preventDefault();
				}

				r.h(e);
			}
		}
		private findHandler(el: JQuery, eventName: string)
		{
//			utils.log("event:", eventName);

			while (el && el.length && el[0] != this.topHtmlElement)
			{
				var eventHandlerId = el.attr('id');
				if (eventHandlerId)
				{
//					utils.log("test:", eventHandlerId);

					var handlerMap = this.topControl.z_findEventHandler(eventHandlerId);
					if (handlerMap)
					{
//						utils.log("found:", eventHandlerId, handlerMap);
						var h = handlerMap[eventName];
						if (h) return { el: el, h: h };
					}
				}

				el = el.parent();
			}

			return null;
		}
	}
}
