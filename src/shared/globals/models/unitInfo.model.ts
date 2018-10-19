import { IBase } from '../../models/base.model';

export interface IUnitsResponseProduct {
    id: string;
    name: string;
    symbol: string;
}

export interface IUnitsResponseDataItem {
    id: string;
    name: string;
    country_symbol: string;
    country_name: string;
    region_name: string;
    city_name: string;
    unit_type_id: string;
    unit_type_symbol: string;
    unit_type_name: string;
    size: string;
    labor_max: string;
    equipment_max: string;
    square: string;
    unit_type_produce_name: string;
    unit_class_id: string;
    unit_class_name: string;
    unit_class_kind: string;
    productivity: string;
    notice: string;
    products: IUnitsResponseProduct[];
    market_status: string;
    time_to_build: string;
    office_sort: string;
}

export interface IUnitsResponseIndicator {
    id: string;
    kind: string;
    name: string;
}

export interface IUnitsResponseIndicators {
    [indicatorId: string]: IUnitsResponseIndicator;
}

export interface IUnitsResponseInfo {
    count: string;
    page: number;
    page_size: number;
}

export interface IUnitsResponse {
    data: {
        [key: string]: IUnitsResponseDataItem
    };
    indicators: {
        [unitId: string]: IUnitsResponseIndicators;
    };
    info: any;
}

export interface IUnitIndicator extends IBase {
    id: number;
    kind: string;
    name: string;
}

export interface IUnitItemProduct extends IBase {
    symbol: string;
}

export interface IUnitItem extends IBase {
    country_symbol: string;
    country_name: string;
    region_name: string;
    city_name: string;
    unit_type_id: number;
    unit_type_symbol: string;
    unit_type_name: string;
    size: number;
    labor_max: number;
    equipment_max: number;
    square: number;
    unit_type_produce_name: string;
    unit_class_id: number;
    unit_class_name: string;
    unit_class_kind: string;
    productivity: number;
    notice: string;
    products: IUnitItemProduct[];
    market_status: string;
    time_to_build: number;
    office_sort: number;

    indicators: IUnitIndicator[];
}
