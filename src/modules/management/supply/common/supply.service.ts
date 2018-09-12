import { SupplyUnit } from '../models/supplyUnit.model';

export abstract class SupplyService {
    public strategies = [];
    public min = [];
    public max = [];

    public update = (unit: SupplyUnit): Promise<any> => Promise.resolve();

}
