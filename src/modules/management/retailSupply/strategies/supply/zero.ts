import { IRetailSupplyStrategy } from '../../models/retailSupplyStrategy.model';

export class ZeroRetailSupplyStrategy implements IRetailSupplyStrategy {
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
