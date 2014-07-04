module tsw.elRefs
{
	export class elementRef
	{
		private id: string;
		private jqObj: JQuery;

		setRefId(id: string): void
		{
			this.id = id;
			this.jqObj = null;
		}

		setRefObj(jqObj: JQuery): void
		{
			this.id = null;
			this.jqObj = jqObj;
		}

		getId(): string
		{
			return this.id;
		}

		public asJQuery(): JQuery
		{
			if (!this.jqObj)
			{
				if (!this.id) return jQuery(); // empty set of elements; used when Control is not yet rendered

				var element = document.getElementById(this.id);
				this.jqObj = jQuery(element);
			}

			return this.jqObj;
		}

		public setText(val: any): void
		{
			this.asJQuery().text(val);
		}
		public setValue(val: any): void
		{
			this.asJQuery().val(val);
		}
		public getValue(): any
		{
			return this.asJQuery().val();
		}
	}
}
