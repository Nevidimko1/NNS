import { FilterUnits } from './modules/filterUnits/filterUnits.component';
import { Management } from './modules/management/management.component';
import { Globals } from './shared/globals/globals.singletone';

export const run = () => {
    Globals.getInstance().init()
        .then(() => {
            // clear all logs from outside the script
            console.clear();

            // add scripts here
            new FilterUnits().checkAndRun();
            new Management().checkAndRun();
        });
};
