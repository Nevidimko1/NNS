import { IShopProduct } from '../../../../shared/models/shop.model';

export interface IMaxSupplyStrategy {
    label: string;
    description: string;

    calculate(product: IShopProduct): number;
}
