import { IShopProduct } from '../../../../shared/models/shop.model';
import { IWarehouseProduct } from '../../../../shared/models/warehouse.model';

export interface ISupplyStrategy {
    label: string;
    description: string;
    skip?: boolean;

    calculate(product: IShopProduct | IWarehouseProduct): number;
}
