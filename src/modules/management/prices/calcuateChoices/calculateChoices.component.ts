import { Market6pCalculateChoice } from './market6p';
import { NotSelectedCalculateChoice } from './notSelected';
import { Market10pCalculateChoice } from './market10p';
import { Market20pCalculateChoice } from './market20p';
import { StockCalculateChoice } from './stock';

export const AllCalculateChoices = [
    new NotSelectedCalculateChoice(),
    new Market6pCalculateChoice(),
    new Market10pCalculateChoice(),
    new Market20pCalculateChoice(),
    new StockCalculateChoice()
];
