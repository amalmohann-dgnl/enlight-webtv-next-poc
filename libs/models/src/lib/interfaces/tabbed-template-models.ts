export type ComponentType<T> = new (_: any) => T;

export interface ListWrapperIndexType {
    index: number;
    previousIndex: number;
    dataLength: number;
}
