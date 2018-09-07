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

        // order 5% of cityShare for very first product supply
        if (product.supply.stock === 0 && product.supply.sold === 0) {
            return Math.floor(product.report.cityShare * 0.05);
        }

        // on second day after first delivery keep the quantity
        if (product.supply.sold === 0 && product.supply.stock === product.supply.purchase) {
            return product.supply.parcel;
        }

        // Next day after supply was increased. Keep the quantity
        if (product.supply.stock === product.supply.purchase) {
            if (product.supply.sold * 2 === product.supply.stock) {
                return product.supply.parcel;
            }
        }

        // sold * 3, because we expect to sell at least same amount on day change
        // and tomorrow we'll have sold * 2
        return Math.max(0, product.supply.sold * 3 - product.supply.stock);
    }
}
