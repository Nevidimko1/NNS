import { NotSelectedWarehouseSupplyStrategy } from './notSelected';
import { ZeroWarehouseSupplyStrategy } from './zero';
import { SoldWarehouseSupplyStrategy } from './sold';

export const WarehouseSupplyStrategies = [
    new NotSelectedWarehouseSupplyStrategy(),
    new ZeroWarehouseSupplyStrategy(),
    new SoldWarehouseSupplyStrategy()
];
