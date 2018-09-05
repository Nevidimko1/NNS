import { Status } from '../shared/status/status.singletone';

export class Api {

    public static get = (url: string): Promise<any> => {
        const status = Status.getInstance();
        return new Promise((resolve, reject) => {
            $.get(url, (content) => {
                status.restCalls++;
                resolve(content);
            })
            .fail(reject);
        });
    }

    public static post = (url: string, data: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            const status = Status.getInstance();
            $.post(url, data, (content) => {
                status.restCalls++;
                resolve(content);
            })
            .fail(reject);
        });
    }
}
