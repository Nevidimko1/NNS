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

export class WarehouseSupplyService extends SupplyService {
    public strategies = WarehouseSupplyStrategies;
    public min = [];
    public max = [];

    private globals: Globals;
    private warehouseService: WarehouseService;

    constructor() {
        super();

        this.globals = Globals.getInstance();
        this.warehouseService = new WarehouseService();
    }

    private filterSuppliersFn = (s: IWarehouseSupplier, minQuality: number): boolean => {
        return !s.myself && s.quality > minQuality;
    }

    private compareSuppliersFn = (a: IWarehouseSupplier, b: IWarehouseSupplier): number => {
        return ((a.myself as any) - (b.myself as any)) || a.pqr - b.pqr;
    }

    private topSuppliers = (p: IWarehouseProduct): IWarehouseSupplier[] => {
        // top not mine suppliers.
        const minQualityDiff = 0.95;

        const topSuppliers = p.suppliers.filter(s => this.filterSuppliersFn(s, minQualityDiff * p.quality));
        topSuppliers.sort(this.compareSuppliersFn);
        return topSuppliers.splice(0, 10);
    }

    public update = (unit: SupplyUnit): Promise<any> => {
        const quantity = 200;

        return this.warehouseService.getUnitInfo(unit.data)
            .then((info: IWarehouse) => {
                console.log(info);
                return info.products.map((p: IWarehouseProduct) => {
                    const contractOffers = p.contracts.map(s => s.offer);
                    let newSuppliers: IWarehouseTarget[] = this.topSuppliers(p).filter(s => contractOffers.indexOf(s.offer) === -1);

                    newSuppliers = (p.contracts as any).concat(newSuppliers);
                    newSuppliers.sort((a, b) => ((b.myself as any) - (a.myself as any)) || a.pqr - b.pqr);
                    console.table(newSuppliers);

                    let toOrder = quantity;
                    let del = '';
                    const changes = newSuppliers.map((t: IWarehouseContract) => {
                        const order = t.available < toOrder ? t.available : toOrder;
                        if (order > 0) {
                            toOrder -= order;
                            if (t.parcel === order) {
                                // skip same orders. Don't change them
                                return null;
                            }

                            return {
                                offer: t.offer,
                                unit: info.id,
                                amount: order,
                                priceConstraint: t.priceConstraintMax || Number((t.price * 1.05).toFixed(2)),
                                priceMarkUp: t.priceMarkUp || 0,
                                qualityMin: t.qualityConstraintMin || Number((t.quality * 0.95).toFixed(2)),
                                constraintPriceType: t.priceConstraintType || 'Abs'
                            };
                        } else if (t.parcel) {
                            del += '&supplyContractData%5Bselected%5D%5B%5D=' + t.offer;
                        }
                    })
                        .filter(c => !!c);

                    console.table(changes);
                    console.log(del);

                    const delUrl = `/${this.globals.info.realm}/main/unit/view/${info.id}/supply`;
                    const initialPromise = () => del ? Api.post(delUrl, 'contractDestroy=1' + del) : Promise.resolve();

                    return changes
                        .map(change => () => Api.postJson(`/${this.globals.info.realm}/ajax/unit/supply/create`, change))
                        .reduce((r, g) => r.then(g), initialPromise());
                });
            });
    }
}
