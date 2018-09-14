import { IBase } from './base.model';
import { IUnitItemProduct } from '../globals/models/unitInfo.model';

export interface IWarehouseContract {
    myself: boolean;

    parcel: number;
    available: number;
    price: number;
    quality: number;

    offer: number;

    priceConstraintMax: number;
    priceConstraintType: string;
    qualityConstraintMin: number;
    priceMarkUp: number;

    reprice: boolean;
}

export interface IWarehouseProduct extends IUnitItemProduct {
    shipments: number;
    stock: number;

    contracts: IWarehouseContract[];
}

export interface IWarehouse extends IBase {
    form: JQuery<HTMLFormElement>;
    products: IWarehouseProduct[];
}
