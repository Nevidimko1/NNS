import { IRetailPriceStrategy } from '../models/priceStrategy.model';

export class ZeroPriceStrategy implements IRetailPriceStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Zero';
        this.description = 'Zero prices';
    }

    public calculate = (): number => {
        return 0;
    }
}
