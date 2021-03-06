import { IShopProduct } from '../../../../shared/models/shop.model';

export interface IRetailPriceStrategy {
    label: string;
    description: string;
    skip?: boolean;

    calculate(product: IShopProduct): number;
}

export interface ISharePriceStrategy extends IRetailPriceStrategy {
    share: number;
}
