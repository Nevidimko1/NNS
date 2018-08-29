import { ICalculateChoice } from './models/calculateChoice.model';
import { AllCalculateChoices } from './calcuateChoices/calculateChoices.component';
import { Globals } from '../../../shared/globals/globals.component';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { PricesHelper } from './prices.helper';

export class Prices {

    protected calculateChoices: ICalculateChoice[] = AllCalculateChoices;
    protected minChoices: number[] = [0, 1, 1.1, 1.4, 2];

    constructor() {

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
                    this.minChoices.map((choice: number) => {
                        return `<option title="minPrice = purchasePrice * ${choice}">${choice}</option>`;
                    }).join('')
                }
            </select>
        `;
    }

    private calculatePrices = (): void => {
        const filteredRows = $('table.unit-list-2014 tbody tr')
            .toArray()
            .filter((row: HTMLTableRowElement) => !$(row).hasClass('hidden'))
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

    }
}
