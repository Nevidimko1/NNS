import { DataService } from './common/data.service';
import { Api } from '../../utils/api';
import { numberify } from '../../utils';
import { IUnitItem } from '../globals/models/unitInfo.model';
import { IWarehouse, IWarehouseProduct, IWarehouseContract, IWarehouseSupplier } from '../models/warehouse.model';

export class WarehouseService extends DataService {

    constructor() {
        super();
    }


    private populateProductSuppliers = (info: IWarehouse): Promise<IWarehouse> => {
        return info.products.map((p: IWarehouseProduct, i: number) => {
            return () => Api.get(`https://virtonomica.ru/olga/window/unit/supply/create/${info.id}/step1/${p.id}`)
                .then(html => {
                    const $html = $(html),
                        suppliers = $html.find('tr.wborder').toArray(),
                        ids = suppliers.map(e => numberify($(e).find('td:eq(1) a').attr('href').split('/')[7])),
                        names = suppliers.map(e => $(e).find('td:eq(1) a').text()),
                        offers = suppliers.map(e => numberify($(e).attr('id').substr(1))),
                        myselves = suppliers.map(e => $(e).hasClass('myself')),
                        availables = suppliers.map(e => numberify($(e).find('td:eq(3)').text()
                            .replace(/( |\t)/g, '').trim().split('\n')[0])),
                        prices = suppliers.map(e => numberify($(e).find('td:eq(5)').text())),
                        qualities = suppliers.map(e => numberify($(e).find('td:eq(6)').text())),
                        isWarehouses = suppliers.map(e => $(e).find('td:eq(1) i').text().split(' :: ')[1] === 'Склад');

                    info.products[i].suppliers = suppliers.map((s, j) => ({
                        id: ids[j],
                        name: names[j],
                        offer: offers[j],
                        myself: myselves[j],
                        available: availables[j],
                        price: prices[j],
                        quality: qualities[j],
                        pqr: prices[j] / qualities[j],
                        isWarehouse: isWarehouses[j]
                    }));

                    info.products[i].contracts.forEach((c: IWarehouseContract) => {
                        const ex = p.suppliers.filter((s: IWarehouseSupplier) => s.id === c.id)[0];
                        if (!ex) {
                            p.suppliers.unshift({
                                id: c.id,
                                name: c.name,
                                offer: c.offer,
                                myself: c.myself,
                                available: c.available,
                                price: c.price,
                                quality: c.quality,
                                pqr: c.price / c.quality,
                                isWarehouse: undefined
                            });
                        }
                    });
                    return info;
                });
        })
        .reduce((p, g) => p.then(g), Promise.resolve(info));
    }

    private fetchUnitInfo = (unit: IUnitItem): Promise<IWarehouse> => {
        const filterData = 'total_price%5Bfrom%5D=&total_price%5Bto%5D=&quality%5Bfrom%5D=&quality%5Bto%5D=&quantity%5Bfrom%5D=&' +
            'free_for_buy%5Bfrom%5D=1&brand_value%5Bfrom%5D=&brand_value%5Bto%5D=';
        return Promise.all([
            Api.get(`/${this.globals.info.realm}/window/common/util/setpaging/dbwarehouse/supplyList/40000`),
            Api.post(`/${this.globals.info.realm}/window/common/util/setfiltering/dbwarehouse/supplyList`, filterData),
            Api.get(`/${this.globals.info.realm}/window/common/util/setfiltering/dbwarehouse/supplyList/supplierType=all/tm=all`)
        ])
            .then(() => {
                return Promise.all([
                    Api.get(`https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${unit.id}`),
                    Api.get(`https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${unit.id}/supply`)
                ]);
            })
            .then((result: string[]) => {
                const $main = $(result[0]);
                const $supply = $(result[1]);

                const mSize = numberify($main.find('.infoblock td:eq(1)').text()),
                    mUsed = numberify($main.find('[nowrap]:eq(0)').text()),
                    rows = $main.find('.grid tr[class]').toArray(),
                    mSymbols = rows.map(e => $(e).find('img').attr('src').replace('/img/products/', '').split('.')[0]) as any as string[],
                    mPrices = rows.map(e => numberify($(e as any).find('td:eq(4)').text())),
                    mQualities = rows.map(e => numberify($(e as any).find('td:eq(2)').text())),
                    mPurchases = rows.map(e => numberify($(e as any).find('td:eq(3)').text())),
                    mSellContracts = rows.map(e => numberify($(e as any).find('td:eq(5)').text())),
                    mSolds = rows.map(e => numberify($(e as any).find('td:eq(8)').text())),
                    mBuyContracts = rows.map(e => numberify($(e as any).find('td:eq(6)').text())),
                    mBoughts = rows.map(e => numberify($(e as any).find('td:eq(7)').text()));

                const form = $supply.find('[name=supplyContractForm]') as JQuery<HTMLFormElement>,
                    stockz = $supply.find('.p_title table')
                        .map(function (i, e) {
                            return $(e).find('strong').length >= 2 ? numberify($(e).find('strong:eq(0)').text()) : 0;
                        }).get() as any as number[],
                    parcels = $supply.find('input:text[name^="supplyContractData[party_quantity]"]')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    priceMarkUps = $supply.find('input[name^="supplyContractData[price_mark_up]"]')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    priceConstraintMaxes = $supply.find('input[name^="supplyContractData[price_constraint_max]"]')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    priceConstraintTypes = $supply.find('input[name^="supplyContractData[constraintPriceType]"]')
                        .map(function (i, e) { return $(e).val() as string; }).get() as any as string[],
                    qualityConstraintMins = $supply.find('input[name^="supplyContractData[quality_constraint_min]"]')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    product = $supply.find('tr:has(input:text[name])')
                        .map(function (i, e) {
                            return $(e).prevAll('.p_title:first').find('strong:eq(0)').text();
                        }).get() as any as string[],
                    prices = $supply.find('tr:has(input) td:nth-child(4)').map(
                        function (i, e) {
                            const m = $(e).text().match(/(\d|\.|\s)+$/);
                            return numberify(m ? m[0] : '0');
                        }).get() as any as number[],
                    reprices = $supply.find('tr:has(input) td:nth-child(4)')
                        .map(function (i, e) { return !!$(e).find('span').length; }).get() as any as boolean[],
                    qualities = $supply.find('tr:has(input) td:nth-child(6)')
                        .map(function (i, e) { return numberify($(e).text()); }).get() as any as number[],
                    offers = $supply.find('tr input:checkbox')
                        .map(function (i, e) { return numberify(($(e) as any).val()); }).get() as any as number[],
                    availables = $supply.find('tr:has(input) td:nth-child(9)').map(
                        function (i, e) {
                            return $(e).text().split(/\s[a-zA-Zа-яА-ЯёЁ]+\s/).reduce(
                                function (a, b) {
                                    const m = b.match(/(\d| )+/);
                                    return Math.min(a, b.match(/\d+/) === null ? Infinity : numberify(m ? m[0] : '0'));
                                }, Infinity);
                        }).get() as any as number[],
                    supplierUnits = $supply.find('tr:has(input)[class]').toArray()
                        .map(e => $(e).find('td:eq(0) > div:eq(1) > a:last-child()')),
                    supplierUnitNames = supplierUnits.map(e => $(e).text()) as string[],
                    supplierUnitIds = supplierUnits.map(e => numberify($(e).attr('href').split('/')[7])) as number[],
                    myselves = $supply.find('tr:has(input)[class]')
                        .map(function (i, e) { return !!$(e).find('strong').length; }).get() as any as boolean[],
                    ids = $supply.find('.p_title').map(
                        function (i, e) {
                            const m = $(e).find('a:eq(1)').attr('href').match(/\d+$/);
                            return numberify(m ? m[0] : '0');
                        }).get() as any as number[],
                    idsAdd = $supply.find('.add_contract a:has(img)').map(
                        function (i, e) {
                            const m = $(e).attr('href').match(/\d+$/);
                            return numberify(m ? m[0] : '0');
                        }).get() as any as number[],
                    idz = ids.concat(idsAdd),
                    names = $supply.find('.p_title')
                        .map(function (i, e) { return $(e).find('strong:eq(0)').text(); }).get() as any as string[],
                    namesAdd = $supply.find('.add_contract img').map(function (i, e) { return $(e).attr('alt'); }).get() as any as string[],
                    namez = names.concat(namesAdd),
                    imgs = $supply.find('.p_title').map(
                        function (i, e) { return $(e).find('img:eq(0)').attr('src'); }).get() as any as string[],
                    imgsAdd = $supply.find('.add_contract img').map(
                        function (i, e) { return $(e).attr('src'); }).get() as any as string[],
                    images = imgs.concat(imgsAdd),
                    symbols = images.map((url: string) => url.replace('/img/products/', '').split('.')[0]);

                const contractsIds = product.map((n: string) => idz[namez.indexOf(n)]);
                const products: IWarehouseProduct[] = idz.map((id: number, i: number) => {
                    const contracts: IWarehouseContract[] = contractsIds
                        .filter((cId: number) => cId === id)
                        .map((cId: number, j: number) => {
                            const gi = contractsIds.indexOf(cId) + j;
                            return {
                                id: supplierUnitIds[gi],
                                name: supplierUnitNames[gi],
                                myself: myselves[gi],
                                parcel: parcels[gi],
                                available: availables[gi],
                                price: prices[gi],
                                quality: qualities[gi],
                                offer: offers[gi],
                                pqr: prices[gi] && qualities[gi] ? prices[gi] / qualities[gi] : Infinity,
                                priceConstraintMax: priceConstraintMaxes[gi],
                                priceConstraintType: priceConstraintTypes[gi],
                                qualityConstraintMin: qualityConstraintMins[gi],
                                priceMarkUp: priceMarkUps[gi],
                                reprice: reprices[gi]
                            };
                        });
                    const mi = mSymbols.indexOf(symbols[i]);
                    return {
                        id,
                        name: namez[i],
                        symbol: symbols[i],
                        quality: mQualities[mi],
                        purchase: mPurchases[mi],
                        price: mPrices[mi],
                        sellContract: mSellContracts[mi],
                        sold: mSolds[mi],
                        buyContract: mBuyContracts[mi],
                        bought: mBoughts[mi],
                        stock: stockz[mi] || 0,
                        contracts: contracts,
                        suppliers: []
                    };
                })
                    .filter((p: IWarehouseProduct) => mSymbols.indexOf(p.symbol) > -1);

                return {
                    id: unit.id,
                    name: unit.name,
                    size: mSize,
                    used: mUsed,
                    form: form,
                    products: products
                };
            })
                .then(this.populateProductSuppliers);
    }

    public getUnitInfo = (unit: IUnitItem): Promise<IWarehouse> => {
        return Api.refreshCache(unit.id)
            .then(() => this.fetchUnitInfo(unit));
    }
}
