import { IMinSupplyStrategy } from '../../../models/minSupplyStrategy.model';

export class ZeroRetailMinSupplyStrategy implements IMinSupplyStrategy {
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
