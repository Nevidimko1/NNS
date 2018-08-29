import { MarketShareCalculateChoice } from './marketShare';

export class Market6pCalculateChoice extends MarketShareCalculateChoice {
    constructor() {
        super();
        this.label = 'Market 6%';
        this.description = 'Reach 6% of market share';
        this.share = 6;
    }
}
