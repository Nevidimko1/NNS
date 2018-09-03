import { IPriceStrategy } from '../models/priceStrategy.model';

export class NotSelectedPriceStrategy implements IPriceStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = '-';
        this.description = 'Not selected';
    }

    public calculate = (): number => {
        return 0;
    }
}
