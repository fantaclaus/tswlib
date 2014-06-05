/// <reference path="el.ts" />

module tsw.elRefs
{
	export class elementRef
	{
		private id: string;
		private jqObj: JQuery;
		private createChildrenElements: () => any;

		setRefId(id: string, createChildren?: () => any): void
		{
			this.id = id;
			this.jqObj = null;
			this.createChildrenElements = createChildren;
		}

		setRefObj(jqObj: JQuery, createChildren?: () => any): void
		{
			this.id = null;
			this.jqObj = jqObj;
			this.createChildrenElements = createChildren;
		}

		attachToEl(elm: tsw.elements.el, createChildren?: () => any): void
		{
			var id = elm ? elm.getOrCreateId() : null;

			this.setRefId(id, createChildren);
		}

		getId(): string
		{
			return this.id;
		}
		isAttached(): boolean
		{
			return this.id != null;
		}

		update(): void
		{
			if (this.createChildrenElements)
			{
				var els = this.createChildrenElements();
				this.setElements(els);
			}
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

		public setElements(els: any): void
		{
			var $this = this.asJQuery();

			tsw.elements.elUtils.setElements($this, els, false);
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
