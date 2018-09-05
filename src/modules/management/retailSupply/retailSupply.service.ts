import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { IRetailSupplyStrategy } from './models/retailSupplyStrategy.model';
import { IRetailMinSupplyStrategy } from './models/retailMinSupplyStrategy.model';
import { RetailService } from '../../../shared/data/retail.service';

export class RetailSupplyService {
    private retailService: RetailService;

    constructor() {
        this.retailService = new RetailService();
    }

    public updateUnitSupplies = (
        unitInfo: IUnitItem,
        supplyStrategy: IRetailSupplyStrategy,
        minSupply: IRetailMinSupplyStrategy
    ): Promise<any> => {
        supplyStrategy = supplyStrategy;
        minSupply = minSupply;

        return this.retailService.getUnitInfo(unitInfo)
            .then(console.log);
    }
}
