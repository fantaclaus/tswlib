namespace tsw
{
	export class Ref implements tsw.global.PropDef<string>
	{
		private refId: string;

		get(): string
		{
			tsw.internal.CtxUtils.attach(this);

			return this.refId;
		}
		set(v: string): void
		{
			if (this.refId !== v)
			{
				//console.group('ref %s %o: set value %o', this.name, this, v);

				this.refId = v;

				tsw.internal.CtxUtils.update(this);

				//console.groupEnd();
			}
		}

		asJQuery(): JQuery
		{
			return jQuery('#' + this.refId);
		}
	}
}