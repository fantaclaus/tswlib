export class tswRef
{
	private val?: Element | null;

	constructor(private dbg_name?: string)
	{
	}
	set(v: Element | null)
	{
		this.val = v;
	}
	get()
	{
		return this.val;
	}
	isValid()
	{
		return this.val != null;
	}
	asElement<T extends Element = Element>()
	{
		if (this.val == null) throw new Error("ref is null");

		if (!(this.val instanceof Element)) throw new Error("ref points not to an Element");

		return this.val as T;
	}
	asHtmlElement<T extends HTMLElement = HTMLElement>(baseClass: typeof HTMLElement = HTMLElement)
	{
		if (this.val == null) throw new Error("ref is null");

		if (!(this.val instanceof baseClass)) throw new Error(`ref points to an element that is not ${baseClass.name}`);

		return this.val as T;
	}
}
