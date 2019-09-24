import { childValType, childValTypePropDefReadable, Renderer } from "./types";
import { RawHtml } from "./htmlElements";
import { ElementGeneric } from "./elm";
import { Scope } from "./CtxScope";
import { Ctx } from "./Ctx";

export class CtxRoot extends Ctx
{
	private htmlElement: HTMLElement;

	onBeforeAttach: (() => void) | undefined;

	constructor(htmlElement: HTMLElement)
	{
		super();

		this.htmlElement = htmlElement;
	}
	setContent(content: childValType)
	{
		const f = document.createDocumentFragment();

		Scope.use(this, () =>
		{
			this.addNodesTo(f, content);
		});

		if (this.onBeforeAttach) this.onBeforeAttach();
		
		this.htmlElement.innerHTML = '';
		this.htmlElement.appendChild(f);
	}
	update()
	{
		throw new Error("not implemented");
	}

	addNodesTo(f: DocumentFragment, item: childValType)
	{
		if (item == null || item === true || item === false || item === '')
		{

		}
		else if (item instanceof Array)
		{
			item.forEach(i => this.addNodesTo(f, i));
		}
		else if (item instanceof Function)
		{
			const r = item();
			this.addNodesTo(f, r);
		}
		else if (isRenderer(item))
		{
			const r = item.render();
			this.addNodesTo(f, r);
		}
		else if (item instanceof RawHtml)
		{
			const el = document.createElement('div');
			el.innerHTML = item.value;

			while (el.firstChild) f.appendChild(el.firstChild);
		}
		else if (item instanceof ElementGeneric)
		{
			item.z_addNodesTo(f);
		}
		else
		{
			const s = item.toString();

			const n = document.createTextNode(s);
			f.appendChild(n);
		}
	}
}

function isPropDef(v: childValType): v is childValTypePropDefReadable
{
	return (<childValTypePropDefReadable>v).get instanceof Function;
}
function isRenderer(item: childValType): item is Renderer
{
	return (<Renderer>item).render instanceof Function;
}
