import { IUnitsResponse, IUnitsResponseDataItem, IUnitItem, IUnitsResponseIndicator } from '../globals/models/unitInfo.model';
import { flatMap } from '../../utils';
import { IUnitType, IUnitTypesResponse, IUnitTypesResponseItem } from './models/unitType.model';

export class GlobalsHelper {
    static parseUnitsResponse = (response: IUnitsResponse): IUnitItem[] => {
        return flatMap(response.data)
            .map((responseItem: IUnitsResponseDataItem) => {
                return {
                    ...responseItem,
                    id: Number(responseItem.id),
                    size: Number(responseItem.size),
                    labor_max: Number(responseItem.labor_max),
                    equipment_max: Number(responseItem.equipment_max),
                    square: Number(responseItem.square),
                    unit_class_id: Number(responseItem.unit_class_id),
                    productivity: Number(responseItem.productivity),
                    time_to_build: Number(responseItem.time_to_build),
                    office_sort: Number(responseItem.office_sort),
                    indicators: Object.keys(response.indicators)
                        .filter((key: string) => Number(responseItem.id) === Number(key))
                        .map((key: string) => flatMap(response.indicators[key])
                            .map((item: IUnitsResponseIndicator) => ({
                                id: Number(item.id),
                                kind: item.kind,
                                name: item.name
                            }))
                        )[0]
                };
            });
    }

    static parseUnitTypesResponse = (response: IUnitTypesResponse): IUnitType[] => {
        return flatMap(response)
            .map((responseItem: IUnitTypesResponseItem) => ({
                ...responseItem,
                id: Number(responseItem.id),
                industry_id: Number(responseItem.industry_id),
                class_id: Number(responseItem.class_id),
                need_technology: responseItem.need_technology === 't',
                labor_max: Number(responseItem.labor_max),
                equipment_max: Number(responseItem.equipment_max),
                square: Number(responseItem.square),
                building_time: Number(responseItem.building_time)
            }));
    }
}
