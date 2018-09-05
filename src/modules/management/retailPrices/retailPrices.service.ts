import { Api } from '../../../utils/api';
import { Globals } from '../../../shared/globals/globals.singletone';
import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { IShopProduct, IShop } from '../../../shared/models/shop.model';
import { IRetailPriceStrategy } from './models/priceStrategy.model';
import { Status } from '../../../shared/status/status.singletone';
import { RetailService } from '../../../shared/data/retail.service';

export class RetailPricesService {
    private retailService: RetailService;
    private globals: Globals;

    constructor() {
        this.retailService = new RetailService();
        this.globals = Globals.getInstance();
    }

    private productPriceChangeLog = (product: IShopProduct, newPrice: number): string => {
        const inc = product.price < newPrice;
        return `<tr>
            <td style="position: relative; width: 16px;">
                <span class="log-prod-img" style="background-image: url(${product.imageSrc});" title="${product.name}"></span>
            </td>
            <td>${product.name}</td>
            <td><span class="${inc ? 'high' : 'low'}"></span></td>
            <td class="${inc ? 'nns-text-success' : 'nns-text-danger'}">${newPrice}</td>
            <td>(${product.price})</td>
        </tr>`;
    }

    public updateUnitPrices = (unitInfo: IUnitItem, priceStrategy: IRetailPriceStrategy, minPriceMultiplier: number): Promise<any> => {
        const status = Status.getInstance();
        let priceChangeLog = '<table style="margin-left: 15px;"><tbody>';

        return this.retailService.getUnitInfo(unitInfo)
            .then((shopInfo: IShop) => {
                const newPrices = shopInfo.products
                    .map((p: IShopProduct) => Math.max(priceStrategy.calculate(p), Math.round(p.purch * minPriceMultiplier)));
                let data = 'action=setprice',
                    change = false;

                shopInfo.products.forEach((product: IShopProduct, i: number) => {
                    if (product.price !== newPrices[i]) {
                        data += '&' + encodeURI(product.updateFieldName + '=' + newPrices[i]);
                        change = true;

                        // add price change log
                        priceChangeLog += this.productPriceChangeLog(product, newPrices[i]);

                        // update product price in unit model
                        product.price = newPrices[i];
                    }
                });

                // finalize price change log
                priceChangeLog += '</tbody></table>';

                const url = `https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${unitInfo.id}/trading_hall`,
                    unitLink = `<a target="_blank" href="${url}">${unitInfo.name} (${unitInfo.id})</a>`;

                if (change) {
                    return Api.post(url, data)
                        .then(() => {
                            status.log(`Prices have been updated for ${unitLink}<br>` + priceChangeLog);
                            return Promise.resolve();
                        });
                } else {
                    status.log(`No price changes done for ${unitLink}`);
                    return Promise.resolve();
                }
            });
    }
}
