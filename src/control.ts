module tsw
{
	export class Control
	{
//		private static nextId: number = 0;

		private renderFn: () => any;
		private beforeRemoveFn: () => void;
		private afterInsertFn: () => void;
		private _children: any[]; // temporary holder
		private id: string;
//		private uid: number;
		private idPath: string;
		private childControls: Control[];
		private domConnector: DomConnector;
		private parentElmId: string;
		private eventHandlers: { [elmId: string]: tsw.elements.JQueryEventHandlerMap; };

//		constructor()
//		{
//			this.uid = ++Control.nextId;
//		}
		z_setDomConnector(domConnector: DomConnector)
		{
			this.domConnector = domConnector;
		}
		getDomConnector(): DomConnector
		{
			return this.domConnector;
		}
		renderTo(htmlElement: HTMLElement)
		{
			if (this.domConnector)
			{
				if (this.domConnector.z_getTopControl() != this) throw new Error("renderTo() should be called on top control only");
			}
			else
			{
				this.domConnector = new DomConnector();
			}

			this.domConnector.attachTo(htmlElement);
			this.domConnector.setTopControl(this);
		}
		children(renderFn: () => any): Control
		{
			this.renderFn = renderFn;

			return this;
		}
		beforeRemove(fn: () => any): Control
		{
			this.beforeRemoveFn = fn;

			return this;
		}
		afterInsert(fn: () => any): Control
		{
			this.afterInsertFn = fn;

			return this;
		}
		onRender(): any[]
		{
			return this.renderFn && this.renderFn();
		}
		onBeforeRemoveFromDOM()
		{
			if (this.beforeRemoveFn) this.beforeRemoveFn();
		}
		onAfterInsertIntoDOM()
		{
			if (this.afterInsertFn) this.afterInsertFn();
		}
		update()
		{
			var parentEl = this.getTargetHtmlElement();
			if (!parentEl) return;

			if (this.domConnector) this.domConnector.z_addToUpdateQueue(this);
		}

		z_getIdPath(): string
		{
			return this.idPath || '';
		}
		z_getFullIdPath(): string
		{
			return appendDelimited(this.domConnector.z_getPrefix(), ":", this.idPath);
		}
		z_updateControls(ctls: Control[])
		{
			if (this.needUpdate(ctls))
			{
				this._update();
				return;
			}

			if (this.childControls)
			{
				this.childControls.forEach(ctl => ctl.z_updateControls(ctls));
			}
		}
		private needUpdate(ctls: Control[]): boolean
		{
			if (ctls.indexOf(this) >= 0) return true;

//			if (this.childControls)
//			{
//				var threshold = Math.ceil(this.childControls.length / 2);
//
//				var childrenToUpdate = this.childControls.filter(ctl => ctl.needUpdate(ctls));
//				if (childrenToUpdate.length > threshold) return true;
//			}

			return false;
		}
		private _update()
		{
//			utils.log('update:', this.z_getFullIdPath(), '/', this.parentElmId);

			var parentEl = this.getTargetHtmlElement();
			if (!parentEl) return;

			this.visitChildControls({
				postProcess: ctl => ctl.onBeforeRemoveFromDOM(),
			});

			this.visitChildControls({
				postProcess: ctl =>
				{
					//utils.log('delete childControls:', ctl.z_getFullIdPath());
					delete ctl.childControls;
				},
			});

			this._createChildren();

			this.initControlsAndElements();

			var html = CtlUtilsRender.renderControl(this);

			var markers = this.createMarkers();
			CtlUtilsDOM.updateDOM(html, parentEl, markers);

			this.visitChildControls({
				postProcess: ctl =>
				{
					//utils.log('delete _children:', ctl.z_getFullIdPath());
					delete ctl._children;
				},
			});

			this.visitChildControls({
				postProcess: ctl => ctl.onAfterInsertIntoDOM(),
			});
		}
		private getTargetHtmlElement(): HTMLElement
		{
			if (this.parentElmId) return document.getElementById(this.parentElmId);
			return this.domConnector && this.domConnector.z_getTopHtmlElement();
		}
		private visitChildControls(prms: { preProcess?: (ctl: Control) => void; postProcess?: (ctl: Control) => void; })
		{
			if (prms.preProcess) prms.preProcess(this);

			if (this.childControls)
			{
				this.childControls.forEach(ctl => ctl.visitChildControls(prms));
			}

			if (prms.postProcess) prms.postProcess(this);
		}
		private _createChildren()
		{
			var v = new ControlVisitor();
			v.preProcessControl = (ctl: Control) => ctl._createChildren2();
			v.visitCtl(this);
		}
		private _createChildren2()
		{
			var childrenRaw = this.onRender();
			var childrenNew = [];
			arrayUtils.addExpanded(childrenNew, childrenRaw);
			this._children = childrenNew;
		}
		private initControlsAndElements()
		{
			var v = new ControlVisitor();
			v.preProcessControl = ctl => this.initControl(ctl);
			v.processElm = elm => this.initElement(elm);
			v.visitCtl(this);
		}
		z_getChildren(): any[]
		{
			return this._children;
		}
		private addChildControl(ctl: Control)
		{
			if (!this.childControls) this.childControls = [];

			this.childControls.push(ctl);
		}
		private initControl(ctl: Control)
		{
			ctl.z_setDomConnector(this.domConnector);

			var parentElm = Contexts.getCtxElement();
			if (parentElm)
			{
				ctl.parentElmId = parentElm.getId();
				parentElm.z_renderId = true;
			}

			var parentCtl = Contexts.getCtxControl();

			if (parentCtl)
			{
				var parentChildCount = parentCtl.childControls ? parentCtl.childControls.length : 0;
				var ctlId = (parentChildCount + 1).toString();
				ctl.id = ctlId;
				ctl.idPath = appendDelimited(parentCtl.idPath, ".", ctlId);

				parentCtl.addChildControl(ctl);
			}
		}
		private initElement(elm: tsw.elements.el)
		{
			var ctxCtl = Contexts.ctxControl.getCurrent();
			var parentCtl = Contexts.getCtxControl();

			ctxCtl.elmCount++;

			var elmId = ctxCtl.elmCount.toString();

			// format must be PREFIX:PATH:ID for parsing in z_findEventHandler()
			var fullId = this.domConnector.z_getPrefix() + ":" + parentCtl.z_getIdPath() + ":" + elmId;
			elm.id(fullId);

			var handlerMap = elm.z_getEventHandlers();
			if (handlerMap)
			{
				for (var eventName in handlerMap)
				{
					if (handlerMap.hasOwnProperty(eventName))
					{
						this.domConnector.z_ensureDocEventAttached(eventName);
					}
				}

				parentCtl.addEventHandlers(elmId, handlerMap);
				elm.z_renderId = true;
			}
		}
		private addEventHandlers(elmId: string, handlerMap: tsw.elements.JQueryEventHandlerMap)
		{
			if (!this.eventHandlers) this.eventHandlers = {};
			this.eventHandlers[elmId] = handlerMap;
		}
		z_findEventHandler(eventHandlerId: string)
		{
			var parts = splitStr(eventHandlerId, ":");
			if (parts.length < 3) return null;

			var prefix = parts[0];
			if (this.domConnector.z_getPrefix() != prefix) return null;

			var path = parts[1];
			var ctl = this.findControlByPath(path);
			if (!ctl) return null;

			var elmId = parts[2];
			var h = ctl.eventHandlers && ctl.eventHandlers[elmId];
			return h;
		}
		private findControlByPath(path: string): Control
		{
			var ctlIds = splitStr(path, ".");

			var ctl = this;
			for (var i = 0; i < ctlIds.length; i++)
			{
				var ctlId = ctlIds[i];
				var subCtl = arrayUtils.find(ctl.childControls, c => c.id == ctlId);
				if (!subCtl) return null;

				ctl = subCtl;
			}

			return ctl;
		}
		z_render(innerHtml: string, addMarkers: boolean): string
		{
			if (!addMarkers) return innerHtml;

			var markers = this.createMarkers();
			return markers.getHtml(innerHtml);
		}
		private createMarkers()
		{
			var id = this.z_getFullIdPath();
			return new ControlHtmlMarkers(id);
		}
	}

	class ControlHtmlMarkers
	{
		begin: string;
		end: string;

		constructor(id: string)
		{
			this.begin = "BEGIN:" + id;
			this.end = "END:" + id;
		}
		getHtml(innerHtml: string)
		{
			return "<!--" + this.begin + "-->" +
				innerHtml +
				"<!--" + this.end + "-->";
		}
	}
	class ControlVisitor
	{
		preProcessControl: (ctl: Control) => void;
		postProcessControl: (ctl: Control) => void;
		processElm: (elm: tsw.elements.el) => void;

		visitCtl(ctl: Control)
		{
			if (this.preProcessControl) this.preProcessControl(ctl);

			Contexts.ctxControl.use(new ControlContext(ctl), () =>
			{
				var children = ctl.z_getChildren();
				if (children)
				{
					children.forEach(c =>
					{
						this.visit(c);
					});
				}
			});

			if (this.postProcessControl) this.postProcessControl(ctl);
		}
		visitElm(elm: tsw.elements.el)
		{
			if (this.processElm) this.processElm(elm);

			Contexts.ctxElement.use(new ElementContext(elm), () =>
			{
				var els = elm.z_getElements();
				if (els)
				{
					els.forEach(elm =>
					{
						this.visit(elm);
					});
				}
			});
		}
		visit(c: any)
		{
			if (c instanceof tsw.elements.el)
			{
				var elm = <tsw.elements.el> c;
				this.visitElm(elm);
			}
			else if (c instanceof tsw.Control)
			{
				var ctl = <tsw.Control> c;
				this.visitCtl(ctl);
			}
		}
	}

	class CtlUtilsRender
	{
		static renderControl(ctl: Control): string
		{
			var innerHtml = '';

			Contexts.ctxControl.use(new ControlContext(ctl), () =>
			{
				var children = ctl.z_getChildren();
				if (children)
				{
					children.forEach(c =>
					{
						innerHtml += this.renderHtml(c);
					});
				}
			});

			var ctxCtl = Contexts.ctxControl.getCurrent();
			var addMarkers = ctxCtl != null;

			var html = ctl.z_render(innerHtml, addMarkers);
			return html;
		}
		private static renderElement(elm: tsw.elements.el): string
		{
			var innerHtml = '';

			var els = elm.z_getElements();
			if (els)
			{
				els.forEach(elm =>
				{
					innerHtml += this.renderHtml(elm);
				});
			}

			var html = elm.z_render(innerHtml);
			return html;
		}
		static renderHtml(c: any): string
		{
			if (tsw.isNullOrUndefined(c)) return '';

			var elmHtml: string;

			if (c instanceof tsw.elements.el)
			{
				var elm = <tsw.elements.el> c;
				elmHtml = this.renderElement(elm);
			}
			else if (c instanceof tsw.Control)
			{
				var ctl = (<tsw.Control> c);
				elmHtml = this.renderControl(ctl);
			}
			else  if (c instanceof tsw.elements.rawHtml)
			{
				var rawHtml = (<tsw.elements.rawHtml> c);
				elmHtml = rawHtml.value;
			}
			else
			{
				elmHtml = htmlEncode(c.toString());
			}

			return elmHtml;
		}
	}
	class ElementContext
	{
		constructor(public element: tsw.elements.el)
		{
		}
	}

	class ControlContext
	{
		elmCount = 0;

		constructor(public control: Control)
		{
		}
	}

	class ContextScope<T>
	{
		private contexts: T[] = [];

		getCurrent(): T
		{
			var ctxStack = this.contexts;
			return ctxStack.length == 0 ? null : ctxStack[ctxStack.length - 1];
		}

		use(ctx: T, action: () => void)
		{
			this.contexts.push(ctx);

			try
			{
				action();
			}
			finally
			{
				this.contexts.pop();
			}
		}
	}

	class Contexts
	{
		static ctxElement = new ContextScope<ElementContext>();
		static ctxControl = new ContextScope<ControlContext>();

		static getCtxControl(): Control
		{
			var ctxCtl = Contexts.ctxControl.getCurrent();
			return ctxCtl && ctxCtl.control;
		}
		static getCtxElement(): tsw.elements.el
		{
			var ctxElm = Contexts.ctxElement.getCurrent();
			return ctxElm && ctxElm.element;
		}
	}

	class CtlUtilsDOM
	{
		private static tmpDiv: HTMLElement;

		static updateDOM(html: string, targetElement: HTMLElement, markers: ControlHtmlMarkers)
		{
			// TODO: remove native event handlers

			// TBODY must be defined explicitly in onRender() of a control
			// otherwise commented section will not be found, since targetElement would be TABLE

			var COMMENT_NODE = 8; // on IE8 Node is undefined

			var nodeBeginMarker: Node = null;
			var nodeEndMarker: Node = null;
			var isFirst = false;
			var isLast = false;

			if (targetElement.hasChildNodes())
			{
				var firstNode = targetElement.firstChild;
				if (firstNode.nodeType == COMMENT_NODE && firstNode.nodeValue == markers.begin)
				{
					nodeBeginMarker = firstNode;
					isFirst = true;
				}

				var lastNode = targetElement.lastChild;
				if (lastNode.nodeType == COMMENT_NODE && lastNode.nodeValue == markers.end)
				{
					nodeEndMarker = lastNode;
					isLast = true;
				}

				if (!(isFirst && isLast))
				{
					var node = firstNode;

					while (node)
					{
						if (node.nodeType == COMMENT_NODE)
						{
							if (node.nodeValue == markers.begin)
							{
								nodeBeginMarker = node;
							}
							else if (node.nodeValue == markers.end)
							{
								nodeEndMarker = node;
							}
						}

						node = node.nextSibling;
					}

					if (!nodeBeginMarker && nodeEndMarker)
					{
						// IE 8 removes all comments in the beginning of innerHTML
						nodeBeginMarker = firstNode;
						isFirst = true;
					}
				}
			}

			if ((isFirst && isLast) || (!nodeBeginMarker && !nodeEndMarker))
			{
//				utils.log('html: replace complete');
				targetElement.innerHTML = markers.getHtml(html);
			}
			else
			{
//				utils.log('html: replace between markers');

				// replace between markers

				if (nodeBeginMarker && nodeEndMarker)
				{
					var node = nodeBeginMarker.nextSibling;

					while (node !== nodeEndMarker)
					{
						var nodeNext = node.nextSibling;

						targetElement.removeChild(node);

						node = nodeNext;
					}

					var tmpDiv = this.tmpDiv;
					if (!tmpDiv)
					{
						tmpDiv = document.createElement('div');
						this.tmpDiv = tmpDiv; // cache it
					}

					// insert html into TABLE doesn't work on IE<10
					targetElement.insertBefore(tmpDiv, nodeEndMarker);
					tmpDiv.insertAdjacentHTML('beforeBegin', html);
					targetElement.removeChild(tmpDiv);

					// doesn't work on IE
//					var tmp = document.createElement('template');
//					tmp.innerHTML = html;
//					targetElement.insertBefore(tmp.content, nodeEndMarker);

				}
			}
		}
	}
}
