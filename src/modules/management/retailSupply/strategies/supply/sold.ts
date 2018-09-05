import { IRetailSupplyStrategy } from '../../models/retailSupplyStrategy.model';
import { IShopProduct } from '../../../../../shared/models/shop.model';

export class SoldRetailSupplyStrategy implements IRetailSupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Sold 2x';
        this.description = 'To have in stock 2x more than sold today';
    }

    public calculate = (product: IShopProduct): number => {
        // sold * 3, because we expect to sell at least same amount on day change
        // and tomorrow we'll have sold * 2
        const sold2x = product.supply.sold * 3,
            maxStockDiff = sold2x - product.stock;

        return Math.max(0, maxStockDiff);
    }
}
