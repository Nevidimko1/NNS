export interface IStorageItem {
    date: Date;
    data: any;
}

export class Storage {
    public static set = (key: string, data: any, date: Date): void => {
        const item: IStorageItem = {
            date: date,
            data: data
        };

        localStorage.setItem(key, JSON.stringify(item));
    }

    public static get = (key: string): null | IStorageItem => {
        const raw = localStorage.getItem(key);
        if (raw == null) {
            return null;
        }

        const item = JSON.parse(raw);
        return {
            date: new Date(item.date),
            data: item.data
        };
    }

}
