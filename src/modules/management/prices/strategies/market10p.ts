import { SharePriceStrategy } from './base/marketShare';

export class Market10pPriceStrategy extends SharePriceStrategy {
    constructor() {
        super();
        this.label = 'Market 10%';
        this.description = 'Reach 10% of market share';
        this.share = 10;
    }
}
