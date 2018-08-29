import { MarketShareCalculateChoice } from './marketShare';

export class Market20pCalculateChoice extends MarketShareCalculateChoice {
    constructor() {
        super();
        this.label = 'Market 20%';
        this.description = 'Reach 20% of market share';
        this.share = 20;
    }
}
