import { IUnitItem } from '../../../../shared/globals/models/unitInfo.model';
import { ISupplyUnitSettings } from './supplyUnit.settings.model';
import { SupplyService } from '../common/supply.service';
import { RetailSupplyService } from '../retailSupply/retailSupply.service';
import { ISupplyStrategy } from './supplyStrategy.model';
import { IMinSupplyStrategy } from './minSupplyStrategy.model';
import { WarehouseSupplyService } from '../warehouseSupply/warehouseSupply.service';
import { IMaxSupplyStrategy } from './maxSupplyStrategy.model';

export class SupplyUnit {
    static readonly CHANGE_EVENT = 'SupplyUnit.changeEvent';
    static readonly COLUMN_CLASS = 'nns-supply';

    public readonly data: IUnitItem;
    public readonly row: JQuery<HTMLTableRowElement>;
    public readonly settings: ISupplyUnitSettings;

    private readonly services = {
        shop: RetailSupplyService,
        warehouse: WarehouseSupplyService
    };

    private service: SupplyService;

    constructor(unit: IUnitItem, row: JQuery<HTMLTableRowElement>, settings: ISupplyUnitSettings) {
        this.data = unit;
        this.row = row;

        const srv = this.services[this.data.unit_type_symbol];
        if (!srv) {
            this.drawEmpty();
            return;
        }

        this.service = new srv();

        this.settings = settings || {
            id: this.data.id,
            strategy: this.service.strategies[0] ? this.service.strategies[0].label : null,
            min: this.service.min[0] ? this.service.min[0].label : null,
            max: this.service.max[0] ? this.service.max[0].label : null
        };

        this.draw();
    }

    private drawEmpty = () => this.row.append('<td></td>');

    private draw = () => {
        this.row.append(`
            <td class="${SupplyUnit.COLUMN_CLASS}">
                <select class="strategy-select nns-select full-w mb-3">
                    ${
                        this.service.strategies.map((item: ISupplyStrategy) => {
                            return `<option title="${item.description}">${item.label}</option>`;
                        }).join('')
                    }
                </select>
                <select class="min-select nns-select full-w mb-3">
                    ${
                        this.service.min.map((item: IMinSupplyStrategy) => {
                            return `<option title="${item.description}">${item.label}</option>`;
                        }).join('')
                    }
                </select>
                <select class="max-select nns-select full-w">
                    ${
                        this.service.max.map((item: IMinSupplyStrategy) => {
                            return `<option title="${item.description}">${item.label}</option>`;
                        }).join('')
                    }
                </select>
            </td>`
        );

        // Strategy dropdown change
        this.row.find('.strategy-select').on('change', (e) => {
            this.settings.strategy = $(e.target).val() as string;
            document.dispatchEvent(new Event(SupplyUnit.CHANGE_EVENT));
        });

        // Min dropdown change
        this.row.find('.min-select').on('change', (e) => {
            this.settings.min = $(e.target).val() as string;
            document.dispatchEvent(new Event(SupplyUnit.CHANGE_EVENT));
        });

        // Max dropdown change
        this.row.find('.max-select').on('change', (e) => {
            this.settings.max = $(e.target).val() as string;
            document.dispatchEvent(new Event(SupplyUnit.CHANGE_EVENT));
        });

        this.row.find('select.strategy-select').val(this.settings.strategy);
        this.row.find('select.min-select').val(this.settings.min);
        this.row.find('select.max-select').val(this.settings.max);
    }

    public update = () => this.service.update(this);

    public get type(): string {
        return this.data.unit_class_kind;
    }
    public get selectedStrategy(): ISupplyStrategy {
        return this.service ? this.service.strategies.filter((s: ISupplyStrategy) => s.label === this.settings.strategy)[0] : null;
    }
    public get selectedMin(): IMinSupplyStrategy {
        return this.service ? this.service.min.filter((s: IMinSupplyStrategy) => s.label === this.settings.min)[0] : null;
    }
    public get selectedMax(): IMaxSupplyStrategy {
        return this.service ? this.service.max.filter((s: IMaxSupplyStrategy) => s.label === this.settings.max)[0] : null;
    }

}
