/// <reference path="elrefs.ts" />
module tsw
{
	export class Control extends tsw.elRefs.elementRef
	{
		createElement(): tsw.elements.el
		{
			return null;
		}
		update(): void
		{
			var $top = this.asJQuery(); // save old jquery wrapper
			tsw.elements.elUtils.replaceWithElements($top, this);
		}
	}
}
