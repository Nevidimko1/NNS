import { NotSelectedRetailSupplyStrategy } from './notSelected';
import { ZeroRetailSupplyStrategy } from './zero';
import { SoldRetailSupplyStrategy } from './sold';

export const RetailSupplyStrategies = [
    new NotSelectedRetailSupplyStrategy(),
    new ZeroRetailSupplyStrategy(),
    new SoldRetailSupplyStrategy()
];
