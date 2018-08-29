import { MarketShareCalculateChoice } from './marketShare';

export class Market10pCalculateChoice extends MarketShareCalculateChoice {
    constructor() {
        super();
        this.label = 'Market 10%';
        this.description = 'Reach 10% of market share';
        this.share = 10;
    }
}
