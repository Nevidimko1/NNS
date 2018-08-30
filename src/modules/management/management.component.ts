import { Runnable } from '../common/runnable';
import { UNIT_TYPES } from '../../shared/enums/unitTypes.enum';
import { UNIT_PAGES } from '../../shared/enums/unitPages.enum';
import { PAGE_TYPES } from '../../shared/enums/pageTypes.enum';
import { Prices } from './prices/prices.component';
import { StatusBar } from './statusBar/statusBar.component';

export class Management extends Runnable {
    protected readonly pageTypes = [PAGE_TYPES.UNIT_LIST];
    protected readonly unitTypes = [UNIT_TYPES.ANY];
    protected readonly unitPages = [UNIT_PAGES.ANY];

    private statusBar: StatusBar;
    private prices: Prices;

    constructor() {
        super();

        this.statusBar = new StatusBar();
        this.prices = new Prices();
    }

    protected run(): void {
        this.statusBar.addStatusBar();
        this.prices.addColumn();
    }

}
