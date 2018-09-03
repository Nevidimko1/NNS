import { IShopProduct } from '../../../../shared/models/shop.model';

export interface IRetailMinSupplyStrategy {
    label: string;
    description: string;

    calculate(product: IShopProduct): number;
}
