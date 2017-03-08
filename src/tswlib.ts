namespace tsw
{
	export function setContent(htmlElement: HTMLElement | null, content: elements.childValType)
	{
		if (htmlElement != null)
		{
			const ctxRoot = new internal.CtxRoot();
			ctxRoot.render(content, htmlElement);
		}
	}
}
