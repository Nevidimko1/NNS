import { IShopProduct } from '../../../../shared/models/shop.model';

export interface IMinSupplyStrategy {
    label: string;
    description: string;

    calculate(product: IShopProduct): number;
}
