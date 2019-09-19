import { CtxUpdatable } from './CtxUpdatable';
import { CtxScope } from "./CtxScope";
import { ICtxRoot } from './interfaces';

export class CtxUpdatableAttr extends CtxUpdatable
{
	//attrName: string;
	//renderFn: () => string | null;

	constructor(rootCtx: ICtxRoot, private attrName: string, private renderFn: () => string | null)
	{
		super(rootCtx);
	}
	update()
	{
		const htmlElement = this.getHtmlElement();

		//console.log("%o update: %o %s", this, htmlElement, this.attrName);

		const v = CtxScope.use(this, () => this.renderFn());

		//console.log("%o update: %o %s = %o", this, htmlElement, this.attrName, v);

		// attributes 'checked' and 'value' can be changed only by property

		if (this.attrName == 'checked')
		{
			(<HTMLInputElement>htmlElement).checked = v != null;
		}
		else if (this.attrName == 'value')
		{
			(<HTMLInputElement>htmlElement).value = v || '';
		}
		else
		{
			if (v == null)
			{
				htmlElement.removeAttribute(this.attrName);
			}
			else
			{
				htmlElement.setAttribute(this.attrName, v);
			}
		}
	}
}
