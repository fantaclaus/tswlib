export interface PropDefReadable<T>
{
	get(): T;
}
export interface PropDef<T> extends PropDefReadable<T>
{
	set(v: T): void;
}

