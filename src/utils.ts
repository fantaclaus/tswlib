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
export function arrayIncludes<T>(items: T[], item: T)
{
	if (items == null) return false;

	for (let i of items)
	{
		if (i === item) return true;
	}

	return false;
}