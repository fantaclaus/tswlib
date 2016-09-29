export class utils
{
	static htmlEncode(s: string): string
	{
		return s
			.replace(/&/g, '&amp;')
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;");
	}
	static appendDelimited(s1: string, delim: string, s2: string): string
	{
		if (s1 && s2) return s1 + delim + s2;

		return s1 || s2;
	}
	static join<T>(items: T[], delim: string, selector: (item: T) => string | null)
	{
		// if all items are null, return null

		var result: string | null = null;

		if (items)
		{
			for (var i = 0; i < items.length; i++)
			{
				var item = items[i];
				if (item != null)
				{
					var s = selector(item);

					if (s != null && result == null) result = ''; // if at least one item is converted to non-null, result is not null

					if (s != null && s !== '') // don't add nulls and empty strings. but zero-number value must be added.
					{
						if (delim && result) result += delim;

						result += s;
					}
				}
			}
		}

		return result;
	}
}
export class objUtils
{
	static forEachKey(obj: Object, action: (key: string) => void): void
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
}

