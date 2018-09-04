import { Globals } from '../../../shared/globals/globals.singletone';
import { LS } from '../../../utils/storage';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';

export class ManagementSubComponent {
    private readonly storageKey: string;

    public globals: Globals;

    constructor(protected componentName: string) {
        this.globals = Globals.getInstance();

        this.storageKey = `${this.globals.info.realm}/${this.globals.companyInfo.id}/${this.globals.pageInfo.pageType}/${componentName}`;
    }

    public getUnitItemByRow = (row: HTMLTableRowElement): IUnitItem => {
        return this.globals.unitsList.filter((u: IUnitItem) => u.id === Number($(row).find('.unit_id').text()))[0];
    }

    public saveSettings = (settings: any): void => {
        LS.set(this.storageKey, settings);
    }

    public getSettings = <T>(): T => {
        const restored = LS.get(this.storageKey),
            settings: T = restored ? restored.data : null;

        return settings;
    }

    public init = (): void => { };

}
