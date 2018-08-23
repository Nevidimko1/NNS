import { IProductInfo } from './models/productInfo.model';
import { Runnable } from '../common/runnable';
import { UNIT_TYPES } from '../../shared/enums/unitTypes.enum';
import { UNIT_PAGES } from '../../shared/enums/unitPages.enum';
import { calcRowPrice, getProductInfo } from './prices.helper';

export class Prices extends Runnable {
    protected readonly unitTypes = [UNIT_TYPES.SHOP, UNIT_TYPES.FUEL];
    protected readonly unitPages = [UNIT_PAGES.TRADING_HALL];

    protected readonly QUALITY_BONUS = '50%';
    protected readonly BRAND_BONUS = '20%';
    protected readonly MIN_PRICE_MULTIPLIER = '200%';

    private productsInfo: IProductInfo[];

    constructor() {
        super();
    }

    protected run() {
        const tableRows = $('form[name=tradingHallForm] table:eq(0) tbody tr') as any,
            nonBodyRows = $('form[name=tradingHallForm] table:eq(0) tbody tr:not([class="odd"]):not([class="even"])'),
            rows = tableRows.splice(nonBodyRows.length, tableRows.length);

        // добавляем кнопки
        $('table.grid:eq(0)').before(`
            <div id="qps_groupConfig">
                <div class="qps_label">Quick Price config</div>
                <div class="qps_controls">
                    <div class="qps_config_group">
                        <div class="qps_label">Бонус кач:</div>
                        <input class="qps_qualityBonus qps_input" title="Бонус за каждые 10 единиц качества" type="text"
                            value="${this.QUALITY_BONUS}">
                    </div>
                    <div class="qps_config_group">
                        <div class="qps_label">Бонус бренд:</div>
                        <input class="qps_brandBonus qps_input" title="Бонус за каждую единицу бренда" type="text"
                            value="${this.BRAND_BONUS}">
                    </div>
                    <div class="qps_config_group">
                        <div class="qps_label">Мин. цена:</div>
                        <input class="qps_minPrice qps_input" title="Минимальная цена от закупочной" type="text"
                            value="${this.MIN_PRICE_MULTIPLIER}">
                    </div>
                    <input class="qps_groupCalc qps_button" type="button" title="Посчитать цены" value="Calculate">
                    <input class="qps_groupCopy qps_button" type="button" title="Скопировать цены" value="Copy">
                </div>
            </div>
        `);

        const buttonsGroup = $('#qps_groupConfig'),
            that = this;
        let td: JQuery<HTMLElement>;

        // Посчитать группу логика
        buttonsGroup.find('.qps_groupCalc').click(function() {
            if (!that.productsInfo) {
                return;
            }

            rows.forEach(function(row: JQuery<HTMLTableRowElement>, i: number) {
                $(row).find('.qps_itemPrice').val(calcRowPrice(row, that.productsInfo[i]));
            });
        });

        // Скопировать группу логика
        buttonsGroup.find('.qps_groupCopy').click(function() {
            rows.forEach(function(row: JQuery<HTMLTableRowElement>) {
                td = $(row).find('td:eq(9)');
                if ($(td).find('.qps_itemAllowPriceChange').attr('checked')) {
                    $(td).find('input:eq(0)').val($(td).find('.qps_itemPrice').val());
                }
            });
        });

        rows.forEach(function(row: JQuery<HTMLTableRowElement>, i: number) {
            td = $(row).find('td:eq(9)');
            $(td).append(`
                <input class="qps_itemAllowPriceChange" title="Разрешить автоматическое изменение цены предмета" type="checkbox"
                    checked="checked">
                <div class="qps_cont">
                    <input class="qps_itemPrice qps_input" size=8 title="Цена" type="text" value="0.00">
                    <input class='qps_itemCalc qps_button' type='button' title="Вычислить цену товара" value='Calc'>
                    <input class='qps_itemCopy qps_button' type='button' title="Скопировать цену товара" value='Copy'>
                </div>
            `);

            // Посчитать продукт логика
            $(td).find('.qps_itemCalc').click(function() {
                if (!that.productsInfo) {
                    return;
                }

                $(rows[i]).find('.qps_itemPrice').val(calcRowPrice(row, that.productsInfo[i]));
            });

            // Скопировать продукт логика
            $(td).find('.qps_itemCopy').click(function() {
                td = $(row).find('td:eq(9)');
                $(td).find('input:eq(0)').val($(td).find('.qps_itemPrice').val());
            });
        });

        // получаем информацию местных поставщиков о продуктах
        const promises: Promise<IProductInfo>[] = rows.map(function(row) {
            return getProductInfo($(row).find('td:eq(2) a').attr('href'));
        });

        $('table.grid:eq(0) > tbody > tr:eq(0) > th:last-child').append('<div class="localInfoColor">Местные поставщики</div>');
        Promise.all(promises)
            .then((values: IProductInfo[]) => {
                that.productsInfo = values;
                values.forEach(function(value, i) {
                    const index = i + nonBodyRows.length,
                        row = $('table.grid:eq(0) > tbody > tr:eq(' + index + ')');
                    $(row).find('td:nth-last-child(3)').append('<div class="localInfoColor">$' +
                        value.price.toLocaleString(undefined, { minimumFractionDigits: 2 }).replace(/,/g, ' ') + '<div>');
                    $(row).find('td:nth-last-child(2)').append('<div class="localInfoColor">' + value.quality.toFixed(2) + '</div>');
                    $(row).find('td:nth-last-child(1)').append('<div class="localInfoColor">' + value.brand.toFixed(2) + '</div>');
                });
            });
    }

}
