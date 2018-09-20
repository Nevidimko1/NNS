import { ISupplyStrategy } from '../../../models/supplyStrategy.model';

export class OneBWarehouseMinSupplyStrategy implements ISupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = '1 b';
        this.description = 'Max value of 1 000 000 000';
    }

    public calculate = (): number => {
        return Math.pow(10, 9);
    }
}
