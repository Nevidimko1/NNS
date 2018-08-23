import { Prices } from './modules/prices';

export const run = () => {
    const pricesScript = new Prices();
    pricesScript.checkAndRun();
};
