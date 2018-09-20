import { IRetailPriceStrategy } from './models/priceStrategy.model';
import { RetailPriceStrategies } from './strategies/retailPriceStrategies.component';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { RetailPricesService } from './retailPrices.service';
import { IPricesProductSettings } from './models/pricesProduct.settings.model';
import { numberify } from '../../../utils';
import { Status } from '../../../shared/status/status.singletone';
import { LOG_STATUS } from '../../../shared/enums/logStatus.enum';
import { ManagementSubComponent } from '../common/managementSub.component';

export class RetailPricesComponent extends ManagementSubComponent {
    protected priceStrategies: IRetailPriceStrategy[] = RetailPriceStrategies;
    protected minPrices: number[] = [0, 1, 1.1, 1.4, 1.6, 2];

    private service: RetailPricesService;
    private status: Status;
    private storageSettings: IPricesProductSettings[];

    constructor() {
        super('RetailPrices');

        this.service = new RetailPricesService();
        this.status = Status.getInstance();
        this.storageSettings = [];
    }

    private getSelectedStrategy = (row: HTMLTableRowElement): IRetailPriceStrategy => {
        const priceStrategyValue = $(row).find('select.price-select').val();
        return this.priceStrategies.filter(c => c.label === priceStrategyValue)[0];
    }

    private createPriceStrategyDropdown = (row: HTMLTableRowElement): string => {
        const unitInfo: IUnitItem = this.globals.unitsList
            .filter((unit: IUnitItem) => unit.id === Number($(row).find('.unit_id').text()))[0];

        if (!unitInfo || unitInfo.unit_class_kind !== 'shop') {
            return '';
        }

        return `
            <select class="price-select nns-select full-w mb-3">
                ${
                    this.priceStrategies.map((item: IRetailPriceStrategy) => {
                        return `<option title="${item.description}">${item.label}</option>`;
                    }).join('')
                }
            </select>
            <select class="min-price-select nns-select full-w">
                ${
                    this.minPrices.map((item: number) => {
                        return `<option title="minPrice = purchasePrice * ${item}">${item}</option>`;
                    }).join('')
                }
            </select>
        `;
    }

    private updatePrices = (): void => {
        const filteredRows = $('table.unit-list-2014 tbody tr')
            .toArray()
            .filter((row: HTMLTableRowElement) => !$(row).hasClass('nns-hidden'))
            .filter((row: HTMLTableRowElement) => {
                const info = this.getUnitItemByRow(row);
                return info && info.unit_class_kind === 'shop';
            })
            .filter((row: HTMLTableRowElement) => {
                const strategy = this.getSelectedStrategy(row);
                return strategy && !strategy.skip;
            });

        if (!filteredRows.length) {
            this.status.reset();
            this.status.log('No units to update price', LOG_STATUS.SUCCESS);
            return;
        }

        this.status.start(filteredRows.length);
        this.status.log('Updating prices...', LOG_STATUS.SUCCESS);

        this.globals.fetchUnitsList()
            .then(() => {
                filteredRows
                    .forEach((row: HTMLTableRowElement) => {
                        const info = this.getUnitItemByRow(row),
                            priceStrategy = this.getSelectedStrategy(row),
                            minPriceMultiplier = Number($(row).find('select.min-price-select').val());

                        this.service.updateUnitPrices(info, priceStrategy, minPriceMultiplier)
                            .then(this.status.progressTick)
                            .catch((e) => {
                                console.error(e);
                                this.status.progressTick();
                            });
                    });
            });
    }

    private updateSettings = (): void => this.saveSettings(this.storageSettings);

    private loadSettings = (): void => {
        const settings = <IPricesProductSettings[]>this.getSettings();
        if (!settings) {
            this.storageSettings = [];
            return;
        }

        this.storageSettings = settings;
        settings.forEach((productSetting: IPricesProductSettings) => {
            const row = $('table.unit-list-2014 tbody tr')
                .toArray()
                .filter((r: HTMLTableRowElement) => numberify($(r).find('.unit_id').text()) === productSetting.unitId)[0];
            if (row) {
                $(row).find('select.price-select').val(productSetting.priceStrategy);
                $(row).find('select.min-price-select').val(productSetting.minPrice);
            }
        });
    }

    public init = () => {
        $('table.unit-list-2014 colgroup').append(`<col style="width: 90px;">`);

        $('table.unit-list-2014 thead tr').toArray().forEach(row => {
            $(row).append(`<th class="management-separator prices center"></th>`);
        });
        $('table.unit-list-2014 thead tr:eq(1) th.prices').append(`
            <button id="prices-set-all" class="nns-button">Prices</button>
        `);
        $('#prices-set-all').on('click', this.updatePrices);

        $('table.unit-list-2014 tbody tr')
            .toArray()
            .forEach((row: HTMLTableRowElement) => {
                $(row).append(`
                    <td class="management-separator prices">
                        ${this.createPriceStrategyDropdown(row)}
                    </td>
                `);
        });

        // Price dropdown change
        $('select.price-select').on('change', (e) => {
            const row = $(e.target).parents('tr').get(),
                unitId = Number($(row).find('.unit_id').text()),
                existingSettings = this.storageSettings.filter((s: IPricesProductSettings) => s.unitId === unitId)[0];

            if (existingSettings) {
                existingSettings.priceStrategy = $(e.target).val() as string;
            } else {
                this.storageSettings.push({
                    unitId,
                    priceStrategy: $(e.target).val() as string,
                    minPrice: String(this.minPrices[0])
                });
            }
            this.updateSettings();
        });

        // Min price dropdown change
        $('select.min-price-select').on('change', (e) => {
            const row = $(e.target).parents('tr').get(),
                unitId = Number($(row).find('.unit_id').text()),
                existingSettings = this.storageSettings.filter((s: IPricesProductSettings) => s.unitId === unitId)[0];

            if (existingSettings) {
                existingSettings.minPrice = $(e.target).val() as string;
            } else {
                this.storageSettings.push({
                    unitId,
                    priceStrategy: this.priceStrategies[0].label,
                    minPrice: $(e.target).val() as string
                });
            }
            this.updateSettings();
        });

        this.loadSettings();

    }
}
