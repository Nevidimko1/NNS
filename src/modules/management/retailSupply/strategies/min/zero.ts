import { IRetailMinSupplyStrategy } from '../../models/retailMinSupplyStrategy.model';

export class ZeroRetailMinSupplyStrategy implements IRetailMinSupplyStrategy {
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
