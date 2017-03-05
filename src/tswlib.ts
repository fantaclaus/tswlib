namespace tsw
{
	export function setContent(htmlElement: HTMLElement, content: any)
	{
		var ctxRoot = new tsw.internal.CtxRoot();
		ctxRoot.render(content, htmlElement);
	}

	export interface Renderer
	{
		render: () => any;
		afterAttach?: () => void;
		beforeDetach?: () => void;
	}
}
