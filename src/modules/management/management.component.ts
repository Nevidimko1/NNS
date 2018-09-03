import { Runnable } from '../common/runnable';
import { UNIT_TYPES } from '../../shared/enums/unitTypes.enum';
import { UNIT_PAGES } from '../../shared/enums/unitPages.enum';
import { PAGE_TYPES } from '../../shared/enums/pageTypes.enum';
import { RetailPricesComponent } from './retailPrices/retailPrices.component';
import { StatusBar } from './statusBar/statusBar.component';

export class Management extends Runnable {
    protected readonly pageTypes = [PAGE_TYPES.UNIT_LIST];
    protected readonly unitTypes = [UNIT_TYPES.ANY];
    protected readonly unitPages = [UNIT_PAGES.ANY];

    private statusBar: StatusBar;
    private retailPrices: RetailPricesComponent;

    constructor() {
        super();

        this.statusBar = new StatusBar();
        this.retailPrices = new RetailPricesComponent();
    }

    protected run(): void {
        this.statusBar.init();
        this.retailPrices.init();
    }

}
