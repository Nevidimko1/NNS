import { ICalculateChoice } from './models/calculateChoice.model';
import { AllCalculateChoices } from './calcuateChoices/calculateChoices.component';
import { Globals } from '../../../shared/globals/globals.component';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';

export class Prices {

    protected calculateChoices: ICalculateChoice[] = AllCalculateChoices;
    constructor() {

    }

    private createCalculateChoiceDropdown = (row: HTMLTableRowElement): string => {
        const shop = Globals.getInstance().unitsList
            .filter((unit: IUnitItem) => unit.id === Number($(row).find('.unit_id').text()) && unit.unit_class_kind === 'shop')[0];

        if (!shop) {
            return '';
        }

        return `
            <select class="nns-select">
                ${
                    this.calculateChoices.map((choice: ICalculateChoice) => {
                        return `<option title="${choice.description}">${choice.label}</option>`;
                    }).join('')
                }
            </select>
        `;
    }

    public addColumn = () => {
        $('table.unit-list-2014 colgroup').append(`<col style="width: 140px;">`);

        $('table.unit-list-2014 thead tr').toArray().forEach(row => {
            $(row).append(`<th class="management-separator prices center"></th>`);
        });
        $('table.unit-list-2014 thead tr:eq(1) th.prices').append(`
            <button id="prices-set-all" class="nns-button">Prices</button>
        `);

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
