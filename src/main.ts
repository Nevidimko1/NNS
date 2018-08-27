import { FilterUnits } from './modules/filterUnits';
import { ShopPrices } from './modules/prices';

export const run = () => {
    // add scripts here

    new FilterUnits().checkAndRun();
    new ShopPrices().checkAndRun();
};
