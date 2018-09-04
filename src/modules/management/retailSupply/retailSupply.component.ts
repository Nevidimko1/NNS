import { ManagementSubComponent } from '../common/managementSub.component';
import { RetailSupplyService } from './retailSupply.service';
import { RetailSupplyStrategies } from './strategies/supply/retailSupplyStrategies.component';
import { IRetailSupplyStrategy } from './models/retailSupplyStrategy.model';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { IRetailMinSupplyStrategy } from './models/retailMinSupplyStrategy.model';
import { RetailMinSupplyStrategies } from './strategies/min/retailSupplyStrategies.component';
import { Status } from '../../../shared/status/status.singletone';
import { IRetailSupplyUnitSettings } from './models/retailSupply.settings.model';
import { numberify } from '../../../utils';
import { LOG_STATUS } from '../../../shared/enums/logStatus.enum';

export class RetailSupplyComponent extends ManagementSubComponent {
    protected supplyStrategies: IRetailSupplyStrategy[] = RetailSupplyStrategies;
    protected minSupplies: IRetailMinSupplyStrategy[] = RetailMinSupplyStrategies;

    private service: RetailSupplyService;
    private status: Status;
    private storageSettings: IRetailSupplyUnitSettings[];

    constructor() {
        super('RetailSupply');

        this.service = new RetailSupplyService();
        this.status = Status.getInstance();
    }

    private getSelectedSupplyStrategy = (row: HTMLTableRowElement): IRetailSupplyStrategy => {
        const strategy = $(row).find('select.supply-select').val();
        return this.supplyStrategies.filter(c => c.label === strategy)[0];
    }

    private getSelectedMinSupplyStrategy = (row: HTMLTableRowElement): IRetailMinSupplyStrategy => {
        const strategy = $(row).find('select.min-supply-select').val();
        return this.minSupplies.filter(c => c.label === strategy)[0];
    }

    private createSupplyStrategyDropdown = (row: HTMLTableRowElement): string => {
        const unitInfo: IUnitItem = this.globals.unitsList
            .filter((unit: IUnitItem) => unit.id === Number($(row).find('.unit_id').text()))[0];

        if (!unitInfo || unitInfo.unit_class_kind !== 'shop') {
            return '';
        }

        return `
            <select class="supply-select nns-select full-w mb-3">
                ${
                    this.supplyStrategies.map((item: IRetailSupplyStrategy) => {
                        return `<option title="${item.description}">${item.label}</option>`;
                    }).join('')
                }
            </select>
            <select class="min-supply-select nns-select full-w">
                ${
                    this.minSupplies.map((item: IRetailMinSupplyStrategy) => {
                        return `<option title="${item.description}">${item.label}</option>`;
                    }).join('')
                }
            </select>
        `;
    }

    private updateSupplies = (): void => {
        const filteredRows = $('table.unit-list-2014 tbody tr')
            .toArray()
            .filter((row: HTMLTableRowElement) => !$(row).hasClass('nns-hidden'))
            .filter((row: HTMLTableRowElement) => {
                const info = this.getUnitItemByRow(row);
                return info && info.unit_class_kind === 'shop';
            })
            .filter((row: HTMLTableRowElement) => {
                const strategy = this.getSelectedSupplyStrategy(row);
                return strategy && !strategy.skip;
            });

        if (!filteredRows.length) {
            this.status.log('No units to update supply', LOG_STATUS.SUCCESS);
            return;
        }

        this.status.start(filteredRows.length);
        this.status.log('Updating supplies...', LOG_STATUS.SUCCESS);

        filteredRows
            .forEach((row: HTMLTableRowElement) => {
                const info = this.getUnitItemByRow(row),
                    supplyStrategy = this.getSelectedSupplyStrategy(row),
                    minSupply = this.getSelectedMinSupplyStrategy(row);

                this.service.updateUnitSupplies(info, supplyStrategy, minSupply)
                    .then(() => this.status.progressTick());
            });
    }

    private updateSettings = (): void => this.saveSettings(this.storageSettings);

    private loadSettings = (): void => {
        const settings = <IRetailSupplyUnitSettings[]>this.getSettings();
        if (!settings) {
            this.storageSettings = [];
            return;
        }

        this.storageSettings = settings;
        settings.forEach((unitSettings: IRetailSupplyUnitSettings) => {
            const row = $('table.unit-list-2014 tbody tr')
                .toArray()
                .filter((r: HTMLTableRowElement) => numberify($(r).find('.unit_id').text()) === unitSettings.unitId)[0];
            if (row) {
                $(row).find('select.supply-select').val(unitSettings.supplyStrategy);
                $(row).find('select.min-supply-select').val(unitSettings.minSupply);
            }
        });
    }

    public init = () => {
        $('table.unit-list-2014 colgroup').append(`<col style="width: 90px;">`);

        $('table.unit-list-2014 thead tr').toArray().forEach(row => {
            $(row).append(`<th class="supply center"></th>`);
        });

        $('table.unit-list-2014 thead tr:eq(1) th.supply').append(`
            <button id="supplies-set-all" class="nns-button">Supply</button>
        `);
        $('#supplies-set-all').on('click', this.updateSupplies);

        $('table.unit-list-2014 tbody tr')
            .toArray()
            .forEach((row: HTMLTableRowElement) => {
                $(row).append(`
                    <td class="supply">
                        ${this.createSupplyStrategyDropdown(row)}
                    </td>
                `);
        });

        // Supply strategy dropdown change
        $('select.supply-select').on('change', (e) => {
            const row = $(e.target).parents('tr').get(),
                unitId = Number($(row).find('.unit_id').text()),
                existingSettings = this.storageSettings.filter((s: IRetailSupplyUnitSettings) => s.unitId === unitId)[0];

            if (existingSettings) {
                existingSettings.supplyStrategy = $(e.target).val() as string;
            } else {
                this.storageSettings.push({
                    unitId,
                    supplyStrategy: $(e.target).val() as string,
                    minSupply: this.minSupplies[0].label
                });
            }
            this.updateSettings();
        });

        // Min supply dropdown change
        $('select.min-supply-select').on('change', (e) => {
            const row = $(e.target).parents('tr').get(),
                unitId = Number($(row).find('.unit_id').text()),
                existingSettings = this.storageSettings.filter((s: IRetailSupplyUnitSettings) => s.unitId === unitId)[0];

            if (existingSettings) {
                existingSettings.minSupply = $(e.target).val() as string;
            } else {
                this.storageSettings.push({
                    unitId,
                    supplyStrategy: this.supplyStrategies[0].label,
                    minSupply: $(e.target).val() as string
                });
            }
            this.updateSettings();
        });

        this.loadSettings();
    }
}
