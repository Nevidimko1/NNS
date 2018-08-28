import { UNIT_TYPES } from '../enums/unitTypes.enum';
import { UNIT_PAGES } from '../enums/unitPages.enum';
import { PAGE_TYPES } from '../enums/pageTypes.enum';

export interface IPageInfo {
    pageType: PAGE_TYPES;
    unitId: string;
    unitType: UNIT_TYPES;
    unitPage: UNIT_PAGES;
}
