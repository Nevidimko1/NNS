import { SoldRetailSupplyStrategy } from '../src/modules/management/retailSupply/strategies/supply/sold';

describe('my test', () => {

    it('> shoud be trthly', () => {
        const sold = new SoldRetailSupplyStrategy();
        console.log(sold.label);
        expect(sold.label).toBe('Sold 2x');
    });
});
