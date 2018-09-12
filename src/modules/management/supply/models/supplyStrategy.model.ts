import { IShopProduct } from '../../../../shared/models/shop.model';

export interface ISupplyStrategy {
    label: string;
    description: string;
    skip?: boolean;

    calculate(product: IShopProduct): number;
}
