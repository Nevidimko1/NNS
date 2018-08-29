export class Api {
    public static get = (url: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            $.get(url, (content) => {
                resolve(content);
            })
            .fail(e => reject(e));
        });
    }

    public static post = (url: string, data: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            $.post(url, data, (content) => {
                resolve(content);
            })
            .fail(e => reject(e));
        });
    }
}
