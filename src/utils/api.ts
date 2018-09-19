import { Status } from '../shared/status/status.singletone';
import { Globals } from '../shared/globals/globals.singletone';

export class Api {
    public static refreshCache = (unitId: number): Promise<any> => {
        const globals = Globals.getInstance();
        return Api.post(`https://virtonomica.ru/api/${globals.info.realm}/main/unit/refresh`, {
            id: unitId,
            token: globals.token
        });
    }

    public static get = (url: string): Promise<any> => {
        const status = Status.getInstance();
        return new Promise((resolve, reject) => {
            $.get(url, (content) => {
                status.restCallUsed();
                resolve(content);
            })
            .fail(reject);
        });
    }

    public static post = (url: string, data: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            const status = Status.getInstance();
            $.post(url, data, (content) => {
                status.restCallUsed();
                resolve(content);
            })
            .fail(reject);
        });
    }

    public static postJson = (url: string, data: Object): Promise<any> => {
        return new Promise((resolve, reject) => {
            const status = Status.getInstance();
            $.ajax({
                url: url,
                data: data,
                type: 'POST',
                dataType: 'JSON',
                success: (content) => {
                    status.restCallUsed();
                    resolve(content);
                },
                error: (e) => reject(e)
            });
        });
    }
}
