import { Runnable } from '../common/runnable';
import { UNIT_TYPES } from '../../shared/enums/unitTypes.enum';
import { UNIT_PAGES } from '../../shared/enums/unitPages.enum';
import { PAGE_TYPES } from '../../shared/enums/pageTypes.enum';

export class FilterUnits extends Runnable {
    protected readonly pageTypes = [PAGE_TYPES.UNIT_LIST];
    protected readonly unitTypes = [UNIT_TYPES.ANY];
    protected readonly unitPages = [UNIT_PAGES.ANY];

    private filterById: string;
    private filterByCity: string;
    private filterByName: string;
    private filterBySize: string;
    private filterByProducts: string;

    constructor() {
        super();

        this.filterByName = '';
    }

    private filterUnits() {
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

                    let show = (!this.filterById || id.indexOf(this.filterById.toLowerCase()) > -1) &&
                        (!this.filterByCity || city.indexOf(this.filterByCity.toLowerCase()) > -1) &&
                        (!this.filterByName || name.indexOf(this.filterByName.toLowerCase()) > -1) &&
                        (!this.filterBySize || size.indexOf(this.filterBySize.toLowerCase()) > -1) &&
                        (!this.filterByProducts || !!products.filter(p => p.indexOf(this.filterByProducts.toLowerCase()) > -1)[0]);
                    show = show || row.id === 'fake-row';
                    $(row).css('display', show ? 'table-row' : 'none');
                });
        } catch (e) {
            throw new Error('Failed to parse unit list for filtering' + e);
        }
    }

    protected run() {
        $('table.unit-list-2014 thead').after(`
            <thead>
                <tr>
                    <th style="width: 4%">
                        <div class="cell-wrapper">
                            <input id="filter-units-by-id" class="nns-input" type="text">
                        </div>
                    </th>
                    <th style="width: 11%">
                        <div class="cell-wrapper">
                            <input id="filter-units-by-city" class="nns-input" type="text">
                        </div>
                    </th>
                    <th colspan="2" style="width: 40%">
                        <div class="cell-wrapper">
                            <input id="filter-units-by-name" class="nns-input" type="text">
                        </div>
                    </th>
                    <th style="width: 15%">
                        <div class="cell-wrapper">
                            <input id="filter-units-by-size" class="nns-input" type="text">
                        </div>
                    </th>
                    <th style="width: 20%">
                        <div class="cell-wrapper">
                            <input id="filter-units-by-products" class="nns-input" type="text">
                        </div>
                    </th>
                    <th style="width: 5%"></th>
                    <th style="width: 5%">
                        <div class="cell-wrapper">
                            <button id="filters-reset" class="nns-button nns-button-danger">Reset</button>
                        </div>
                    </th>
                </tr>
            </thead>
        `);

        $('#filter-units-by-id').on('input', (event: JQueryInputEventObject) => {
            this.filterById = $(event.target).val() as string;
            this.filterUnits();
        });

        $('#filter-units-by-city').on('input', (event: JQueryInputEventObject) => {
            this.filterByCity = $(event.target).val() as string;
            this.filterUnits();
        });

        $('#filter-units-by-name').on('input', (event: JQueryInputEventObject) => {
            this.filterByName = $(event.target).val() as string;
            this.filterUnits();
        });

        $('#filter-units-by-size').on('input', (event: JQueryInputEventObject) => {
            this.filterBySize = $(event.target).val() as string;
            this.filterUnits();
        });

        $('#filter-units-by-products').on('input', (event: JQueryInputEventObject) => {
            this.filterByProducts = $(event.target).val() as string;
            this.filterUnits();
        });

        $('#filters-reset').on('click', () => {
            this.filterById = '';
            this.filterByCity = '';
            this.filterByName = '';
            this.filterBySize = '';
            this.filterByProducts = '';

            $('#filter-units-by-id').val('');
            $('#filter-units-by-city').val('');
            $('#filter-units-by-name').val('');
            $('#filter-units-by-size').val('');
            $('#filter-units-by-products').val('');

            this.filterUnits();
        });

        // fake row to prevent auto column resizing during filtering process
        $('table.unit-list-2014 tbody').append('<tr id="fake-row"><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
    }

}
