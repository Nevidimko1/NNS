import { ShopPrices } from './modules/prices';

export const run = () => {
    // add scripts here

    new ShopPrices().checkAndRun();
};
