export interface IUnitTypesResponseItem {
    id: string;
    industry_id: string;
    class_id: string;
    kind: string;
    name: string;
    industry_name: string;
    class_name: string;
    symbol: string;
    need_technology: string;
    labor_max: string;
    equipment_max: string;
    square: string;
    building_time: string;
}

export interface IUnitTypesResponse {
    [key: string]: IUnitTypesResponseItem;
}

export interface IUnitType {
    id: number;
    industry_id: number;
    class_id: number;
    kind: string;
    name: string;
    industry_name: string;
    class_name: string;
    symbol: string;
    need_technology: boolean;
    labor_max: number;
    equipment_max: number;
    square: number;
    building_time: number;
}
