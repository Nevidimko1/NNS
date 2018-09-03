import { Market6pPriceStrategy } from './market6p';
import { NotSelectedPriceStrategy } from './notSelected';
import { Market10pPriceStrategy } from './market10p';
import { Market20pPriceStrategy } from './market20p';
import { StockPriceStrategy } from './stock';

export const PriceStrategies = [
    new NotSelectedPriceStrategy(),
    new Market6pPriceStrategy(),
    new Market10pPriceStrategy(),
    new Market20pPriceStrategy(),
    new StockPriceStrategy()
];
