import { IRealmInfo } from './models/realmInfo.model';
import { IPageInfo } from './models/pageInfo.model';
import { ICompanyInfo } from './models/companyInfo.model';

import { UNIT_PAGES } from '../enums/unitPages.enum';
import { UNIT_TYPES } from '../enums/unitTypes.enum';

import { getCookie } from '../../utils';
import { PAGE_TYPES } from '../enums/pageTypes.enum';
import { IGlobals } from './models/globals.model';
import { Api } from '../../utils/api';
import { IUnitItem, IUnitsResponse } from './models/unitInfo.model';
import { GlobalsHelper } from './globals.helper';
import { IUnitTypesResponse, IUnitType } from './models/unitType.model';

export class Globals implements IGlobals {
    private static instance: Globals;

    protected url: string;

    public info: IRealmInfo;
    public pageInfo: IPageInfo;
    public companyInfo: ICompanyInfo;
    public unitsList: IUnitItem[];
    public unitTypes: IUnitType[];

    private constructor() { }

    private getPageInfo = (): IPageInfo => {
        const pageInfo = <IPageInfo>{
            pageType: null,
            unitId: null,
            unitType: null,
            unitPage: null,
        };

        if (this.url.match(/view\/\d+\/(unit_list\/$|unit_list$)/)) {
            pageInfo.pageType = PAGE_TYPES.UNIT_LIST;
        }

        if (/unit\/view\/[0-9]{1,12}/.exec(this.url)) {
            pageInfo.pageType = PAGE_TYPES.UNIT_PAGE;
            pageInfo.unitId = this.url.match(/[0-9]{1,12}/)[0];

            if (!/unit\/view\/[0-9]{1,12}\/[a-zA-Z]+/.exec(this.url)) {
                pageInfo.unitPage = UNIT_PAGES.MAIN;
            } else {
                const parsed = this.url.match(/unit\/view\/([0-9]{1,12})\/([a-zA-Z_\/]+)/);
                pageInfo.unitId = parsed[1];
                pageInfo.unitPage = UNIT_PAGES[parsed[2].toUpperCase()];
            }
            const unitTypeString = $('body').find('.bg-image').attr('class').split(' ')[1].split('-')[1].split('_')[0];
            pageInfo.unitType = UNIT_TYPES[unitTypeString.toUpperCase()];
        }
        return pageInfo;
    }

    private fetchUnitTypesList = (): Promise<any> => {
        return Api.get(`https://virtonomica.ru/api/${this.info.realm}/main/unittype/browse`)
            .then((response: IUnitTypesResponse) => {
                this.unitTypes = GlobalsHelper.parseUnitTypesResponse(response);
            });
    }

    private fetchUnitsList = (): Promise<any> => {
        return Api.get(`https://virtonomica.ru/api/${this.info.realm}/main/company/units?id=${this.companyInfo.id}&pagesize=4000`)
            .then((response: IUnitsResponse) => {
                this.unitsList = GlobalsHelper.parseUnitsResponse(response);
            });
    }

    public init = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            try {
                this.url = window.location.href;

                this.info = {
                    realm: getCookie('last_realm'),
                    date: $('.date_time').html().split('.')[0].trim()
                };

                this.pageInfo = this.getPageInfo();
                this.companyInfo = {
                    id: $('a.dashboard').prop('href') ? $('a.dashboard').prop('href').match(/view\/(\d+)\/dashboard/)[1] : 0
                };
                resolve();
            } catch (e) {
                reject(e);
            }
        })
            .then(() => {
                return Promise.all([
                    this.fetchUnitsList(),
                    this.fetchUnitTypesList()
                ]);
            });
    }

    static getInstance(): Globals {
        if (!Globals.instance) {
            Globals.instance = new Globals();
        }
        return Globals.instance;
    }
}
