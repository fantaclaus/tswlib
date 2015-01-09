module tsw.utils
{
	export function format(fmt: string, data: any)
	{
		return fmt.replace(/\$\{(\w+)\}/g, function ()
		{
			var propName = arguments[1];
			var v = data[propName];
			return v == null ? '' : v.toString();
		});
	}

	export function htmlEncode(s: string): string
	{
		return s
			.replace(/&/g, '&amp;')
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}
	export function appendDelimited(s1: string, delim: string, s2: string): string
	{
		if (s1 && s2) return s1 + delim + s2;

		if (s1) return s1;

		return s2;
	}
	export function join<T>(items: T[], delim:string, selector: (item: T) => string): string
	{
		// if all items are null, return null

		var result: string = null;

		if (items)
		{
			for (var i = 0; i < items.length; i++)
			{
				var item = items[i];
				if (item != null)
				{
					var s = selector(item);

					if (s != null && result == null) result = ''; // if at least one item is converted to non-null, result is not null

					if (s != null && s !== '') // don't add nulls and ampty strings. but zero-number value must be added.
					{
						if (delim && result) result += delim;

						result += s;
					}
				}
			}
		}

		return result;
	}
	export function splitStr(s: string, delim: string): string[]
	{
		return s ? s.split(delim) : [];
	}

	export function isUndefined(v: any): boolean
	{
		return typeof v == 'undefined';
	}
	export function isNullOrUndefined(v: any): boolean
	{
		return v == null;
	}
	export class arrayUtils
	{
		static addExpanded(target: any[], v: any): void
		{
			if (v != null)
			{
				if (v instanceof Array)
				{
					for (var i = 0; i < v.length; i++)
					{
						var v1 = v[i];
						this.addExpanded(target, v1);
					}
				}
				else if (v instanceof Function)
				{
					var v2 = v();
					this.addExpanded(target, v2);
				}
				else
				{
					target.push(v);
				}
			}
		}
		static find<T>(array: T[], predicate: (value: T, index: number) => boolean): T
		{
			if (array)
			{
				for (var i = 0, len = array.length; i < len; ++i)
				{
					var item = array[i];
					if (predicate(item, i)) return item;
				}
			}

			return null;
		}
	}
}
