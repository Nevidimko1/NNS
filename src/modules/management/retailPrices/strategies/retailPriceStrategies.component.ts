import { Market6pPriceStrategy } from './market6p';
import { NotSelectedPriceStrategy } from './notSelected';
import { Market10pPriceStrategy } from './market10p';
import { Market20pPriceStrategy } from './market20p';
import { StockPriceStrategy } from './stock';
import { ZeroPriceStrategy } from './zero';

export const RetailPriceStrategies = [
    new NotSelectedPriceStrategy(),
    new ZeroPriceStrategy(),
    new Market6pPriceStrategy(),
    new Market10pPriceStrategy(),
    new Market20pPriceStrategy(),
    new StockPriceStrategy()
];
