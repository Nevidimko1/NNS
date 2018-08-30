export interface IStorageItem {
    date: Date;
    data: any;
}

export class StorageItem {
    constructor(public body: IStorageItem = { date: new Date(), data: {} }) { }

    public today = (): boolean => {
        const now = new Date();
        return this.body.date.getFullYear() === now.getFullYear() &&
            this.body.date.getMonth() === now.getMonth() &&
            this.body.date.getDate() === now.getDate();
    }
}

export class Storage {
    public static set = (key: string, data: any, date: Date): void => {
        const itemData: IStorageItem = { date, data };
        localStorage.setItem(key, JSON.stringify(itemData));
    }

    public static get = (key: string): null | StorageItem => {
        const raw = localStorage.getItem(key);
        if (raw == null) {
            return null;
        }

        return new StorageItem(JSON.parse(raw));
    }

}
