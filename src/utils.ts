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

	return s1 || s2;
}
export function join(items: any[], delim: string, selector: (item: any) => string | null)
{
	// if all items are null, return null

	let result: string | null = null;

	if (items)
	{
		for (let i = 0; i < items.length; i++)
		{
			const item = items[i];
			if (item != null)
			{
				const s = selector(item);

				if (s != null && result == null) result = ''; // if at least one item is converted to non-null, result is not null

				if (s != null && s !== '') // don't add nulls and empty strings. but zero-number value must be added.
				{
					if (delim && result) result = result + delim;

					result = result + s;
				}
			}
		}
	}

	return result;
}
export function forEachKey(obj: Object, action: (key: string) => void): void
{
	if (!obj) throw new Error("obj == null");

	for (var key in obj)
	{
		if (obj.hasOwnProperty(key))
		{
			action(key);
		}
	}
}
