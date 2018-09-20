import { ManagementSubComponent } from '../common/managementSub.component';
import { SupplyUnit } from './models/supplyUnit.model';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { ISupplyUnitSettings } from './models/supplyUnit.settings.model';
import { Status } from '../../../shared/status/status.singletone';
import { LOG_STATUS } from '../../../shared/enums/logStatus.enum';

export class SupplyComponent extends ManagementSubComponent {
    private readonly ORDER = ['shop', 'workshop', 'warehouse', 'other'];
    private status: Status;

    private supplyUnits: SupplyUnit[];
    private settings: ISupplyUnitSettings[];

    constructor() {
        super('Supply');

        this.status = Status.getInstance();
        this.supplyUnits = [];
    }

    private updateSupply = (unit: SupplyUnit): Promise<any> => {
        return unit.update()
            .then(() => {
                this.status.progressTick();
                return true;
            })
            .catch(() => {
                this.status.progressTick();
                return false;
            });
    }

    private updateSupplies = (): void => {
        const filtered = this.supplyUnits
            .filter((unit: SupplyUnit) => !unit.row.hasClass('nns-hidden'))
            .filter((unit: SupplyUnit) => unit.selectedStrategy && !unit.selectedStrategy.skip);

        if (!filtered.length) {
            this.status.reset();
            this.status.log('No units to update supply', LOG_STATUS.SUCCESS);
            return;
        }

        this.status.start(filtered.length);
        this.status.log('Updating supplies...', LOG_STATUS.SUCCESS);

        // each unit type is executed in group and next group is waiting until previous execution has finished
        this.ORDER.map((o: string) => {
            const g = filtered.filter((unit: SupplyUnit) => unit.type === o || (o === '###' && this.ORDER.indexOf(unit.type) === -1));
            if (!g.length) {
                return () => Promise.resolve();
            }
            return (): Promise<any> => {
                this.status.log(`Updating supplies for units with type ${o}`);
                return Promise.all(g.map((unit: SupplyUnit) => this.updateSupply(unit)))
                    .then(() => this.status.log(`Updating supplies for units with type ${o} finished`));
            };
        })
        .reduce((p, g) => p.then(g), this.globals.fetchUnitsList());
    }

    public init = (): void => {
        $('table.unit-list-2014 colgroup').append(`<col style="width: 90px;">`);

        $('table.unit-list-2014 thead tr').toArray().forEach(row => {
            $(row).append(`<th class="${SupplyUnit.COLUMN_CLASS} center"></th>`);
        });

        $(`table.unit-list-2014 thead tr:eq(1) th.${SupplyUnit.COLUMN_CLASS}`).append(`
            <button id="supplies-set-all" class="nns-button">Supply</button>
        `);
        $('#supplies-set-all').on('click', this.updateSupplies);

        this.settings = <ISupplyUnitSettings[]>this.getSettings() || [];
        this.supplyUnits = $('table.unit-list-2014 tbody tr')
            .toArray()
            .map((row: HTMLTableRowElement) => {
                const id = Number($(row).find('.unit_id').text()),
                    info: IUnitItem = this.globals.unitsList.filter((item: IUnitItem) => item.id === id)[0],
                    setting: ISupplyUnitSettings = this.settings.filter(s => s.id === id)[0];
                return new SupplyUnit(info, $(row), setting);
            });

        document.addEventListener(SupplyUnit.CHANGE_EVENT, (e: CustomEvent) => {
            const setting: ISupplyUnitSettings = e.detail;
            const ex = this.settings.filter(s => s.id === setting.id)[0];
            if (ex) {
                this.settings[this.settings.indexOf(ex)] = setting;
            } else {
                this.settings.push(setting);
            }
            this.saveSettings(this.settings);
        });

    }
}
