import { IUnitItem } from '../../../shared/globals/models/unitInfo.model';
import { IRetailSupplyStrategy } from './models/retailSupplyStrategy.model';
import { IRetailMinSupplyStrategy } from './models/retailMinSupplyStrategy.model';

export class RetailSupplyService {
    public updateUnitSupplies = (
        unitInfo: IUnitItem,
        supplyStrategy: IRetailSupplyStrategy,
        minSupply: IRetailMinSupplyStrategy
    ): Promise<any> => {
        unitInfo = unitInfo;
        supplyStrategy = supplyStrategy;
        minSupply = minSupply;
        return new Promise(resolve => resolve());
    }
}
