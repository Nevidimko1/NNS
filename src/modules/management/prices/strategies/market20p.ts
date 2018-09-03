import { SharePriceStrategy } from './base/marketShare';

export class Market20pPriceStrategy extends SharePriceStrategy {
    constructor() {
        super();
        this.label = 'Market 20%';
        this.description = 'Reach 20% of market share';
        this.share = 20;
    }
}
