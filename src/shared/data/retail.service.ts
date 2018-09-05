import { DataService } from './common/data.service';
import { IShop, IShopProduct, IShopProductReport } from '../models/shop.model';
import { Api } from '../../utils/api';
import { numberify } from '../../utils';
import { IUnitItem, IUnitItemProduct } from '../globals/models/unitInfo.model';
import { LS } from '../../utils/storage';

export class RetailService extends DataService {

    constructor() {
        super();
    }

    private populateProductsHistories = (shopInfo: IShop): Promise<IShop> => {
        const realm = this.globals.info.realm;
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

    private getProductReport = (url: string): Promise<IShopProductReport> => {
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

    private populateReports = ($html: JQuery, unit: IShop): Promise<IShop> => {
        const reportsUrls = $html.find('.grid a:has(img):not(:has(img[alt]))').toArray()
                .map((e: HTMLElement) => $(e).attr('href')) as string[],
            promises = reportsUrls.map((url: string) => this.getProductReport(url));

        return Promise.all(promises)
            .then((reports: IShopProductReport[]) => {
                // add reports
                reports.forEach((report: IShopProductReport, i: number) => unit.products[i].report = report);
                return unit;
            });
    }

    private fetchShopInfo = (unit: IUnitItem): Promise<IShop> => {
        let $html: JQuery = $('');
        return Api.get(`https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${unit.id}/trading_hall`)
            .then((html: string) => {
                $html = $(html);

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
                        supply: null,
                        updateFieldName: updateFieldNames[i]
                    }));

                return {
                    id: unit.id,
                    name: unit.name,
                    products
                };
            })
            .then((shopInfo: IShop) => this.populateReports($html, shopInfo))
            .then((shopInfo: IShop) => this.populateProductsHistories(shopInfo))
            .then((shopInfo: IShop) => {
                // save shopInfo in localStorage
                LS.set(this.storageKey(shopInfo.id), shopInfo);
                return shopInfo;
            });
    }

    private updatePrices = (shopInfo: IShop): Promise<IShop> => {
        return Api.get(`https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${shopInfo.id}/trading_hall`)
            .then((html: string) => {
                const $html = $(html);
                const prices = $html.find(':text').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[];

                if (shopInfo.products.length !== prices.length) {
                    return Promise.reject(`Failed to update prices (${shopInfo.id}). Products doesn't match prices.`);
                }

                shopInfo.products.forEach((product: IShopProduct, i: number) => product.price = prices[i]);
                return Promise.resolve(shopInfo);
            });
    }

    private updateSupplies = (shopInfo: IShop): Promise<IShop> => {
        return Api.get(`https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${shopInfo.id}/supply`)
            .then((html: string) => {
                const $html = $(html),
                parcels = $html.find('input:text[name^="supplyContractData[party_quantity]"]').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                price_mark_ups = $html.find('select[name^="supplyContractData[price_mark_up]"]').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                price_constraint_maxes = $html.find('input[name^="supplyContractData[price_constraint_max]"]').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                price_constraint_types = $html.find('select[name^="supplyContractData[constraintPriceType]"]').toArray()
                    .map((e: HTMLElement) => $(e).val()) as string[],
                quality_constraint_mins = $html.find('input[name^="supplyContractData[quality_constraint_min]"]').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                purchases = $html.find('td.nowrap:nth-child(4)').toArray()
                    .map((e: HTMLElement) => numberify($(e).text())) as number[],
                quantities = $html.find('td:nth-child(2) table:nth-child(1) tr:nth-child(1) td:nth-child(2)').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).text())) as number[],
                solds = $html.find('td:nth-child(2) table:nth-child(1) tr:nth-child(5) td:nth-child(2)').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).text())) as number[],
                offers = $html.find('.destroy').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                prices = $html.find('td:nth-child(9) table:nth-child(1) tr:nth-child(1) td:nth-child(2)').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).text())) as number[],
                reprices = $html.find('td:nth-child(9) table:nth-child(1) tr:nth-child(1) td:nth-child(2)').toArray()
                    .map((e: HTMLElement) => !!$(e).find('div').length) as boolean[],
                qualities = $html.find('td:nth-child(9) table:nth-child(1) tr:nth-child(2) td:nth-child(2)').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).text())) as number[],
                availables = $html.find('td:nth-child(10) table:nth-child(1) tr:nth-child(3) td:nth-child(2)').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).text())) as number[],
                imgs = $html.find('.noborder td > img').toArray()
                    .map((e: HTMLElement) => $(e).attr('src')) as string[],
                supplySymbols = imgs.map((url: string) => url.replace('/img/products/', '').split('.')[0]);

                shopInfo.products.forEach((product: IShopProduct) => {
                    const i = supplySymbols.indexOf(product.symbol);

                    product.supply = (i > -1) ? {
                        parcel: parcels[i],
                        price_mark_up: price_mark_ups[i],
                        price_constraint_max: price_constraint_maxes[i],
                        price_constraint_type: price_constraint_types[i],
                        quality_constraint_min: quality_constraint_mins[i],
                        purchase: purchases[i],
                        quantity: quantities[i],
                        sold: solds[i],
                        offer: offers[i],
                        price: prices[i],
                        reprice: reprices[i],
                        quality: qualities[i],
                        available: availables[i]
                    } : null;
                });

                return shopInfo;
            });
    }

    private restoreShopInfo = (shopInfo: IShop): Promise<IShop> => {
        // Before providing shopInfo we need to make sure prices and supplies are latest in case user did some changes manually
        return this.updatePrices(shopInfo)
            .then(this.updateSupplies);
    }

    public getUnitInfo = (unit: IUnitItem): Promise<IShop> => {
        const storageItem = LS.get(this.storageKey(unit.id));
        if (storageItem && storageItem.data && storageItem.today) {
            // restore only today saved shopInfo
            return this.restoreShopInfo(storageItem.data as IShop);
        } else {
            return this.fetchShopInfo(unit);
        }
    }
}
