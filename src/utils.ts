module tsw.internal
{
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

			if (s1) return s1;

			return s2;
		}
		static join<T>(items: T[], delim: string, selector: (item: T) => string): string
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
		static isUndefined(v: any): boolean
		{
			return typeof v == 'undefined';
		}
		static toStringSafe(s: string): string
		{
			return s == null ? '' : s;
		}
	}
	export class arrayUtils
	{
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
		static contains(array: any[], item: any): boolean
		{
			return array.indexOf(item) >= 0;
		}
	}
	export class objUtils
	{
		static forEachKey(obj: any, action: (key: string) => void): void
		{
			if (obj)
			{
				for (var key in obj)
				{
					if (obj.hasOwnProperty(key))
					{
						action(key);
					}
				}
			}
		}
	}
}
