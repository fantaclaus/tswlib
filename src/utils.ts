module tsw
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
	export function splitStr(s: string, delim: string): string[]
	{
		return s ? s.split(delim) : [];
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
			for (var i = 0, len = array.length; i < len; ++i)
			{
				var item = array[i];
				if (predicate(item, i)) return item;
			}

			return null;
		}
	}
}
