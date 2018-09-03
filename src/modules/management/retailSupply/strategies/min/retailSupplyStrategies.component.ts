import { ZeroRetailMinSupplyStrategy } from './zero';
import { OneRetailMinSupplyStrategy } from './one';

export const RetailMinSupplyStrategies = [
    new ZeroRetailMinSupplyStrategy(),
    new OneRetailMinSupplyStrategy()
];
