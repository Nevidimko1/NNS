import { ISupplyStrategy } from '../../../models/supplyStrategy.model';

export class TenWarehouseMinSupplyStrategy implements ISupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = '10';
        this.description = 'At least ten products must be ordered';
    }

    public calculate = (): number => {
        return 10;
    }
}
