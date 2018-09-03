import { IPriceStrategy } from './models/priceStrategy.model';
import { PriceStrategies } from './strategies/strategies.component';
import { Globals } from '../../../shared/globals/globals.singletone';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { PricesService } from './prices.service';
import { Storage } from '../../../utils/storage';
import { IPricesProductSettings } from './models/pricesProduct.settings.model';
import { numberify } from '../../../utils';
import { Status } from '../../../shared/status/status.singletone';
import { LOG_STATUS } from '../../../shared/enums/logStatus.enum';

export class Prices {
    protected priceStrategies: IPriceStrategy[] = PriceStrategies;
    protected minPrices: number[] = [0, 1, 1.1, 1.4, 1.6, 2];

    private readonly storageKey: string;

    private service: PricesService;
    private globals: Globals;
    private status: Status;
    private storageSettings: IPricesProductSettings[];

    constructor() {
        this.service = new PricesService();
        this.globals = Globals.getInstance();
        this.status = Status.getInstance();
        this.storageKey = `${this.globals.info.realm}/${this.globals.companyInfo.id}/${this.globals.pageInfo.pageType}/Prices`;
        this.storageSettings = [];
    }

    private getUnitItemByRow = (row: HTMLTableRowElement): IUnitItem => {
        return this.globals.unitsList.filter((u: IUnitItem) => u.id === Number($(row).find('.unit_id').text()))[0];
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
                    this.priceStrategies.map((item: IPriceStrategy) => {
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

    private calculatePrices = (): void => {
        const filteredRows = $('table.unit-list-2014 tbody tr')
            .toArray()
            .filter((row: HTMLTableRowElement) => !$(row).hasClass('nns-hidden'))
            .filter((row: HTMLTableRowElement) => {
                const info = this.getUnitItemByRow(row);
                return info && info.unit_class_kind === 'shop';
            });

        this.status.start(filteredRows.length);
        this.status.log('Updating prices...', LOG_STATUS.SUCCESS);

        filteredRows
            .forEach((row: HTMLTableRowElement) => {
                const info = this.getUnitItemByRow(row),
                    priceStrategyValue = $(row).find('select.price-select').val(),
                    priceStrategy = this.priceStrategies.filter(c => c.label === priceStrategyValue)[0],
                    minPriceMultiplier = Number($(row).find('select.min-price-select').val());
                this.service.updateUnitPrices(info, priceStrategy, minPriceMultiplier)
                    .then(() => this.status.progressTick());
            });
    }

    private updateSettings = (): void => {
        Storage.set(this.storageKey, this.storageSettings, new Date());
    }

    private loadSettings = (): void => {
        const restored = Storage.get(this.storageKey),
            productSettings: IPricesProductSettings[] = restored ? restored.body.data : [];

        this.storageSettings = productSettings;
        productSettings.forEach((productSetting: IPricesProductSettings) => {
            const row = $('table.unit-list-2014 tbody tr')
                .toArray()
                .filter((r: HTMLTableRowElement) => numberify($(r).find('.unit_id').text()) === productSetting.unitId)[0];
            if (row) {
                $(row).find('select.price-select').val(productSetting.priceStrategy);
                $(row).find('select.min-price-select').val(productSetting.minPrice);
            }
        });
    }

    public addColumn = () => {
        $('table.unit-list-2014 colgroup').append(`<col style="width: 90px;">`);

        $('table.unit-list-2014 thead tr').toArray().forEach(row => {
            $(row).append(`<th class="management-separator prices center"></th>`);
        });
        $('table.unit-list-2014 thead tr:eq(1) th.prices').append(`
            <button id="prices-set-all" class="nns-button">Prices</button>
        `);
        $('#prices-set-all').on('click', this.calculatePrices);

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
