import { Runnable } from '../common/runnable';
import { UNIT_TYPES } from '../../shared/enums/unitTypes.enum';
import { UNIT_PAGES } from '../../shared/enums/unitPages.enum';
import { PAGE_TYPES } from '../../shared/enums/pageTypes.enum';
import { Globals } from '../../shared/globals/globals.component';
import { Storage } from '../../utils/storage';
import { IFilterUnitsModel } from './models/filterUnit.model';

export class FilterUnits extends Runnable {
    protected readonly pageTypes = [PAGE_TYPES.UNIT_LIST];
    protected readonly unitTypes = [UNIT_TYPES.ANY];
    protected readonly unitPages = [UNIT_PAGES.ANY];

    private readonly storageKey: string;

    protected data: IFilterUnitsModel;

    constructor() {
        super();

        this.storageKey = `${Globals.getInstance().info.realm}/${Globals.getInstance().companyInfo.id}/${PAGE_TYPES.UNIT_LIST}/FilterUnits`;
        this.data = {
            filters: {
                filterById: '',
                filterByCity: '',
                filterByName: '',
                filterBySize: '',
                filterByProducts: ''
            }
        };
    }

    private filterUnits(): void {
        try {
            $('table.unit-list-2014 > tbody > tr')
                .toArray()
                .forEach(row => {
                    const id = (String($(row).find('td.unit_id').text()) || '').toLowerCase().trim();
                    const city = (String($(row).find('td.geo').text()) || '').toLowerCase().trim();
                    const name = (String($(row).find('td.info > a').text()) || '').toLowerCase().trim();
                    const size = (String($(row).find('td:eq(4)').text()) || '').toLowerCase().trim();
                    const products = $(row).find('td.spec > img')
                        .toArray()
                        .map((a: any) => a.title.toLowerCase().trim()) as Array<string>;

                    const show = (!this.data.filters.filterById || id.indexOf(this.data.filters.filterById.toLowerCase()) > -1) &&
                        (!this.data.filters.filterByCity || city.indexOf(this.data.filters.filterByCity.toLowerCase()) > -1) &&
                        (!this.data.filters.filterByName || name.indexOf(this.data.filters.filterByName.toLowerCase()) > -1) &&
                        (!this.data.filters.filterBySize || size.indexOf(this.data.filters.filterBySize.toLowerCase()) > -1) &&
                        (!this.data.filters.filterByProducts ||
                            !!products.filter(p => this.data.filters.filterByProducts.toLowerCase()
                                .split(',')
                                .filter(f => p.indexOf(f) > -1)[0]
                            )[0]);
                    if (show) {
                        $(row).removeClass('nns-hidden');
                    } else {
                        $(row).addClass('nns-hidden');
                    }
                });
        } catch (e) {
            throw new Error('Failed to parse unit list for filtering' + e);
        }
    }

    private saveAndFilterUnits(): void {
        Storage.set(this.storageKey, this.data, new Date());
        this.filterUnits();
    }

    private restoreFilterUnits(): void {
        const restored = Storage.get(this.storageKey);
        if (restored) {
            this.data = restored.data;

            $('#filter-units-by-id').val(this.data.filters.filterById);
            $('#filter-units-by-city').val(this.data.filters.filterByCity);
            $('#filter-units-by-name').val(this.data.filters.filterByName);
            $('#filter-units-by-size').val(this.data.filters.filterBySize);
            $('#filter-units-by-products').val(this.data.filters.filterByProducts);

            this.filterUnits();
        }
    }

    protected run(): void {
        // add class to the body to have full-width page content
        $('body').addClass('unit_list');

        // add colgroup element to the table
        $('table.unit-list-2014 thead').before(`
            <colgroup>
                <col style="width: 60px">
                <col style="width: 140px">
                <col style="width: 60%">
                <col style="width: 50px">
                <col style="width: 80px">
                <col style="width: 40%">
                <col style="width: 60px">
                <col style="width: 60px">
            </colgroup>
        `);

        $('table.unit-list-2014 thead tr').after(`
            <tr>
                <th>
                    <div class="cell-wrapper">
                        <input id="filter-units-by-id" class="nns-input full-w" type="text">
                    </div>
                </th>
                <th>
                    <div class="cell-wrapper">
                        <input id="filter-units-by-city" class="nns-input full-w" type="text">
                    </div>
                </th>
                <th colspan="2">
                    <div class="cell-wrapper">
                        <input id="filter-units-by-name" class="nns-input full-w" type="text">
                    </div>
                </th>
                <th>
                    <div class="cell-wrapper">
                        <input id="filter-units-by-size" class="nns-input full-w" type="text">
                    </div>
                </th>
                <th>
                    <div class="cell-wrapper">
                        <input id="filter-units-by-products" class="nns-input full-w" type="text">
                        <div class="help" style="position: absolute; right: 1px; top: 2px;"
                            title="Comma separated list (e.g. tools,diesel,clothes)">?</div>
                    </div>
                </th>
                <th>
                    <div class="cell-wrapper">
                        <button id="filters-reset" class="nns-button nns-button-danger" title="Reset filters">Clear</button>
                    </div>
                </th>
                <th></th>
            </tr>
        `);

        $('#filter-units-by-id').on('input', (event: JQueryInputEventObject) => {
            this.data.filters.filterById = $(event.target).val() as string;
            this.saveAndFilterUnits();
        });

        $('#filter-units-by-city').on('input', (event: JQueryInputEventObject) => {
            this.data.filters.filterByCity = $(event.target).val() as string;
            this.saveAndFilterUnits();
        });

        $('#filter-units-by-name').on('input', (event: JQueryInputEventObject) => {
            this.data.filters.filterByName = $(event.target).val() as string;
            this.saveAndFilterUnits();
        });

        $('#filter-units-by-size').on('input', (event: JQueryInputEventObject) => {
            this.data.filters.filterBySize = $(event.target).val() as string;
            this.saveAndFilterUnits();
        });

        $('#filter-units-by-products').on('input', (event: JQueryInputEventObject) => {
            this.data.filters.filterByProducts = $(event.target).val() as string;
            this.saveAndFilterUnits();
        });

        $('#filters-reset').on('click', () => {
            this.data.filters.filterById = '';
            this.data.filters.filterByCity = '';
            this.data.filters.filterByName = '';
            this.data.filters.filterBySize = '';
            this.data.filters.filterByProducts = '';

            $('#filter-units-by-id').val('');
            $('#filter-units-by-city').val('');
            $('#filter-units-by-name').val('');
            $('#filter-units-by-size').val('');
            $('#filter-units-by-products').val('');

            this.saveAndFilterUnits();
        });

        // restore filters from localStorage
        this.restoreFilterUnits();
    }

}
