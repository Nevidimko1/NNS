module.exports = (dev) => {
    return `
        // ==UserScript==

        // @name            Virtonomica: NNS script ${dev ? 'DEV' : ''}
        // @namespace       Virtonomica
        // @description     Универсальный скрипт для виртономики
        // @version         1.0
        // @include         https://*virtonomic*.*/*
        // @import url('https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');


        // ==/UserScript==
    `
};
