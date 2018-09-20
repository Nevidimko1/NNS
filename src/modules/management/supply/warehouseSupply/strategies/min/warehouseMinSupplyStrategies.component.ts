import { ZeroWarehouseMinSupplyStrategy } from './zero';
import { OneWarehouseMinSupplyStrategy } from './one';
import { TenWarehouseMinSupplyStrategy } from './ten';

export const WarehouseMinSupplyStrategies = [
    new ZeroWarehouseMinSupplyStrategy(),
    new OneWarehouseMinSupplyStrategy(),
    new TenWarehouseMinSupplyStrategy()
];
