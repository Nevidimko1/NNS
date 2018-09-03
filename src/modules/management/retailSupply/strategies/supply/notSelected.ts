import { IRetailSupplyStrategy } from '../../models/retailSupplyStrategy.model';

export class NotSelectedRetailSupplyStrategy implements IRetailSupplyStrategy {
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
