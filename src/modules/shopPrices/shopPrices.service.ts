import { IProductInfo } from './models/productInfo.model';

export class ShopPricesService {

    private extractNumericValue = (value: string): number => {
        value = value.replace(/ /g, '').replace(/\$/g, '');
        let result = Number(value);
        if (!result) {
            result = 0;
        }
        return result;
    }

    public getProductInfo = (url: string): Promise<IProductInfo> => {
        const that = this;
        return new Promise(function (resolve) {
            $.get(url, function (content) {
                const infoTable: JQuery<HTMLTableElement> = $(content)
                    .find('#mainContent > table:eq(1) > tbody > tr:eq(0) > td:eq(2) > table');

                if (!infoTable) {
                    return;
                }

                const rows = $(infoTable).find('tbody tr'),
                    result = <IProductInfo>{};

                result.name = $(content).find('table.grid:eq(0) > tbody > tr:eq(0) > td:eq(0) > img').attr('alt');
                result.price = that.extractNumericValue($(rows[1]).find('td:eq(0)').text());
                result.quality = that.extractNumericValue($(rows[2]).find('td:eq(0)').text());
                result.brand = that.extractNumericValue($(rows[3]).find('td:eq(0)').text());
                resolve(result);
            });
        });
    }

    /**
     * Calculate price and return formatted string eg "123.11"
     */
    public calcPrice = (
        purchasePrice: number,
        myQuality: number,
        myBrand: number,
        localPrice: number,
        localQuality: number,
        localBrand: number
    ): string => {
        if (!myQuality) {
            return '0.00';
        }
        const qualityBonus = (Number(String($('.nns-qualityBonus').val()).replace('%', '')) || 100) / 100,
            brandBonus = (Number(String($('.nns-brandBonus').val()).replace('%', '')) || 100) / 100,
            minPriceMultiplier = (Number(String($('.nns-minPrice').val()).replace('%', '')) || 100) / 100,
            mQuality = (myQuality - localQuality) / 10 * qualityBonus,
            mBrand = (myBrand - localBrand) * brandBonus,
            price = (localPrice * (1 + mQuality + mBrand)).toFixed(2),
            minPrice = (purchasePrice * minPriceMultiplier).toFixed(2);

        return Number(price) > Number(minPrice) ? price : minPrice;
    }

    /**
     * Calculate row price"
     */
    public calcRowPrice = (row: JQuery<HTMLTableRowElement>, productInfo: IProductInfo): string => {
        const purchasePrice = Number($(row).find('td:eq(8)').text().replace(/ /g, '').replace(/\$/g, '')),
            myQualityString = $(row).find('td:eq(6)').text(),
            myQuality = Number(myQualityString) || 0,
            myBrandString = $(row).find('td:eq(7)').text(),
            myBrand = Number(myBrandString) || 0;
        return this.calcPrice(purchasePrice, myQuality, myBrand, productInfo.price, productInfo.quality, productInfo.brand);
    }
}
