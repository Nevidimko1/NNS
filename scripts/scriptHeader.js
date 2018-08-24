module.exports = (dev) => {
    return `
        // ==UserScript==

        // @name            Virtonomica: NNS script ${dev ? 'DEV' : ''}
        // @namespace       Virtonomica
        // @description     Универсальный скрипт для виртономики
        // @version         1.0
        // @include         https://*virtonomic*.*/*


        // ==/UserScript==
    `
};
