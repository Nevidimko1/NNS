import { NotSelectedWarehouseSupplyStrategy } from './notSelected';
import { ZeroWarehouseSupplyStrategy } from './zero';

export const WarehouseSupplyStrategies = [
    new NotSelectedWarehouseSupplyStrategy(),
    new ZeroWarehouseSupplyStrategy()
];
