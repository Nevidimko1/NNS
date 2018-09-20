import { UNIT_TYPES } from '../../shared/enums/unitTypes.enum';
import { UNIT_PAGES } from '../../shared/enums/unitPages.enum';
import { PAGE_TYPES } from '../../shared/enums/pageTypes.enum';
import { Globals } from '../../shared/globals/globals.singletone';

export abstract class Runnable {
    public globals: Globals;
    /**
     * List of page types, which script should be run on
     */
    protected abstract pageTypes: PAGE_TYPES[];
    /**
     * List of unit types, which script should be run on
     */
    protected abstract unitTypes: UNIT_TYPES[];

    /**
     * List of unit pages, which script should be run on
     */
    protected abstract unitPages: UNIT_PAGES[];

    /**
     * Script execution function
     */
    protected abstract run(): void;

    constructor() {
        this.globals = Globals.getInstance();
    }

    public checkAndRun = () => {
        if ((this.globals.pageInfo) &&
            (this.pageTypes.indexOf(PAGE_TYPES.ANY) > -1 || this.pageTypes.indexOf(this.globals.pageInfo.pageType) > -1) &&
            (this.unitTypes.indexOf(UNIT_TYPES.ANY) > -1 || this.unitTypes.indexOf(this.globals.pageInfo.unitType) > -1) &&
            (this.unitPages.indexOf(UNIT_PAGES.ANY) > -1 || this.unitPages.indexOf(this.globals.pageInfo.unitPage) > -1)
        ) {
            this.run();
        }
    }
}
