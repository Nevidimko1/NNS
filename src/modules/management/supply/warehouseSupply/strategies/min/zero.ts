import { ISupplyStrategy } from '../../../models/supplyStrategy.model';

export class ZeroWarehouseMinSupplyStrategy implements ISupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = '0';
        this.description = 'No minimum limit';
    }

    public calculate = (): number => {
        return 0;
    }
}
