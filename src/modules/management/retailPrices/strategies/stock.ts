import { IRetailPriceStrategy } from '../models/priceStrategy.model';
import { IShopProduct } from '../../../../shared/models/shop.model';
import { numberify } from '../../../../utils';

export class StockPriceStrategy implements IRetailPriceStrategy {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Stock';
        this.description = 'Try to sell everything';
    }

    public calculate = (product: IShopProduct): number => {
        const priceOld = product.history[0].price;            // цена последней продажи
        const deliver = product.deliver;                      // текущая закупка
        const stock = product.stock;                          // сейчас на складе
        let price = priceOld || 0;
        if (stock > 0 && deliver === stock) {
            price *= (0.97 + 0.06);
        }

        return numberify(price.toPrecision(4));
    }
}
