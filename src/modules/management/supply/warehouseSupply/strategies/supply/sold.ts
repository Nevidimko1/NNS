import { ISupplyStrategy } from '../../../models/supplyStrategy.model';
import { IWarehouseProduct } from '../../../../../../shared/models/warehouse.model';

export class SoldWarehouseSupplyStrategy implements ISupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Sold 3x';
        this.description = 'To have in stock 2x more than sold today';
    }

    public calculate = (product: IWarehouseProduct): number => {
        return Math.max(0, product.sellContract * 4 - product.stock);
    }
}
