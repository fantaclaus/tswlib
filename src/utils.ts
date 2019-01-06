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

	for (let key in obj)
	{
		if (obj.hasOwnProperty(key))
		{
			action(key);
		}
	}
}
