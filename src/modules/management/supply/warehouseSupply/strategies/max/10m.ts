import { ISupplyStrategy } from '../../../models/supplyStrategy.model';

export class TenMWarehouseMinSupplyStrategy implements ISupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = '10 m';
        this.description = 'Max value of 10 000 000';
    }

    public calculate = (): number => {
        return Math.pow(10, 7);
    }
}
