namespace tsw
{
	export function setContent(htmlElement: HTMLElement, content: any): void
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

namespace tsw.global
{
	export function attachContext(propKey: any): void
	{
		tsw.internal.CtxUtils.attach(propKey);
	}
	export function updateContext(propKey: any): void
	{
		tsw.internal.CtxUtils.update(propKey);
	}
}