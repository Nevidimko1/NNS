import { ISupplyStrategy } from '../../../models/supplyStrategy.model';

export class ZeroRetailSupplyStrategy implements ISupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Zero';
        this.description = 'Cancel all supplies';
    }

    public calculate = (): number => {
        return 0;
    }
}
