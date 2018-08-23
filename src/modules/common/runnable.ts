import { UNIT_TYPES } from '../../shared/enums/unitTypes.enum';
import { UNIT_PAGES } from '../../shared/enums/unitPages.enum';
import { Globals } from '../../shared/globals';

export abstract class Runnable {
    /**
     * Building types script should be run on
     */
    protected abstract unitTypes: UNIT_TYPES[];

    /**
     * Building pages script should be run on
     */
    protected abstract unitPages: UNIT_PAGES[];

    /**
     * Script execution function
     */
    protected abstract run(): void;

    constructor() { }

    public checkAndRun = () => {
        const globals = Globals.getInstance();
        if (this.unitTypes.indexOf(globals.pageInfo.unitType) > -1 && this.unitPages.indexOf(globals.pageInfo.unitPage) > -1) {
            this.run();
        }
    }
}
