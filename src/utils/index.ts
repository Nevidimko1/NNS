export const getParameterByName = (name: string, url: string): string => {
    if (!url) {
        url = window.location.href;
    }

    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

export const getCookie = (cookie_name: string): string => {
    const results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');

    if (results) {
        return unescape(results[2]);
    } else {
        return null;
    }
};

export const setCookie = (name: string, value: string, options: any): void => {
    options = options || {};

    let expires = options.expires;

    if (typeof expires === 'number' && expires) {
        const d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    let updatedCookie = name + '=' + value;

    for (const propName in options) {
        if (options[propName]) {
            updatedCookie += '; ' + propName;
            const propValue = options[propName];
            if (propValue !== true) {
                updatedCookie += '=' + propValue;
            }
        }
    }

    document.cookie = updatedCookie;
};

/**
 * Оцифровывает строку. Возвращает всегда либо Number.POSITIVE_INFINITY либо 0
 * @param variable любая строка.
 */
export function numberify(variable: string): number {
    // возвращает либо число полученно из строки, либо БЕСКОНЕЧНОСТЬ, либо 0 если не получилось преобразовать.
    if (String(variable) === 'Не огр.' ||
        String(variable) === 'Unlim.' ||
        String(variable) === 'Не обм.' ||
        String(variable) === 'N’est pas limité' ||
        String(variable) === 'No limitado' ||
        String(variable) === '无限' ||
        String(variable) === 'Nicht beschr.') {
        return Number.POSITIVE_INFINITY;
    } else {
        return parseFloat(String(variable).replace(/[\s\$\%\©]/g, '')) || 0;
    }
}

export function flatMap<T>(source: T): Array<T[keyof T]> {
    return Object.keys(source).map(key => source[key]);
}
