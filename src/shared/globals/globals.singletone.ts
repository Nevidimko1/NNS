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
import { GlobalsService } from './globals.service';
import { IUnitTypesResponse, IUnitType } from './models/unitType.model';

export class Globals implements IGlobals {
    private static instance: Globals;

    private service: GlobalsService;

    protected url: string;

    public token: string;
    public info: IRealmInfo;
    public pageInfo: IPageInfo;
    public companyInfo: ICompanyInfo;
    public unitsList: IUnitItem[];
    public unitTypes: IUnitType[];

    private constructor() {
        this.service = new GlobalsService();
    }

    private getPageInfo = (): IPageInfo => {
        const pageInfo = <IPageInfo>{
            pageType: null,
            unitId: null,
            unitType: null,
            unitPage: null,
        };

        if (!this.url) {
            return;
        }

        // const unitList = this.url.match(/view\/(\d+)(\/unit_list)?(\/building)?/);
        const unitList = this.url.match(/view\/(\d+)(\/[a-zA-Z_]+)?(\/[a-zA-Z_]+)?/);
        if (unitList && Number(unitList[1]) === this.companyInfo.id &&
            (!unitList[2] || unitList[2] === '/unit_list') && !unitList[3]) {
            pageInfo.pageType = PAGE_TYPES.UNIT_LIST;
        } else if (/unit\/view\/[0-9]{1,12}/.exec(this.url)) {
            pageInfo.pageType = PAGE_TYPES.UNIT_PAGE;
            pageInfo.unitId = Number(this.url.match(/[0-9]{1,12}/)[0]);

            if (!/unit\/view\/[0-9]{1,12}\/[a-zA-Z]+/.exec(this.url)) {
                pageInfo.unitPage = UNIT_PAGES.MAIN;
            } else {
                const parsed = this.url.match(/unit\/view\/([0-9]{1,12})\/([a-zA-Z_\/]+)/);
                pageInfo.unitId = Number(parsed[1]);
                pageInfo.unitPage = UNIT_PAGES[parsed[2].toUpperCase()];
            }
            const unitInfo = this.unitsList.filter(u => u.id === pageInfo.unitId)[0];
            pageInfo.unitType = unitInfo ? UNIT_TYPES[unitInfo.unit_class_kind.toUpperCase()] : '';
        }
        return pageInfo;
    }

    private fetchToken = (): Promise<any> => {
        return Api.get(`https://virtonomica.ru/api/${this.info.realm}/main/token`)
            .then((token: string) => this.token = token);
    }

    private fetchUnitTypesList = (): Promise<any> => {
        return Api.get(`https://virtonomica.ru/api/${this.info.realm}/main/unittype/browse`)
            .then((response: IUnitTypesResponse) => {
                this.unitTypes = this.service.parseUnitTypesResponse(response);
            });
    }

    public init = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            try {
                this.url = window.location.href;

                const datetime = $('.date_time').html();
                this.info = {
                    realm: getCookie('last_realm'),
                    date: datetime ? datetime.split('.')[0].trim() : null
                };

                this.companyInfo = {
                    id: $('a.dashboard').prop('href') ? Number($('a.dashboard').prop('href').match(/view\/(\d+)\/dashboard/)[1]) : 0
                };
                if (!this.companyInfo.id) {
                    reject();
                } else {
                    resolve();
                }
            } catch (e) {
                reject(e);
            }
        })
            .then(() => {
                return Promise.all([
                    this.fetchToken(),
                    this.fetchUnitsList(),
                    this.fetchUnitTypesList()
                ]);
            })
            .then(() => {
                this.pageInfo = this.getPageInfo();
                return true;
            })
            .catch(() => { });
    }

    public fetchUnitsList = (params?: string): Promise<IUnitItem[]> => {
        const uid = new Date().getTime();
        let url = `https://virtonomica.ru/api/${this.info.realm}/main/company/units?id=${this.companyInfo.id}&pagesize=${uid}`;
        if (params) {
            url += `&${params}`;
        }
        return Api.get(url)
            .then((response: IUnitsResponse) => this.service.parseUnitsResponse(response))
            .then((unitsList: IUnitItem[]) => this.unitsList = unitsList);
    }

    public getUnitList = (params?: string): IUnitItem[] => {
        return this.unitsList;
    }

    static getInstance(): Globals {
        if (!Globals.instance) {
            Globals.instance = new Globals();
        }
        return Globals.instance;
    }
}
