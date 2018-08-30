import { IUnitItemProduct } from '../globals/models/unitInfo.model';
import { IBase } from './base.model';

export interface IShopProductHistory {
    quantity: number;
    quality: number;
    price: number;
    brand: number;
}

export interface IShopProductReport {
    localPrice: number;
    localQuality: number;
    localBrand: number;
}

export interface IShopProduct extends IUnitItemProduct {
    price: number;
    quality: number;
    /**
     * Price of the item was ordered
     */
    purch: number;
    cityPrice: number;
    cityQuality: number;
    /**
     * Last order delivered items quantity
     */
    deliver: number;
    /**
     * Currently available items quantity
     */
    stock: number;
    /**
     * sold / max_city_can_buy
     */
    share: number;
    history: IShopProductHistory[];
    report: IShopProductReport;
    imageSrc: string;
    /**
     * field name for POST call
     */
    updateFieldName: string;
}

export interface IShop extends IBase {
    products: IShopProduct[];
}
