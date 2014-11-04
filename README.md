Overview
========

This library can be used to create client-side web applications. All rendering of HTML is done entirely in the Typescript code. There are no templates, embedded expressions etc. The whole power of Typescript can be used to generate HTML code.

This is an example of very simple control which displays a list of text items:

```typescript
class MyCtl extends tsw.Control
{
	private items: string[] = ["item 1", "item 2", "item 3"];

	onRender(): any
	{
		var result =
			tsw.html.ul().children([
				this.items.map(item => tsw.html.li().children(item)),
			]);

		return result;
	}
}
```

The generated HTML of `MyCtl` control looks like this:

```html
<ul>
  <li>item 1</li>
  <li>item 2</li>
  <li>item 3</li>
</ul>
```

The function `tsw.html.ul()` returns an object of type `tsw.elements.el` which represents a single `UL` element. You can set up any attribute of this element using methods of the class `tsw.elements.el` and add child elements with the method `children`. In a very simple case the child could be a string, another element or an array of them.

When the tree of nested elements become too large you can extract some nodes into separate functions or methods of the control or even into another control. This way you can achieve modularity and re-usability of the code blocks. Also you can build your own collection of custom elements to simplify the coding and increase the  readability of the code.

In addition to rendering the library allows to handle events fired by HTML elements. In the next example we create a list of items with `A` elements. When clicked, they display a message with the appropriate text:

```typescript
class MyCtl extends tsw.Control
{
	private items: string[] = ["item 1", "item 2", "item 3"];

	onRender(): any
	{
		var result =
			tsw.html.ul().children([
				this.items.map(item => tsw.html.li().children([
					tsw.html.a()
						.href('#')
						.children(item + ' click me!')
						.onclick(e =>
						{
							alert(item + ' is clicked');
						}),
				])),
			]);

		return result;
	}
}
```
Please, pay attention that the handler can access respective `item` by means of closure. Of course, it can access any class member.

If you use Bootstrap framework you can create a helper function which returns an element with the correct `class` attribute:

```typescript
function btnToolbar(): tsw.elements.el
{
	return tsw.html.div().cls('btn-toolbar');
}

function btnGroup(): tsw.elements.el
{
	return tsw.html.div().cls('btn-group');
}

function btnLink(): tsw.elements.a
{
	var a = tsw.html.a().href('#');
	a.cls('btn').cls('btn-default');
	return a;
}
```

or even a complete Bootstrap block of HTML elements. For example, button dropdown:

```typescript
function btnDropDown<T>(
	text: string,
	items: T[],
	getItemText: (T) => string,
	getItemHandler: (T) => void): tsw.elements.el
{
	var el =
		btnGroup().children([

			btnLink().cls('dropdown-toggle').data('toggle', 'dropdown').children([
				text,
				tsw.html.nbsp(),
				tsw.html.span().cls('caret'),
			]),

			tsw.html.ul().cls('dropdown-menu').children(

				(items || []).map(item =>
					tsw.html.li().children([
						tsw.html.a().href('#')
							.children(getItemText(item))
							.onclick((e) =>
							{
								getItemHandler(item);
							}),
					]))
			),
		]);

	return el;
}
```

Usage of this function:

```typescript
	class MyCtl extends tsw.Control
	{
		private items = [
			{ text: "item 1", id: 1 },
			{ text: "item 2", id: 2 },
			{ text: "item 3", id: 3 },
		];

		onRender(): any
		{
			var result =
				btnDropDown(
					'Choose item',
					this.items,
					item => item.text,
					item =>
					{
						alert(item.id);
					});

			return result;
		}
	}
```

The library can be used together with another libraries such as jQuery and use javascript controls implemented in another javascript libraries.

To get more detailed information about the library please read the documentation on [wiki](https://github.com/fantaclaus/tswlib/wiki).

# Downloads

The latest release can be downloaded from [latest release](https://github.com/fantaclaus/tswlib/releases/latest) page.

If you need the compiled files you can download `tswlib.js` and `tswlib.d.ts`  from the [latest release](https://github.com/fantaclaus/tswlib/releases/latest) page.
