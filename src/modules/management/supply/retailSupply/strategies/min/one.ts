import { IMinSupplyStrategy } from '../../../models/minSupplyStrategy.model';

export class OneRetailMinSupplyStrategy implements IMinSupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = '1';
        this.description = 'At least one product must be ordered';
    }

    public calculate = (): number => {
        return 1;
    }
}
