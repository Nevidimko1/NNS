import { UNIT_TYPES } from '../../shared/enums/unitTypes.enum';
import { UNIT_PAGES } from '../../shared/enums/unitPages.enum';
import { PAGE_TYPES } from '../../shared/enums/pageTypes.enum';
import { Globals } from '../../shared/globals/globals.singletone';

export abstract class Runnable {
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

    constructor() { }

    public checkAndRun = () => {
        const globals = Globals.getInstance();
        if ((this.pageTypes.indexOf(PAGE_TYPES.ANY) > -1 || this.pageTypes.indexOf(globals.pageInfo.pageType) > -1) &&
            (this.unitTypes.indexOf(UNIT_TYPES.ANY) > -1 || this.unitTypes.indexOf(globals.pageInfo.unitType) > -1) &&
            (this.unitPages.indexOf(UNIT_PAGES.ANY) > -1 || this.unitPages.indexOf(globals.pageInfo.unitPage) > -1)
        ) {
            this.run();
        }
    }
}
