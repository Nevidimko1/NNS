import { SupplyService } from '../common/supply.service';
import { SupplyUnit } from '../models/supplyUnit.model';
import { WarehouseService } from '../../../../shared/data/warehouse.service';
import { IWarehouse,
    IWarehouseProduct,
    IWarehouseSupplier,
    IWarehouseTarget,
    IWarehouseContract
} from '../../../../shared/models/warehouse.model';
import { WarehouseSupplyStrategies } from './strategies/supply/warehouseSupplyStrategies.component';
import { Api } from '../../../../utils/api';
import { Globals } from '../../../../shared/globals/globals.singletone';
import { WarehouseMinSupplyStrategies } from './strategies/min/warehouseMinSupplyStrategies.component';
import { WarehouseMaxSupplyStrategies } from './strategies/max/warehouseMaxSupplyStrategies.component';
import { Status } from '../../../../shared/status/status.singletone';
import { LOG_STATUS } from '../../../../shared/enums/logStatus.enum';
import { WarehouseSupplyChangeModel } from './models/warehouseSupplyChange.model';

export class WarehouseSupplyService extends SupplyService {
    private readonly consoleColumns = ['offer', 'price', 'quality', 'pqr', 'myself', 'available', 'parcel'];
    private readonly consoleChangeColumns = ['offer', ];
    private readonly MIN_QUALITY_DIFF = 0.75;

    public strategies = WarehouseSupplyStrategies;
    public min = WarehouseMinSupplyStrategies;
    public max = WarehouseMaxSupplyStrategies;

    private globals: Globals;
    private status: Status;
    private warehouseService: WarehouseService;

    constructor() {
        super();

        this.globals = Globals.getInstance();
        this.status = Status.getInstance();
        this.warehouseService = new WarehouseService();
    }

    private filterSuppliersFn = (s: IWarehouseSupplier, minQuality: number): boolean => {
        return s.quality >= minQuality;
    }

    private compareSuppliersFn = (a: IWarehouseSupplier, b: IWarehouseSupplier): number => {
        return ((a.myself as any) - (b.myself as any)) || a.pqr - b.pqr;
    }

    private calculateMinQuality = (p: IWarehouseProduct): number => {
        let minQuality = 0;
        minQuality = p.suppliers.reduce((r, s) => r + s.quality, 0) / (p.suppliers.length || 1);
        minQuality = Math.min(minQuality, p.quality);
        minQuality = minQuality * this.MIN_QUALITY_DIFF;
        return minQuality;
    }

    private topSuppliers = (p: IWarehouseProduct): IWarehouseSupplier[] => {
        const minQuality = this.calculateMinQuality(p);

        // filter by quality
        let topSuppliers = p.suppliers.filter(s => this.filterSuppliersFn(s, minQuality));

        // don't order too expensive products!
        // for products with no suppliers yet, ask user to manually add suppliers
        const maxPQR = p.purchase ? (p.purchase / p.quality) * 5 : 0;
        topSuppliers = topSuppliers.filter(s => s.pqr < maxPQR);

        topSuppliers.sort(this.compareSuppliersFn);

        console.log(`Min quality: ${minQuality}; max PQR: ${maxPQR}`);
        return topSuppliers;
    }

    private createChangeObject = (id: number, quantity: number, t: IWarehouseContract): WarehouseSupplyChangeModel => ({
        offer: t.offer,
        unit: id,
        amount: quantity,
        priceConstraint: Number((t.price * 1.05).toFixed(2)),
        priceMarkUp: 0,
        qualityMin: Number((t.quality * 0.95).toFixed(2)),
        constraintPriceType: 'Abs'
    })

    public update = (unit: SupplyUnit): Promise<any> => {
        return this.warehouseService.getUnitInfo(unit.data)
            .then((info: IWarehouse) => {
                return info.products.map((p: IWarehouseProduct) => {
                    const contractOffers = p.contracts.map(s => s.offer);
                    let newSuppliers: IWarehouseTarget[] = this.topSuppliers(p).filter(s => contractOffers.indexOf(s.offer) === -1);

                    newSuppliers = (p.contracts as any).concat(newSuppliers);
                    newSuppliers.sort((a, b) => ((b.myself as any) - (a.myself as any)) || a.pqr - b.pqr);

                    console.log(`\nTOP Suppliers for ${p.name}: `);
                    console.table(newSuppliers, this.consoleColumns);

                    let toOrder = unit.selectedStrategy.calculate(p);
                    const min = unit.selectedMin ? unit.selectedMin.calculate(p) : 0;
                    let maxOrderValue = unit.selectedMax ? unit.selectedMax.calculate(p) : Infinity;

                    const removes: IWarehouseContract[] = [];
                    const changes: WarehouseSupplyChangeModel[] = newSuppliers.map((t: IWarehouseContract, ti: number) => {
                        let quantity = t.available < toOrder ? t.available : toOrder;
                        if (quantity > 0 || t.myself) {
                            // respect max value to order in $$$
                            if (maxOrderValue - quantity * t.price < 0) {
                                quantity = Math.floor(maxOrderValue / t.price);
                                maxOrderValue = 0;
                            } else {
                                maxOrderValue -= quantity * t.price;
                            }

                            // order everything from my units
                            if (t.myself) {
                                quantity = t.available;
                            }

                            // skip not needed suppliers
                            if (!quantity) {
                                return;
                            }

                            toOrder -= quantity;

                            // round quantity
                            const roundTo = Math.pow(10, quantity.toString().length - 2);
                            quantity = Math.ceil(quantity / roundTo) * roundTo;

                            if (t.parcel === quantity && t.price < t.priceConstraintMax && t.quality > t.qualityConstraintMin) {
                                // skip same quantity orders
                                // if supplier has changed price/quality but they're still ok with constraint values
                                return null;
                            }

                            return this.createChangeObject(info.id, quantity, t);
                        } else if (t.parcel) {
                            // if no available items, remove contract
                            // also remove contracts with min parcel, and if there's a better supplier exist (not good already)
                            if (min && t.available) {
                                // const notGood = false;
                                const sIndex = newSuppliers.indexOf(newSuppliers.filter(s => s.offer === t.offer)[0]);
                                const notGood = !!newSuppliers.slice(0, sIndex).filter((s: any) => !s.parcel || s.parcel === min)[0];
                                const m = Math.min(min, t.available);
                                if (t.parcel !== m) {
                                    return this.createChangeObject(info.id, m, t);
                                } else if (notGood) {
                                    removes.push(t);
                                }
                            } else {
                                removes.push(t);
                            }
                        } else if (ti === 0) {
                            // if no suppliers needed keep the best with min quantity, just in case it's needed in future
                            return this.createChangeObject(info.id, min, t);
                        }
                    })
                        .filter(c => !!c);

                    const supplyUrl = `/${this.globals.info.realm}/main/unit/view/${info.id}/supply`;
                    if (toOrder > 0) {
                        const unitLink = `<a target="_blank" href="${supplyUrl}">${info.name} (${info.id})</a>`;
                        this.status.log(`Not enough suppliers for ${p.name} at ${unitLink}`, LOG_STATUS.ERROR);
                    }

                    if (changes.length) {
                        console.log('Supply changes:');
                        let ex: IWarehouseContract;
                        const log = changes.map(change => {
                            ex = newSuppliers.filter(supplier => supplier.offer === change.offer)[0] as IWarehouseContract;
                            return {
                                offer: change.offer,
                                price: ex ? ex.price : '',
                                quality: ex ? ex.quality : '',
                                pqr: ex ? ex.pqr : '',
                                myself: ex ? ex.myself : '',
                                available: ex ? ex.available : '',
                                parcel: change.amount
                            };
                        });
                        console.table(log);
                    }
                    if (removes.length) {
                        console.log('Removed suppliers:');
                        console.table(removes, this.consoleColumns);
                    }
                    if (!changes.length && !removes.length) {
                        console.log(`No changes for ${p.name}`);
                    }

                    const initialPromise = () => {
                        if (removes.length) {
                            return Api.post(
                                supplyUrl,
                                removes.reduce((R, r) => R += `&supplyContractData%5Bselected%5D%5B%5D=${r.offer}`, 'contractDestroy=1')
                            );
                        } else {
                            return Promise.resolve();
                        }
                    };

                    return changes
                        .map(change => () => Api.postJson(`/${this.globals.info.realm}/ajax/unit/supply/create`, change))
                        .reduce((r, g) => r.then(g), initialPromise());
                });
            });
    }
}
