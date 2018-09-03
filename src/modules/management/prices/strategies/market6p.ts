import { SharePriceStrategy } from './base/marketShare';

export class Market6pPriceStrategy extends SharePriceStrategy {
    constructor() {
        super();
        this.label = 'Market 6%';
        this.description = 'Reach 6% of market share';
        this.share = 6;
    }
}
