import { SupplyService } from '../common/supply.service';
import { SupplyUnit } from '../models/supplyUnit.model';
import { WarehouseService } from '../../../../shared/data/warehouse.service';
import { IWarehouse } from '../../../../shared/models/warehouse.model';
import { WarehouseSupplyStrategies } from './strategies/supply/warehouseSupplyStrategies.component';

export class WarehouseSupplyService extends SupplyService {
    public strategies = WarehouseSupplyStrategies;
    public min = [];
    public max = [];

    private warehouseService: WarehouseService;

    constructor() {
        super();

        this.warehouseService = new WarehouseService();
    }

    public update = (unit: SupplyUnit): Promise<any> => {
        return this.warehouseService.getUnitInfo(unit.data)
            .then((info: IWarehouse) => {
                console.log(info);
            });
    }
}
