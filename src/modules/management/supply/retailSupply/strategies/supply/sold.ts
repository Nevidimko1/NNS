import { ISupplyStrategy } from '../../../models/supplyStrategy.model';
import { IShopProduct } from '../../../../../../shared/models/shop.model';

export class SoldRetailSupplyStrategy implements ISupplyStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Sold 2x';
        this.description = 'To have in stock 2x more than sold today';
    }

    public calculate = (product: IShopProduct): number => {

        // order 5% of cityShare for very first product supply
        if (product.supply.sold === 0 &&
            product.supply.purchase === 0 &&
            product.supply.stock === 0) {
            return Math.floor(product.report.localMarketSize * 0.05);
        }

        // Next day after supply change. Keep the quantity
        if (product.supply.purchase === product.supply.stock &&
            product.supply.purchase > 0 &&
            product.supply.sold * 2 <= product.supply.purchase) {
            return product.supply.purchase;
        }

        // sold * 3, because we expect to sell at least same amount on day change
        // and tomorrow we'll have twice more than we sold today
        return Math.max(0, product.supply.sold * 3 - product.supply.stock);
    }
}
