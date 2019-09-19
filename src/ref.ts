export class Ref<T extends HTMLElement = HTMLElement>
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
	asHtmlElement<T2 extends HTMLElement = T>()
	{
		throw new Error("not implemented");
	}
}
