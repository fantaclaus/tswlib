module tsw
{
	export class html
	{
		static nbsp(): elements.RawHtml
		{
			return new elements.RawHtml("&nbsp;");
		}
		static raw(s: string): elements.RawHtml
		{
			return new elements.RawHtml(s);
		}
		static el(tagName: string = ''): elements.Element
		{
			return new elements.Element(tagName);
		}
		static div(): elements.Element
		{
			return new elements.Element('div');
		}
		static p(): elements.Element
		{
			return new elements.Element('p');
		}
		static span(): elements.Element
		{
			return new elements.Element('span');
		}
		static b(): elements.Element
		{
			return new elements.Element('b');
		}
		static i(): elements.Element
		{
			return new elements.Element('i');
		}
		static h1(): elements.Element
		{
			return new elements.Element('h1');
		}
		static h2(): elements.Element
		{
			return new elements.Element('h2');
		}
		static h3(): elements.Element
		{
			return new elements.Element('h3');
		}
		static h4(): elements.Element
		{
			return new elements.Element('h4');
		}
		static small(): elements.Element
		{
			return new elements.Element('small');
		}
		static a(): elements.ElementA
		{
			return new elements.ElementA();
		}
		static nav(): elements.Element
		{
			return new elements.Element('nav');
		}
		static br(): elements.Element
		{
			return new elements.Element('br');
		}
		static hr(): elements.Element
		{
			return new elements.Element('hr');
		}
		static button(): elements.ElementButton
		{
			return new elements.ElementButton();
		}
		static ul(): elements.Element
		{
			return new elements.Element('ul');
		}
		static li(): elements.Element
		{
			return new elements.Element('li');
		}
		static img(): elements.ElementImg
		{
			return new elements.ElementImg();
		}
		static form(): elements.Element
		{
			return new elements.Element('form');
		}
		static table(): elements.Element
		{
			return new elements.Element('table');
		}
		static thead(): elements.Element
		{
			return new elements.Element('thead');
		}
		static tbody(): elements.Element
		{
			return new elements.Element('tbody');
		}
		static tr(): elements.Element
		{
			return new elements.Element('tr');
		}
		static th(): elements.Element
		{
			return new elements.Element('th');
		}
		static td(): elements.Element
		{
			return new elements.Element('td');
		}
		static label(): elements.ElementLabel
		{
			return new elements.ElementLabel();
		}
		static inputText(): elements.ElementInputText
		{
			return new elements.ElementInputText();
		}
		static inputCheckBox(): elements.ElementInputCheckbox
		{
			return new elements.ElementInputCheckbox();
		}
		static inputRadio(): elements.ElementInputRadio
		{
			return new elements.ElementInputRadio();
		}
		static select(): elements.ElementSelect
		{
			return new elements.ElementSelect();
		}
		static option(): elements.ElementOption
		{
			return new elements.ElementOption();
		}
		static textArea(): elements.ElementTextArea
		{
			return new elements.ElementTextArea();
		}
	}
}
