import { InfinityWarehouseMinSupplyStrategy } from './infinity';
import { OneMWarehouseMinSupplyStrategy } from './1m';
import { TenMWarehouseMinSupplyStrategy } from './10m';
import { HundredMWarehouseMinSupplyStrategy } from './100m';
import { OneBWarehouseMinSupplyStrategy } from './1b';

export const WarehouseMaxSupplyStrategies = [
    new InfinityWarehouseMinSupplyStrategy(),
    new OneMWarehouseMinSupplyStrategy(),
    new TenMWarehouseMinSupplyStrategy(),
    new HundredMWarehouseMinSupplyStrategy(),
    new OneBWarehouseMinSupplyStrategy()
];
