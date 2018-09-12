import { ManagementSubComponent } from '../common/managementSub.component';
import { SupplyUnit } from './models/supplyUnit.model';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { ISupplyUnitSettings } from './models/supplyUnit.settings.model';
import { Status } from '../../../shared/status/status.singletone';
import { LOG_STATUS } from '../../../shared/enums/logStatus.enum';

export class SupplyComponent extends ManagementSubComponent {
    private status: Status;

    private supplyUnits: SupplyUnit[];

    constructor() {
        super('Supply');

        this.status = Status.getInstance();
        this.supplyUnits = [];
    }

    private updateSupplies = (): void => {
        const filtered = this.supplyUnits
            .filter((unit: SupplyUnit) => !unit.row.hasClass('nns-hidden'))
            .filter((unit: SupplyUnit) => unit.selectedStrategy && !unit.selectedStrategy.skip);

        if (!filtered.length) {
            this.status.log('No units to update supply', LOG_STATUS.SUCCESS);
            return;
        }

        this.status.start(filtered.length);
        this.status.log('Updating supplies...', LOG_STATUS.SUCCESS);

        filtered.forEach((unit: SupplyUnit) => {
            unit.update()
                .then(this.status.progressTick)
                .catch(this.status.progressTick);
        });
    }

    public init = (): void => {
        $('table.unit-list-2014 colgroup').append(`<col style="width: 90px;">`);

        $('table.unit-list-2014 thead tr').toArray().forEach(row => {
            $(row).append(`<th class="${SupplyUnit.COLUMN_CLASS} center"></th>`);
        });

        $(`table.unit-list-2014 thead tr:eq(1) th.${SupplyUnit.COLUMN_CLASS}`).append(`
            <button id="supplies-v2-set-all" class="nns-button">Supply</button>
        `);
        $('#supplies-set-all').on('click', this.updateSupplies);

        const settings = <ISupplyUnitSettings[]>this.getSettings() || {};
        this.supplyUnits = $('table.unit-list-2014 tbody tr')
            .toArray()
            .map((row: HTMLTableRowElement) => {
                const id = Number($(row).find('.unit_id').text()),
                    info: IUnitItem = this.globals.unitsList.filter((item: IUnitItem) => item.id === id)[0];
                return new SupplyUnit(info, $(row), settings[id]);
            });

        document.addEventListener(SupplyUnit.CHANGE_EVENT, () => {
            this.saveSettings(this.supplyUnits
                .filter((unit: SupplyUnit) => unit)
                .reduce((result: Object, unit: SupplyUnit) => {
                    result[unit.data.id] = unit.settings;
                    return result;
                }, {})
            );
        });

    }
}
