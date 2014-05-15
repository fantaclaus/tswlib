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
}
