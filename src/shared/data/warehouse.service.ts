import { DataService } from './common/data.service';
import { IShop, IShopProduct, IShopProductReport } from '../models/shop.model';
import { Api } from '../../utils/api';
import { numberify } from '../../utils';
import { IUnitItem, IUnitItemProduct, IUnitsResponse } from '../globals/models/unitInfo.model';
import { LS, StorageItem } from '../../utils/storage';
import { LOG_STATUS } from '../enums/logStatus.enum';
import { IWarehouse, IWarehouseProduct, IWarehouseContract } from '../models/warehouse.model';

export class WarehouseService extends DataService {

    constructor() {
        super();
    }

    private fetchUnitInfo = (unit: IUnitItem): Promise<IWarehouse> => {
        let $html: JQuery = $('');
        return Api.get(`https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${unit.id}/supply`)
            .then((html: string) => {
                $html = $(html);

                const form = $html.find('[name=supplyContractForm]'),
                    contract = $html.find('.p_title')
                        .map(function (i, e) { return $(e).find('a:eq(1)').attr('href'); }).get() as any as string[],
                    contractAdd = $html.find('.add_contract a:has(img)')
                        .map(function (i, e) { return $(e).attr('href'); }).get() as any as string[],
                    contractz = contract.concat(contractAdd),
                    stockz = $html.find('.p_title table')
                        .map(function (i, e) {
                            return $(e).find('strong').length >= 2 ? numberify($(e).find('strong:eq(0)').text()) : 0;
                        }).get() as any as number[],
                    shipmentsz = $html.find('.p_title table')
                        .map(function (i, e) {
                            if ($(e).find('strong').length === 1) {
                                return numberify($(e).find('strong:eq(0)').text());
                            } else {
                                return numberify($(e).find('strong:eq(2)').text());
                            }
                        }).get() as any as number[],
                    parcels = $html.find('input:text[name^="supplyContractData[party_quantity]"]')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    priceMarkUps = $html.find('input[name^="supplyContractData[price_mark_up]"]')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    priceConstraintMaxes = $html.find('input[name^="supplyContractData[price_constraint_max]"]')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    priceConstraintTypes = $html.find('input[name^="supplyContractData[constraintPriceType]"]')
                        .map(function (i, e) { return $(e).val() as string; }).get() as any as string[],
                    qualityConstraintMins = $html.find('input[name^="supplyContractData[quality_constraint_min]"]')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    product = $html.find('tr:has(input:text[name])')
                        .map(function (i, e) {
                            return $(e).prevAll('.p_title:first').find('strong:eq(0)').text();
                        }).get() as any as string[],
                    prices = $html.find('tr:has(input) td:nth-child(4)').map(
                        function (i, e) {
                            const m = $(e).text().match(/(\d|\.|\s)+$/);
                            return numberify(m ? m[0] : '0');
                        }).get() as any as number[],
                    reprices = $html.find('tr:has(input) td:nth-child(4)')
                        .map(function (i, e) { return !!$(e).find('span').length; }).get() as any as boolean[],
                    qualities = $html.find('tr:has(input) td:nth-child(6)')
                        .map(function (i, e) { return numberify($(e).text()); }).get() as any as number[],
                    offers = $html.find('tr input:checkbox')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    availables = $html.find('tr:has(input) td:nth-child(9)').map(
                        function (i, e) {
                            return $(e).text().split(/\s[a-zA-Zа-яА-ЯёЁ]+\s/).reduce(
                                function (a, b) {
                                    const m = b.match(/(\d| )+/);
                                    return Math.min(a, b.match(/\d+/) === null ? Infinity : numberify(m ? m[0] : '0'));
                                }, Infinity);
                    }).get() as any as number[],
                    myselves = $html.find('tr:has(input)[class]')
                        .map(function (i, e) { return !!$(e).find('strong').length; }).get() as any as boolean[],
                    ids = $html.find('.p_title').map(
                        function (i, e) {
                            const m = $(e).find('a:eq(1)').attr('href').match(/\d+$/);
                            return numberify(m ? m[0] : '0');
                        }).get() as any as number[],
                    idsAdd = $html.find('.add_contract a:has(img)').map(
                        function (i, e) {
                            const m = $(e).attr('href').match(/\d+$/);
                            return numberify(m ? m[0] : '0');
                        }).get() as any as number[],
                    idz = ids.concat(idsAdd),
                    names = $html.find('.p_title')
                        .map(function (i, e) { return $(e).find('strong:eq(0)').text(); }).get() as any as string[],
                    namesAdd = $html.find('.add_contract img').map(function (i, e) { return $(e).attr('alt'); }).get() as any as string[],
                    namez = names.concat(namesAdd),
                    imgs = $html.find('.p_title').map(
                        function (i, e) { return $(e).find('img:eq(0)').attr('src'); }).get() as any as string[],
                    imgsAdd = $html.find('.add_contract img').map(
                        function (i, e) { return $(e).attr('src'); }).get() as any as string[],
                    images = imgs.concat(imgsAdd),
                    symbols = images.map((url: string) => url.replace('/img/products/', '').split('.')[0]);

                const contractsIds = product.map((n: string) => idz[namez.indexOf(n)]);
                const products: IWarehouseProduct[] = idz.map((id: number, i: number) => {
                    const contracts: IWarehouseContract[] = contractsIds
                        .filter((cId: number) => cId === id)
                        .map((cId: number) => {
                            const gi = contractsIds.indexOf(cId);
                            return {
                                myself: myselves[gi],
                                parcel: parcels[gi],
                                available: availables[gi],
                                price: prices[gi],
                                quality: qualities[gi],
                                offer: offers[gi],
                                priceConstraintMax: priceConstraintMaxes[gi],
                                priceConstraintType: priceConstraintTypes[gi],
                                qualityConstraintMin: qualityConstraintMins[gi],
                                priceMarkUp: priceMarkUps[gi],
                                reprice: reprices[gi]
                            };
                        });
                    return {
                        id,
                        name: namez[i],
                        symbol: symbols[i],
                        shipments: shipmentsz[i] || 0,
                        stock: stockz[i] || 0,
                        contracts: contracts
                    };
                });

                return {
                    form: form,
                    name: unit.name,
                    products: products
                };
            })
            .then((info: IWarehouse) => {
                // save shopInfo in localStorage
                // LS.set(this.storageKey(shopInfo.id), shopInfo);
                return info;
            });
    }

    // private unitInfoIsUpToDate = (storageItem: StorageItem): Promise<IUnitItem | void> => {
    //     if (!storageItem || !storageItem.data || !storageItem.today) {
    //         return Promise.reject();
    //     }

    //     return this.globals.getUnitList('unit_type_id=2011')
    //         .then((unitList: IUnitItem[]) => {
    //             const shopInfo = (storageItem.data as IShop);
    //             const unit = unitList.filter(item => item.id === shopInfo.id)[0];
    //             if (!unit) {
    //                 return Promise.reject();
    //             }

    //             const p1 = unit.products.map((p: IUnitItemProduct) => p.id).sort();
    //             const p2 = shopInfo.products.map((p: IShopProduct) => p.id).sort();
    //             if (p1.length !== p2.length || p1.filter((p, i) => p !== p2[i]).length) {
    //                 return Promise.reject(unit);
    //             }
    //             return Promise.resolve();
    //         });
    // }

    // private retrieveUnitInfo = (unit: IUnitItem): Promise<IShop> => {
    //     const storageItem = LS.get(this.storageKey(unit.id));
    //     return this.unitInfoIsUpToDate(storageItem)
    //         .then(() => storageItem.data as IShop)
    //         .catch((result: IUnitItem | any) => {
    //             if (result instanceof Error === false) {
    //                 const unitToFetch = result || unit;
    //                 return this.fetchUnitInfo(unitToFetch);
    //             } else {
    //                 console.error(result);
    //                 return Promise.reject();
    //             }
    //         });
    // }

    public getUnitInfo = (unit: IUnitItem): Promise<IWarehouse> => {
        return Api.refreshCache(unit.id)
            .then(() => this.fetchUnitInfo(unit));
    }
}
