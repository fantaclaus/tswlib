import * as CtxUtils from './CtxUtils';
import { PropDef } from './PropDefs';

export class Ref implements PropDef<string | null>
{
	private refId: string | null = null;

	get(): string | null
	{
		CtxUtils.attach(this);

		return this.refId;
	}
	set(v: string | null): void
	{
		if (this.refId !== v)
		{
			//console.group('ref %s %o: set value %o', this.name, this, v);

			this.refId = v;

			CtxUtils.update(this);

			//console.groupEnd();
		}
	}
	isValid()
	{
		if (!this.refId) return false;
		const el = document.getElementById(this.refId);
		return !!el;
	}
	asHtmlElement<T extends HTMLElement = HTMLElement>()
	{
		if (!this.refId) throw new Error("refId is not initialized");

		const el = document.getElementById(this.refId);
		if (!el) throw new Error("element is not found by refId");

		return el as T;
	}
}
