import { ISupplyStrategy } from '../../../models/supplyStrategy.model';

export class NotSelectedWarehouseSupplyStrategy implements ISupplyStrategy {
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
