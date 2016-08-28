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

namespace tsw.ctxUtils
{
	export function attach(propKey: any): void
	{
		tsw.internal.CtxUtils.attach(propKey);
	}
	export function update(propKey: any): void
	{
		tsw.internal.CtxUtils.update(propKey);
	}
}
