module tsw.elements
{
	class clsNameManager
	{
		private static ids: { [name: string]: number; } = {};

		public static getNextId(clsName?: string): string
		{
			if (!clsName) clsName = 'internalClass';

			var clsNum = this.ids[clsName] || 0;
			clsNum++;
			this.ids[clsName] = clsNum;

			return clsName + clsNum;
		}
	}

	export class clsRef
	{
		private name: string;

		constructor(name?: string)
		{
			this.name = clsNameManager.getNextId(name);
		}

		ref(): string
		{
			return '.' + this.name;
		}

		getName(): string
		{
			return this.name;
		}
	}
}
