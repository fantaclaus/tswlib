export function appendDelimited(s1: string, delim: string, s2: string): string
{
	if (s1 && s2) return s1 + delim + s2;

	return s1 || s2;
}
