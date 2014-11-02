Overview
========

This library can be used to create client-side web applications. All rendering of HTML is done entirely in Typescript. There are no templates, embedded expressions etc. The whole power of Typescript can be used to generate HTML code.

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

If you use Bootstrap framework you can create a function which returns an element with the correct `class` attribute or even a complete Bootstrap block of HTML elements. For example:

```typescript
function btnToolbar(): tsw.elements.el
{
	return tsw.html.div().cls('btn-toolbar');
}

```

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
Pay attention that the handler can access respective `item` by means of closure.

TswLib library can be used together with another libraries such as jQuery and use javascript controls implemented in another javascript libraries.
