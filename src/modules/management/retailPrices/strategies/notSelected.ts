import { IRetailPriceStrategy } from '../models/priceStrategy.model';

export class NotSelectedPriceStrategy implements IRetailPriceStrategy {
    public label: string;
    public description: string;
    public skip: boolean;

    constructor() {
        this.label = '-';
        this.description = 'Not selected';
        this.skip = true;
    }

    public calculate = (): number => {
        return 0;
    }
}
