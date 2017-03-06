namespace tsw
{
	export class Ref implements global.PropDef<string | null>
	{
		private refId: string | null;

		get(): string | null
		{
			internal.attach(this);

			return this.refId;
		}
		set(v: string | null): void
		{
			if (this.refId !== v)
			{
				//console.group('ref %s %o: set value %o', this.name, this, v);

				this.refId = v;

				internal.update(this);

				//console.groupEnd();
			}
		}

		asJQuery(): JQuery
		{
			return jQuery('#' + this.refId);
		}
	}
}