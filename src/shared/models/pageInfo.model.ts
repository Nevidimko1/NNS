import { UNIT_TYPES } from '../enums/unitTypes.enum';
import { UNIT_PAGES } from '../enums/unitPages.enum';

export interface IPageInfo {
    pageType: string;
    unitId: string;
    unitType: UNIT_TYPES;
    unitPage: UNIT_PAGES;
}
