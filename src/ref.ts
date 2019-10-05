export class Ref<T extends Element = Element>
{
	get(): string | null
	{
		throw new Error("not implemented");
	}
	set(v: string | null): void
	{
		throw new Error("not implemented");
	}
	isValid()
	{
		throw new Error("not implemented");
	}
	asHtmlElement<T2 extends Element = T>()
	{
		throw new Error("not implemented");
	}
}
