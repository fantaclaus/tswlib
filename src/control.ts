/// <reference path="elrefs.ts" />
module tsw
{
	export class Control extends tsw.elRefs.elementRef
	{
		createElement(): tsw.elements.el
		{
			return html.div();
		}
		update(): void
		{
			var $top = this.asJQuery(); // save old jquery wrapper
			tsw.elements.elUtils.setElements($top, this, true);
		}
	}
}
