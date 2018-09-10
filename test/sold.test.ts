import { SoldRetailSupplyStrategy } from '../src/modules/management/retailSupply/strategies/supply/sold';
import { IShopProduct } from '../src/shared/models/shop.model';

describe('Retail Supply strategy - Sold', () => {
    const sold = new SoldRetailSupplyStrategy();
    let product: IShopProduct;
    let quantity: number;

    it('> Reach sold * 2 as fast as we can', () => {

        // Day 1
        product = {
            report: {
                cityShare: 1000
            },
            supply: {
                sold: 0,
                parcel: 0,
                purchase: 0,
                stock: 0,
            }
        } as any as IShopProduct;
        quantity = sold.calculate(product);
        product.supply.parcel = quantity;
        expect(quantity).toBe(50);

        // Day 2. First deliver
        product.supply.stock = quantity;
        product.supply.purchase = quantity;

        quantity = sold.calculate(product);
        product.supply.parcel = quantity;
        expect(quantity).toBe(50);

        // Day 3. Sold everything. Order twice more
        product.supply.sold = quantity;

        quantity = sold.calculate(product);
        product.supply.parcel = quantity;
        expect(quantity).toBe(100);

        // Day 4. Keep previous order
        console.log(JSON.stringify(product.supply));
        product.supply.stock = quantity;
        product.supply.purchase = quantity;

        quantity = sold.calculate(product);
        product.supply.parcel = quantity;
        console.log(JSON.stringify(product.supply));
        expect(quantity).toBe(100);

        // Day 5. Reached max sales (less than we have in stock)
        product.supply.sold = 70;
        product.supply.stock = product.supply.stock + quantity - product.supply.sold;

        quantity = sold.calculate(product);
        product.supply.parcel = quantity;
        expect(quantity).toBe(80);

        // Day 6. Same sales
        product.supply.stock = product.supply.stock + quantity - product.supply.sold;
        product.supply.purchase = quantity;

        quantity = sold.calculate(product);
        product.supply.parcel = quantity;
        expect(quantity).toBe(70);
        expect(product.supply.stock).toBe(140);

        // In 6 days reached "stock = sold * 2" with daily orders equal to "sold"
    });

    it('> Delivered less than ordered. We should keep parcel.', () => {
        product = {
            supply: {
                stock: 100,
                parcel: 50,
                purchase: 25,
                sold: 50
            }
        } as any as IShopProduct;
        quantity = sold.calculate(product);
        product.supply.parcel = quantity;
        expect(quantity).toBe(50);
    });

    it('> Stock overload. Stop the supply.', () => {
        product = {
            supply: {
                stock: 1000,
                parcel: 50,
                purchase: 50,
                sold: 50
            }
        } as any as IShopProduct;
        quantity = sold.calculate(product);
        product.supply.parcel = quantity;
        expect(quantity).toBe(0);
    });
});
