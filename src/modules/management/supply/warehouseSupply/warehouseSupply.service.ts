import { SupplyService } from '../common/supply.service';
import { SupplyUnit } from '../models/supplyUnit.model';

export class WarehouseSupplyService extends SupplyService {
    public strategies = [];
    public min = [];
    public max = [];

    constructor() {
        super();
    }

    public update = (info: SupplyUnit): Promise<any> => Promise.resolve();
}
