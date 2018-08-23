import { IProductInfo } from './models/productInfo.model';

const extractNumericValue = function (value: string): number {
    value = value.replace(/ /g, '').replace(/\$/g, '');
    let result = Number(value);
    if (!result) {
        result = 0;
    }
    return result;
};

export const getProductInfo = (url: string): Promise<IProductInfo> => {
    return new Promise(function (resolve) {
        $.get(url, function (content) {
            const infoTable: JQuery<HTMLTableElement> = $(content).find('#mainContent > table:eq(1) > tbody > tr:eq(0) > td:eq(2) > table');

            if (!infoTable) {
                return;
            }


            const rows = $(infoTable).find('tbody tr'),
                result = <IProductInfo>{};

            result.name = $(content).find('table.grid:eq(0) > tbody > tr:eq(0) > td:eq(0) > img').attr('alt');
            result.price = extractNumericValue($(rows[1]).find('td:eq(0)').text());
            result.quality = extractNumericValue($(rows[2]).find('td:eq(0)').text());
            result.brand = extractNumericValue($(rows[3]).find('td:eq(0)').text());
            resolve(result);
        });
    });
};

/**
 * Calculate price and return formatted string eg "123.11"
 */
export const calcPrice = function (
    purchasePrice: number,
    myQuality: number,
    myBrand: number,
    localPrice: number,
    localQuality: number,
    localBrand: number
): string {
    if (!myQuality) {
        return '0.00';
    }
    const qualityBonus = (Number(String($('.qps_qualityBonus').val()).replace('%', '')) || 100) / 100,
        brandBonus = (Number(String($('.qps_brandBonus').val()).replace('%', '')) || 100) / 100,
        minPriceMultiplier = (Number(String($('.qps_minPrice').val()).replace('%', '')) || 100) / 100,
        mQuality = (myQuality - localQuality) / 10 * qualityBonus,
        mBrand = (myBrand - localBrand) * brandBonus,
        price = (localPrice * (1 + mQuality + mBrand)).toFixed(2),
        minPrice = (purchasePrice * minPriceMultiplier).toFixed(2);

    return Number(price) > Number(minPrice) ? price : minPrice;
};

/**
 * Calculate row price"
 */
export const calcRowPrice = (row: JQuery<HTMLTableRowElement>, productInfo: IProductInfo): string => {
    const purchasePrice = Number($(row).find('td:eq(8)').text().replace(/ /g, '').replace(/\$/g, '')),
        myQualityString = $(row).find('td:eq(6)').text(),
        myQuality = Number(myQualityString) || 0,
        myBrandString = $(row).find('td:eq(7)').text(),
        myBrand = Number(myBrandString) || 0;
    return calcPrice(purchasePrice, myQuality, myBrand, productInfo.price, productInfo.quality, productInfo.brand);
};
