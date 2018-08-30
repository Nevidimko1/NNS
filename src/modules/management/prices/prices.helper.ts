import { Api } from '../../../utils/api';
import { Globals } from '../../../shared/globals/globals.component';
import { IUnitItem, IUnitItemProduct } from '../../../shared/globals/models/unitInfo.model';
import { IShopProduct, IShopProductReport, IShop } from '../../../shared/models/shop.model';
import { numberify } from '../../../utils';
import { ICalculateChoice } from './models/calculateChoice.model';
import { Status } from '../../../shared/status/status.singletone';

export class PricesHelper {

    private static populateProductsHistories = (shopInfo: IShop): Promise<IShop> => {
        const realm = Globals.getInstance().info.realm;
        const promises = shopInfo.products
            .map((product: IShopProduct) => {
                const url = `https://virtonomica.ru/${realm}/window/unit/view/${shopInfo.id}/product_history/${product.id}/`;
                return Api.get(url);
            });

        return Promise.all(promises)
            .then((result: string[]) => {
                result.forEach((html: string, i: number) => {
                    const $html: JQuery = $(html);
                    shopInfo.products[i].history = $html.find('table.list tr')
                        .toArray()
                        .slice(1)
                        .map((row: HTMLTableRowElement) => ({
                            quantity: numberify($(row).find('td:eq(1)').text()),
                            quality: numberify($(row).find('td:eq(2)').text()),
                            price: numberify($(row).find('td:eq(3)').text()),
                            brand: numberify($(row).find('td:eq(4)').text())
                        }));
                });
                return shopInfo;
            });
    }

    private static populateProductReport = (url: string): Promise<IShopProductReport> => {
        return Api.get(url)
            .then((html: string) => {
                const infoTable = $(html).find('#mainContent > table:eq(1) > tbody > tr:eq(0) > td:eq(2) > table');

                if (!infoTable) {
                    return;
                }

                const rows = $(infoTable).find('tbody tr');
                return {
                    localPrice: numberify($(rows[1]).find('td:eq(0)').text()),
                    localQuality: numberify($(rows[2]).find('td:eq(0)').text()),
                    localBrand: numberify($(rows[3]).find('td:eq(0)').text()),
                };
            });
    }

    public static getShopInfo = (unit: IUnitItem): Promise<IShop> => {
        return Api.get(`https://virtonomica.ru/${Globals.getInstance().info.realm}/main/unit/view/${unit.id}/trading_hall`)
            .then((html: string) => {
                const $html: JQuery = $(html);

                const stocks = $html.find('.nowrap:nth-child(6)').toArray()
                    .map((e: HTMLElement) => numberify($(e).text())) as number[],
                    delivered = $html.find('.nowrap:nth-child(5)').toArray()
                        .map((e: HTMLElement) => numberify($(e).text().split('[')[1])) as number[],
                    qualities = $html.find('td:nth-child(7)').toArray()
                        .map((e: HTMLElement) => numberify($(e).text())) as number[],
                    purches = $html.find('td:nth-child(9)').toArray()
                        .map((e: HTMLElement) => numberify($(e).text())) as number[],
                    prices = $html.find(':text').toArray()
                        .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                    shares = $html.find('.nowrap:nth-child(11)').toArray()
                        .map((e: HTMLElement) => numberify($(e).text())) as number[],
                    cityPrices = $html.find('td:nth-child(12)').toArray()
                        .map((e: HTMLElement) => numberify($(e).text())) as number[],
                    cityQualities = $html.find('td:nth-child(13)').toArray()
                        .map((e: HTMLElement) => numberify($(e).text())) as number[],
                    updateFieldNames = $html.find(':text').toArray()
                        .map((e: HTMLElement) => $(e).attr('name')) as string[],
                    reportsUrls = $html.find('.grid a:has(img):not(:has(img[alt]))').toArray()
                        .map((e: HTMLElement) => $(e).attr('href')) as string[],
                    imgSrcs = $html.find('.grid a:has(img):not(:has(img[alt]))').toArray()
                        .map((e: HTMLElement) => $(e).find('img').attr('src')) as string[],
                    produstIds = $html.find('a.popup').toArray()
                        .map((e: HTMLElement) => numberify($(e).attr('href').split('/')[9])) as number[],
                    products = produstIds.map((id: number, i) => ({
                        ...unit.products.filter((p: IUnitItemProduct) => p.id === id)[0],
                        price: prices[i],
                        quality: qualities[i],
                        purch: purches[i],
                        cityPrice: cityPrices[i],
                        cityQuality: cityQualities[i],
                        localPrice: 0,
                        localQuality: 0,
                        deliver: delivered[i],
                        stock: stocks[i],
                        share: shares[i],
                        imageSrc: imgSrcs[i],
                        history: [],
                        report: null,
                        updateFieldName: updateFieldNames[i]
                    }));

                // populate reports
                const promises = reportsUrls.map((url: string) => PricesHelper.populateProductReport(url));

                return Promise.all(promises)
                    .then((reports: IShopProductReport[]) => {
                        // add reports
                        reports.forEach((report: IShopProductReport, i: number) => products[i].report = report);
                    })
                    .then(() => {
                        return {
                            id: unit.id,
                            name: unit.name,
                            products
                        };
                    });
            })
            .then((shopInfo: IShop) => PricesHelper.populateProductsHistories(shopInfo));
    }

    public static updateUnitPrices = (unitInfo: IUnitItem, priceChoice: ICalculateChoice, minPriceMultiplier: number): Promise<any> => {
        const status = Status.getInstance();
        let priceChangeLog = '<table style="margin-left: 15px;"><tbody>';

        return PricesHelper.getShopInfo(unitInfo)
            .then((shopInfo: IShop) => {
                console.log(`Setting prices for ${unitInfo.name}`);
                const newPrices = shopInfo.products
                    .map((product: IShopProduct) => {
                        const prime = Math.round(product.purch * minPriceMultiplier);
                        return Math.max(priceChoice.calculate(product), prime);
                    });
                let data = 'action=setprice',
                    change = false;
                shopInfo.products.forEach((product: IShopProduct, i: number) => {
                    if (product.price !== newPrices[i]) {
                        data += '&' + encodeURI(product.updateFieldName + '=' + newPrices[i]);
                        change = true;

                        // log
                        const inc = product.history[0].price < newPrices[i];
                        priceChangeLog += `
                            <tr>
                                <td style="position: relative; width: 16px;">
                                    <span class="log-prod-img" style="background-image: url(${product.imageSrc});"
                                        title="${product.name}"></span>
                                </td>
                                <td>${product.name}</td>
                                <td><span class="${inc ? 'high' : 'low'}"></span></td>
                                <td class="${inc ? 'nns-text-success' : 'nns-text-danger'}">${newPrices[i]}</td>
                                <td>(${product.history[0].price})</td>
                            </tr>
                        `;
                    }
                });
                priceChangeLog += '</tbody></table>';

                const url = `https://virtonomica.ru/${Globals.getInstance().info.realm}/main/unit/view/${unitInfo.id}/trading_hall`,
                    unitLink = `<a target="_blank" href="${url}">${unitInfo.name} (${unitInfo.id})</a>`;

                if (change) {
                    return Api.post(url, data)
                        .then(() => {
                            const log = `Prices have been updated for ${unitLink}<br>` + priceChangeLog;
                            status.log(log);
                            return Promise.resolve();
                        });
                } else {
                    status.log(`No price changes needed for ${unitLink}`);
                    return Promise.resolve();
                }
            });
    }
}
