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
