export class Api {
    public static get = (url): Promise<any> => {
        return new Promise((resolve, reject) => {
            $.get(url, (content) => {
                resolve(content);
            })
            .fail(e => reject(e));
        });
    }
}
