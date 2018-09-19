import { IBase } from './base.model';
import { IUnitItemProduct } from '../globals/models/unitInfo.model';

export interface IWarehouseSupplyChange {
    unitid: number;
    offer: number;
    amount: number;
    priceConstraint: number;
    priceMarkUp: number;
    qualityMin: number;
    constraintPriceType: string;
}

export interface IWarehouseTarget extends IBase {
    myself: boolean;

    available: number;
    price: number;
    quality: number;

    offer: number;

    pqr: number;
}

export interface IWarehouseContract extends IWarehouseTarget {
    parcel: number;

    priceConstraintMax: number;
    priceConstraintType: string;
    qualityConstraintMin: number;
    priceMarkUp: number;

    reprice: boolean;
}

export interface IWarehouseSupplier extends IWarehouseTarget {
    isWarehouse: boolean;
}

export interface IWarehouseProduct extends IUnitItemProduct {
    quality: number;
    purchase: number;
    price: number;

    sellContract: number;
    sold: number;
    buyContract: number;
    bought: number;

    stock: number;

    contracts: IWarehouseContract[];
    suppliers: IWarehouseSupplier[];
}

export interface IWarehouse extends IBase {
    size: number;
    used: number;
    form: JQuery<HTMLFormElement>;
    products: IWarehouseProduct[];
}
