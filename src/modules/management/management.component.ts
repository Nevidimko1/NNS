import { Runnable } from '../common/runnable';
import { UNIT_TYPES } from '../../shared/enums/unitTypes.enum';
import { UNIT_PAGES } from '../../shared/enums/unitPages.enum';
import { PAGE_TYPES } from '../../shared/enums/pageTypes.enum';
import { Globals } from '../../shared/globals/globals.component';
import { Prices } from './prices/prices.component';

export class Management extends Runnable {
    protected readonly pageTypes = [PAGE_TYPES.UNIT_LIST];
    protected readonly unitTypes = [UNIT_TYPES.ANY];
    protected readonly unitPages = [UNIT_PAGES.ANY];

    protected readonly storageKey: string;

    private prices: Prices;

    constructor() {
        super();

        this.storageKey = `${Globals.getInstance().companyInfo.id}/${PAGE_TYPES.UNIT_LIST}/Management`;

        this.prices = new Prices();
    }

    protected run(): void {

        this.prices.addColumn();
    }

}
