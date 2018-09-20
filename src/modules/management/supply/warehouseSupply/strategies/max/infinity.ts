import { ISupplyStrategy } from '../../../models/supplyStrategy.model';

export class InfinityWarehouseMinSupplyStrategy implements ISupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Infinity';
        this.description = 'No maximum limit';
    }

    public calculate = (): number => {
        return Infinity;
    }
}
