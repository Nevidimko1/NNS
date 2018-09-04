import { Globals } from '../../globals/globals.singletone';

export class DataService {
    protected globals: Globals;

    constructor() {
        this.globals = Globals.getInstance();
    }

    protected storageKey = (unitId: number): string => {
        return `${this.globals.info.realm}/${this.globals.companyInfo.id}/${unitId}`;
    }
}
