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
		static el(tagName: string = ''): elements.ElementGeneric
		{
			return new elements.ElementGeneric(tagName);
		}
		static div(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('div');
		}
		static p(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('p');
		}
		static span(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('span');
		}
		static b(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('b');
		}
		static i(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('i');
		}
		static h1(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('h1');
		}
		static h2(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('h2');
		}
		static h3(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('h3');
		}
		static h4(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('h4');
		}
		static h5(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('h5');
		}
		static h6(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('h6');
		}
		static small(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('small');
		}
		static a(): elements.ElementA
		{
			return new elements.ElementA();
		}
		static nav(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('nav');
		}
		static br(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('br');
		}
		static hr(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('hr');
		}
		static button(): elements.ElementButton
		{
			return new elements.ElementButton();
		}
		static ul(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('ul');
		}
		static li(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('li');
		}
		static img(): elements.ElementImg
		{
			return new elements.ElementImg();
		}
		static form(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('form');
		}
		static table(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('table');
		}
		static thead(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('thead');
		}
		static tbody(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('tbody');
		}
		static tr(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('tr');
		}
		static th(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('th');
		}
		static td(): elements.ElementGeneric
		{
			return new elements.ElementGeneric('td');
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
