import { NotSelectedWarehouseSupplyStrategy } from './notSelected';
import { ZeroWarehouseSupplyStrategy } from './zero';
import { Sold3WarehouseSupplyStrategy } from './sold3x';

export const WarehouseSupplyStrategies = [
    new NotSelectedWarehouseSupplyStrategy(),
    new ZeroWarehouseSupplyStrategy(),
    new Sold3WarehouseSupplyStrategy()
];
