import { IRealmInfo } from './models/realmInfo.model';
import { IPageInfo } from './models/pageInfo.model';
import { ICompanyInfo } from './models/companyInfo.model';

import { UNIT_PAGES } from './enums/unitPages.enum';
import { UNIT_TYPES } from './enums/unitTypes.enum';

import { getCookie } from './utils';
import { PAGE_TYPES } from './enums/pageTypes.enum';

export class Globals {
    private static instance: Globals;

    protected url: string;

    readonly info: IRealmInfo;
    readonly pageInfo: IPageInfo;
    readonly companyInfo: ICompanyInfo;

    private constructor() {
        this.url = window.location.href;

        this.info = {
            realm: getCookie('last_realm'),
            date: $('.date_time').html().split('.')[0].trim()
        };

        this.pageInfo = this.getPageInfo();
        this.companyInfo = {
            id: $('a.dashboard').prop('href') ? $('a.dashboard').prop('href').match(/view\/(\d+)\/dashboard/)[1] : 0
        };
    }

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

    public init = (): Promise<any> => {
        return new Promise((resolve) => {
            resolve();
        });
    }

    static getInstance(): Globals {
        if (!Globals.instance) {
            Globals.instance = new Globals();
        }
        return Globals.instance;
    }
}
