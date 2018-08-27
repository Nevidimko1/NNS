export interface IStoreItem {
    date: Date;
    data: any;
}

export const store_ls = (key: string, data: any, date: Date): void => {
    const item: IStoreItem = {
        date: date,
        data: data
    };

    localStorage.setItem(key, JSON.stringify(item));
};

export const restore_ls = (key: string): null | IStoreItem => {
    const raw = localStorage.getItem(key);
    if (raw == null) {
        return null;
    }

    const item = JSON.parse(raw);
    return {
        date: new Date(item.date),
        data: item.data
    };
};
