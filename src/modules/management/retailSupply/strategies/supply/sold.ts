import { IRetailSupplyStrategy } from '../../models/retailSupplyStrategy.model';

export class SoldRetailSupplyStrategy implements IRetailSupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Sold 200%';
        this.description = '200% of sold today';
    }

    public calculate = (): number => {
        return 0;
    }
}
