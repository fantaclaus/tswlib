import { tswCtx } from "./Ctx";
import { PropDefReadable, attrValTypeInternal, AttrNameValue } from "./types";
import { g_CurrentContext } from "./Scope";

export class tswCtxAttr extends tswCtx
{
	constructor(private el: Element, private attrName: string, private attrNameVals: AttrNameValue | AttrNameValue[])
	{
		super();
	}
	setup(ctxParent: tswCtx)
	{
		this.setAttrVal();

		this.addCtxToParent(ctxParent);
	}
	update()
	{
		if (this.ctxParent === null) return;

		this.removeChildren();

		this.setAttrVal();
	}
	private setAttrVal()
	{
		g_CurrentContext.use(this, () => this._setAttrVal());
	}
	private _setAttrVal()
	{
		let result: string | null = null;

		const isMultiValueType = this.attrName == "class" || this.attrName == "style";
		const separator = this.attrName == "class" ? ' ' : this.attrName == "style" ? ';' : null;

		if (this.attrNameVals instanceof Array)
		{
			for (const anv of this.attrNameVals)
			{
				addAttrVal(anv, addResult2);
			}
		}
		else
		{
			addAttrVal(this.attrNameVals, addResult2);
		}

		if (result != null)
		{
			this.el.setAttribute(this.attrName, result);
		}
		else
		{
			this.el.removeAttribute(this.attrName);
		}

		function addResult2(attrValue: string | null)
		{
			if (attrValue == null)
			{
				// single: remove attr
				// multi: not added
				if (!isMultiValueType) result = null;
			}
			else
			{
				// single: set attr val
				// multi: add separated with separator
				if (isMultiValueType)
				{
					if (attrValue)
					{
						if (result)
						{
							result += separator;
							result += attrValue;
						}
						else
						{
							result = attrValue;
						}
					}
				}
				else
				{
					result = attrValue;
				}
			}
		}
	}
	get dbg_attrName() { return this.attrName; }
	get dbg_el() { return this.el; }
}

function addAttrVal(anv: AttrNameValue, addResult2: (attrValue: string | null) => void)
{
	addAttrString(anv.attrValue);

	function addAttrString(attrValue: attrValTypeInternal)
	{
		if (attrValue == null || attrValue === false)
		{
			addResult(null);
		}
		else if (typeof attrValue == "string")
		{
			addResult(attrValue);
		}
		else if (attrValue === true)
		{
			addResult('');
		}
		else if (typeof attrValue == "number")
		{
			addResult(attrValue.toString());
		}
		else if (attrValue instanceof Array)
		{
			attrValue.forEach(addAttrString);
		}
		else if (attrValue instanceof Function)
		{
			const v = attrValue();
			addAttrString(v);
		}
		else if (isPropDefReadable(attrValue))
		{
			const v = attrValue.get();
			addAttrString(v);
		}
		else
		{
			addResult(attrValue);
		}
	}
	function addResult(attrValue: string | object | null)
	{
		const s = attrValue == null ? null :
			anv.conv != null ? anv.conv(attrValue) :
				attrValue.toString();

		addResult2(s);
	}
}

function isPropDefReadable(v: any): v is PropDefReadable<unknown>
{
	return v && v.get instanceof Function;
}
