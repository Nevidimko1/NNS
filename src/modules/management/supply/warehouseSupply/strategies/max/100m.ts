import { ISupplyStrategy } from '../../../models/supplyStrategy.model';

export class HundredMWarehouseMinSupplyStrategy implements ISupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = '100 m';
        this.description = 'Max value of 100 000 000';
    }

    public calculate = (): number => {
        return Math.pow(10, 8);
    }
}
