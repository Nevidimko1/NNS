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
    cityShare: number;
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
    supply: IShopProductSupply;
    imageSrc: string;
    /**
     * field name for POST call
     */
    updateFieldName: string;
}

export interface IShopProductSupply {
    /**
     * Items to order for tomorrow
     */
    parcel: number;
    priceMarkUp: number;
    priceConstraintMax: number;
    priceConstraintType: string;
    qualityConstraintMin: number;
    /**
     * Delivered today
     */
    purchase: number;
    stock: number;
    /**
     * Sold today
     */
    sold: number;
    offer: number;
    price: number;
    reprice: boolean;
    quality: number;
    available: number;
}

export interface IShop extends IBase {
    products: IShopProduct[];
}
