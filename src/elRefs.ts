/// <reference path="d.ts/jquery.d.ts" />
/// <reference path="el.ts" />

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

		attachToEl(elm: tsw.elements.el): void
		{
			var id = elm ? elm.getOrCreateId() : null;

			this.setRefId(id);
		}

		getId(): string
		{
			return this.id;
		}
		isAttached(): boolean
		{
			return this.id != null;
		}

		public asJQuery(): JQuery
		{
			if (!this.jqObj)
			{
				if (!this.id) return $(); // empty set of elements; used when Control is not yet rendered

				this.jqObj = $('#' + this.id);
			}

			return this.jqObj;
		}

		public setElements(els?: any): void
		{
			var $this = this.asJQuery();

			tsw.elements.elUtils.setElements($this, els);
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

	export class TextFieldRef extends elementRef
	{
		private val: string;

		attachToEl(elm: tsw.elements.el): void
		{
			super.attachToEl(elm);

			elm
				.attr('value', this.val)
				.on('input', e =>
				{
					this.val = $(e.target).val();
				});
		}
		setValue(v: string): void
		{
			this.val = v || '';

			this.asJQuery().val(this.val);
		}
		getValue(): string
		{
			return this.val;
		}
	}

	export class CheckBoxFieldRef extends elementRef
	{
		private val: boolean;
		public onChanged: () => void;

		attachToEl(elm: tsw.elements.el): void
		{
			super.attachToEl(elm);

			elm
				.attr('checked', this.val ? '' : null)
				.on('change', e =>
				{
					this.val = $(e.target).prop("checked")
					if (this.onChanged) this.onChanged();
				});
		}
		setValue(v: boolean): void
		{
			this.val = v;

			this.asJQuery().prop("checked", this.val);
		}
		getValue(): boolean
		{
			return this.val;
		}
	}
}
