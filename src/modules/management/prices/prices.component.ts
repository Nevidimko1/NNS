import { ICalculateChoice } from './models/calculateChoice.model';
import { AllCalculateChoices } from './calcuateChoices/calculateChoices.component';
import { Globals } from '../../../shared/globals/globals.component';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { PricesHelper } from './prices.helper';
import { PAGE_TYPES } from '../../../shared/enums/pageTypes.enum';
import { Storage } from '../../../utils/storage';
import { IStorageProductSetting } from './models/storageProductSetting.model';
import { numberify } from '../../../utils';

export class Prices {
    private storageKey: string;
    private storageSettings: IStorageProductSetting[];

    protected calculateChoices: ICalculateChoice[] = AllCalculateChoices;
    protected minPriceChoices: number[] = [0, 1, 1.1, 1.4, 1.6, 2];

    constructor() {
        this.storageKey = `${Globals.getInstance().info.realm}/${Globals.getInstance().companyInfo.id}/${PAGE_TYPES.UNIT_LIST}/Prices`;
        this.storageSettings = [];
    }

    private getUnitItemByRow = (row: HTMLTableRowElement): IUnitItem => {
        return Globals.getInstance().unitsList.filter((u: IUnitItem) => u.id === Number($(row).find('.unit_id').text()))[0];
    }

    private createCalculateChoiceDropdown = (row: HTMLTableRowElement): string => {
        const unitInfo: IUnitItem = Globals.getInstance().unitsList
            .filter((unit: IUnitItem) => unit.id === Number($(row).find('.unit_id').text()))[0];

        if (!unitInfo || unitInfo.unit_class_kind !== 'shop') {
            return '';
        }

        return `
            <select class="price-select nns-select full-w mb-3">
                ${
                    this.calculateChoices.map((choice: ICalculateChoice) => {
                        return `<option title="${choice.description}">${choice.label}</option>`;
                    }).join('')
                }
            </select>
            <select class="min-price-select nns-select full-w">
                ${
                    this.minPriceChoices.map((choice: number) => {
                        return `<option title="minPrice = purchasePrice * ${choice}">${choice}</option>`;
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

        filteredRows
            .forEach((row: HTMLTableRowElement) => {
                const info = this.getUnitItemByRow(row),
                    priceChoiceValue = $(row).find('select.price-select').val(),
                    priceChoice = this.calculateChoices.filter(c => c.label === priceChoiceValue)[0],
                    minPriceMultiplier = Number($(row).find('select.min-price-select').val());
                PricesHelper.updateUnitPrices(info, priceChoice, minPriceMultiplier);
            });
    }

    private updateSettings = (): void => {
        Storage.set(this.storageKey, this.storageSettings, new Date());
    }

    private loadSettings = (): void => {
        const restored = Storage.get(this.storageKey),
            productSettings: IStorageProductSetting[] = restored ? restored.data : [];

        this.storageSettings = productSettings;
        productSettings.forEach((productSetting: IStorageProductSetting) => {
            const row = $('table.unit-list-2014 tbody tr')
                .toArray()
                .filter((r: HTMLTableRowElement) => numberify($(r).find('.unit_id').text()) === productSetting.unitId)[0];
            if (row) {
                $(row).find('select.price-select').val(productSetting.priceChoice);
                $(row).find('select.min-price-select').val(productSetting.minPriceChoice);
            }
        });
    }

    public addColumn = () => {
        $('table.unit-list-2014 colgroup').append(`<col style="width: 100px;">`);

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
                        ${this.createCalculateChoiceDropdown(row)}
                    </td>
                `);
        });

        // Price dropdown change
        $('select.price-select').on('change', (e) => {
            const row = $(e.target).parents('tr').get(),
                unitId = Number($(row).find('.unit_id').text()),
                existingSettings = this.storageSettings.filter((s: IStorageProductSetting) => s.unitId === unitId)[0];

            if (existingSettings) {
                existingSettings.priceChoice = $(e.target).val() as string;
            } else {
                this.storageSettings.push({
                    unitId,
                    priceChoice: $(e.target).val() as string,
                    minPriceChoice: String(this.minPriceChoices[0])
                });
            }
            this.updateSettings();
        });

        // Min price dropdown change
        $('select.min-price-select').on('change', (e) => {
            const row = $(e.target).parents('tr').get(),
                unitId = Number($(row).find('.unit_id').text()),
                existingSettings = this.storageSettings.filter((s: IStorageProductSetting) => s.unitId === unitId)[0];

            if (existingSettings) {
                existingSettings.minPriceChoice = $(e.target).val() as string;
            } else {
                this.storageSettings.push({
                    unitId,
                    priceChoice: this.calculateChoices[0].label,
                    minPriceChoice: $(e.target).val() as string
                });
            }
            this.updateSettings();
        });

        this.loadSettings();

    }
}
