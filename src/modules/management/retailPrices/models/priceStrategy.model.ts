import { IShopProduct } from '../../../../shared/models/shop.model';

export interface IPriceStrategy {
    label: string;
    description: string;
    skip?: boolean;

    calculate(product: IShopProduct): number;
}

export interface ISharePriceStrategy extends IPriceStrategy {
    share: number;
}
