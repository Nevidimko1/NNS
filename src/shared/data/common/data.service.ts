import { Globals } from '../../globals/globals.singletone';
import { Status } from '../../status/status.singletone';

export class DataService {
    protected globals: Globals;
    protected status: Status;

    constructor() {
        this.globals = Globals.getInstance();
        this.status = Status.getInstance();
    }

    protected storageKey = (unitId: number): string => {
        return `${this.globals.info.realm}/${this.globals.companyInfo.id}/${unitId}`;
    }
}
