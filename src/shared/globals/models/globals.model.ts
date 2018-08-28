import { IRealmInfo } from './realmInfo.model';
import { IPageInfo } from './pageInfo.model';
import { ICompanyInfo } from './companyInfo.model';
import { IUnitItem } from './unitInfo.model';
import { IUnitType } from './unitType.model';

export interface IGlobals {
    info: IRealmInfo;
    pageInfo: IPageInfo;
    companyInfo: ICompanyInfo;
    unitsList: IUnitItem[];
    unitTypes: IUnitType[];
}
