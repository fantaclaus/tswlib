/// <reference path="elrefs.ts" />
module tsw
{
	export class Control extends tsw.elRefs.elementRef
	{
		internalCreateElement(): tsw.elements.el
		{
			var elm = this.createElement();

			this.attachToEl(elm);

			return elm;
		}
		createElement(): tsw.elements.el
		{
			return null;
		}
		update(): void
		{
			var $top = this.asJQuery(); // save old element ref
			var elm = this.internalCreateElement(); // ref to element is changed inside this.internalCreateElement()
			tsw.elements.elUtils.replaceWithElements($top, elm);
		}
	}
}
