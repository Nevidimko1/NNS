import { DataService } from './common/data.service';
import { IShop, IShopProduct, IShopProductReport } from '../models/shop.model';
import { Api } from '../../utils/api';
import { numberify } from '../../utils';
import { IUnitItem, IUnitItemProduct, IUnitsResponse } from '../globals/models/unitInfo.model';
import { LS, StorageItem } from '../../utils/storage';
import { LOG_STATUS } from '../enums/logStatus.enum';

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

                const cityShare = $(html).find('table.grid:eq(0) tr:eq(0) td:eq(4)').text().replace(' ед.', '');
                const rows = $(infoTable).find('tbody tr');
                return {
                    localPrice: numberify($(rows[1]).find('td:eq(0)').text()),
                    localQuality: numberify($(rows[2]).find('td:eq(0)').text()),
                    localBrand: numberify($(rows[3]).find('td:eq(0)').text()),
                    cityShare: numberify(cityShare)
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
            .then((shopInfo: IShop) => this.updateSupplies(shopInfo))
            .then((shopInfo: IShop) => {
                // save shopInfo in localStorage
                LS.set(this.storageKey(shopInfo.id), shopInfo);
                return shopInfo;
            });
    }

    private updatePrices = (shopInfo: IShop): Promise<IShop> => {
        const shopTradingHallUrl = `https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${shopInfo.id}/trading_hall`;
        return Api.get(shopTradingHallUrl)
            .then((html: string) => {
                const $html = $(html);
                const prices = $html.find(':text').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[];

                if (shopInfo.products.length !== prices.length) {
                    const err = `Failed to update prices for
                        <a target="_blank" href="${shopTradingHallUrl}">${shopInfo.name} (${shopInfo.id})</a>.
                        Products doesn't match prices.`;
                    this.status.log(err, LOG_STATUS.ERROR);
                    return Promise.reject(new Error(err));
                }

                shopInfo.products.forEach((product: IShopProduct, i: number) => product.price = prices[i]);
                return Promise.resolve(shopInfo);
            });
    }

    private updateSupplies = (shopInfo: IShop): Promise<IShop> => {
        const shopSupplyUrl = `https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${shopInfo.id}/supply`;
        return Api.get(shopSupplyUrl)
            .then((html: string) => {
                const $html = $(html),
                parcels = $html.find('input:text[name^="supplyContractData[party_quantity]"]').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                priceMarkUps = $html.find('select[name^="supplyContractData[price_mark_up]"]').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                priceConstraintMaxes = $html.find('input[name^="supplyContractData[price_constraint_max]"]').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                priceConstraintTypes = $html.find('select[name^="supplyContractData[constraintPriceType]"]').toArray()
                    .map((e: HTMLElement) => $(e).val()) as string[],
                qualityConstraintMins = $html.find('input[name^="supplyContractData[quality_constraint_min]"]').toArray()
                    .map((e: HTMLElement) => numberify(($(e) as any).val())) as number[],
                purchases = $html.find('td.nowrap:nth-child(4)').toArray()
                    .map((e: HTMLElement) => numberify($(e).text())) as number[],
                stock = $html.find('td:nth-child(2) table:nth-child(1) tr:nth-child(1) td:nth-child(2)').toArray()
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

                if (shopInfo.products.length !== supplySymbols.length) {
                    const err = `<a target="_blank" href="${shopSupplyUrl}">${shopInfo.name} (${shopInfo.id})</a>
                         is missing a supplier, or has too many suppliers!`;
                    this.status.log(err, LOG_STATUS.ERROR);
                    return Promise.reject(new Error(err));
                }

                shopInfo.products.forEach((product: IShopProduct) => {
                    const i = supplySymbols.indexOf(product.symbol);

                    product.supply = (i > -1) ? {
                        parcel: parcels[i],
                        priceMarkUp: priceMarkUps[i],
                        priceConstraintMax: priceConstraintMaxes[i],
                        priceConstraintType: priceConstraintTypes[i],
                        qualityConstraintMin: qualityConstraintMins[i],
                        purchase: purchases[i],
                        stock: stock[i],
                        sold: solds[i],
                        offer: offers[i],
                        price: prices[i],
                        reprice: reprices[i],
                        quality: qualities[i],
                        available: availables[i]
                    } : null;
                });

                return Promise.resolve(shopInfo);
            });
    }

    private restoreShopInfo = (shopInfo: IShop): Promise<IShop> => {
        // Before providing shopInfo we need to make sure prices and supplies are latest in case user did some changes manually
        return this.updatePrices(shopInfo)
            .then(this.updateSupplies)
            .catch((e) => {
                console.error(e);
                return Promise.reject(e);
            });
    }

    private shopInfoIsUpToDate = (storageItem: StorageItem): boolean => {
        if (!storageItem || !storageItem.data || !storageItem.today) {
            return false;
        }
        const shopInfo = (storageItem.data as IShop);
        const unit = this.globals.unitsList.filter(item => item.id === shopInfo.id)[0];
        if (!unit) {
            return false;
        }

        const p1 = unit.products.map((p: IUnitItemProduct) => p.id).sort();
        const p2 = shopInfo.products.map((p: IShopProduct) => p.id).sort();
        if (p1.length !== p2.length || p1.filter((p, i) => p !== p2[i]).length) {
            return false;
        }
        return true;
    }

    private retrieveUnitInfo = (unit: IUnitItem): Promise<IShop> => {
        const storageItem = LS.get(this.storageKey(unit.id));
        if (this.shopInfoIsUpToDate(storageItem)) {
            return this.restoreShopInfo(storageItem.data as IShop);
        } else {
            const u = this.globals.unitsList.filter(item => item.id === unit.id)[0] || unit;
            return this.fetchShopInfo(u);
        }
    }

    public getUnitInfo = (unit: IUnitItem): Promise<IShop> => {
        return Api.refreshCache(unit.id)
            .then(() => this.retrieveUnitInfo(unit));
    }
}
