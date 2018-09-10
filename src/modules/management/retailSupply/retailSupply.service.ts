import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { IRetailSupplyStrategy } from './models/retailSupplyStrategy.model';
import { IRetailMinSupplyStrategy } from './models/retailMinSupplyStrategy.model';
import { RetailService } from '../../../shared/data/retail.service';
import { IShop, IShopProduct } from '../../../shared/models/shop.model';
import { Api } from '../../../utils/api';
import { Globals } from '../../../shared/globals/globals.singletone';
import { Status } from '../../../shared/status/status.singletone';

export class RetailSupplyService {
    private retailService: RetailService;
    private globals: Globals;
    private status: Status;

    constructor() {
        this.retailService = new RetailService();
        this.globals = Globals.getInstance();
        this.status = Status.getInstance();
    }

    private productSupplyChangeLog = (product: IShopProduct, newSupplyAmount: number): string => {
        const inc = product.supply.parcel < newSupplyAmount;
        return `<tr>
            <td style="position: relative; width: 16px;">
                <span class="log-prod-img" style="background-image: url(${product.imageSrc});" title="${product.name}"></span>
            </td>
            <td>${product.name}</td>
            <td><span class="${inc ? 'high' : 'low'}"></span></td>
            <td class="${inc ? 'nns-text-success' : 'nns-text-danger'}">${newSupplyAmount}</td>
            <td>(${product.supply.parcel})</td>
        </tr>`;
    }

    public updateUnitSupplies = (
        unitInfo: IUnitItem,
        supplyStrategy: IRetailSupplyStrategy,
        minSupply: IRetailMinSupplyStrategy
    ): Promise<any> => {
        return this.retailService.getUnitInfo(unitInfo)
            .then((shopInfo: IShop) => {
                let supplyChangeLog = '<table style="margin-left: 15px;"><tbody>';
                const productsWithSupply = shopInfo.products.filter((p: IShopProduct) => !!p.supply);
                const newSupplies = productsWithSupply
                    .map((p: IShopProduct) => Math.max(supplyStrategy.calculate(p), minSupply.calculate(p)));

                const req = productsWithSupply
                    .map((product: IShopProduct, i: number) => {
                        if (product.supply.parcel !== newSupplies[i] || product.supply.reprice) {
                            supplyChangeLog += this.productSupplyChangeLog(product, newSupplies[i]);
                            return {
                                amount: newSupplies[i],
                                offer: product.supply.offer,
                                unit: shopInfo.id,
                                priceConstraint: product.supply.priceConstraintMax,
                                priceMarkUp: product.supply.priceMarkUp,
                                qualityMin: product.supply.qualityConstraintMin,
                                constraintPriceType: product.supply.priceConstraintType
                            };
                        } else {
                            return null;
                        }
                    })
                    .filter(d => !!d);

                supplyChangeLog += '</tbody></table>';

                const url = `/${this.globals.info.realm}/ajax/unit/supply/create`,
                    tradingHallUrl = `https://virtonomica.ru/${this.globals.info.realm}/main/unit/view/${unitInfo.id}/trading_hall`,
                    unitLink = `<a target="_blank" href="${tradingHallUrl}">${unitInfo.name} (${unitInfo.id})</a>`;

                if (req.length) {
                    return Promise.all(req.map(r => Api.postJson(url, r)))
                        .then(() => {
                            this.status.log(`Supplies have been updated for ${unitLink}<br>` + supplyChangeLog);
                            return Promise.resolve();
                        });
                } else {
                    this.status.log(`No supply changes done for ${unitLink}`);
                    return Promise.resolve();
                }
            });
    }
}
