export class Ref<T extends Element = Element>
{
	private val: T | undefined;

	constructor(private dbg_name?: string)
	{
	}
	set(v: T)
	{
		this.val = v;
	}
	isValid()
	{
		return this.val != null;
	}
	asHtmlElement<T2 extends T = T>()
	{
		if (this.val == null) throw new Error("ref is invalid");
		return this.val as T2;
	}
}
