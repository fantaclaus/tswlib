import { PropDef } from './PropDefs';
import { PropValBase } from './PropValBase';

export class Ref<T extends HTMLElement = HTMLElement> extends PropValBase implements PropDef<string | null>
{
	private refId: string | null = null;

	get(): string | null
	{
		this.ctxAttach();

		return this.refId;
	}
	set(v: string | null): void
	{
		if (this.refId !== v)
		{
			//console.group('ref %s %o: set value %o', this.name, this, v);

			this.refId = v;

			this.ctxUpdate();

			//console.groupEnd();
		}
	}
	isValid()
	{
		if (!this.refId) return false;
		const el = document.getElementById(this.refId);
		return !!el;
	}
	asHtmlElement<T2 extends HTMLElement = T>()
	{
		if (!this.refId) throw new Error("refId is not initialized");

		const el = document.getElementById(this.refId);
		if (!el) throw new Error("element is not found by refId");

		return el as T2;
	}
}
