import { Ctx } from "./Ctx";
import { CtxScope } from "./CtxScope";
import { elmValue } from "./htmlElements";
import { CtxUpdatable, implements_CtxUpdatable, ICtxRoot } from './interfaces';

export class CtxUpdatableValue extends Ctx implements CtxUpdatable
{
	private [implements_CtxUpdatable] = true;

	// private propName: string;
	// private renderFn: () => elmValue;

	getRenderFn() { return this.renderFn; }

	constructor(rootCtx: ICtxRoot, private propName: string, private renderFn: () => elmValue)
	{
		super(rootCtx);
	}
	update()
	{
		const htmlElement = this.getHtmlElement();

		const val = CtxScope.use(this, () => this.renderFn());
		//console.log("%o update: %o %s = %o", this, htmlElement, this.propName, val);

		const el = <any>htmlElement;
		el[this.propName] = val;
	}
}
