export class CalcFunctions {
    public static calcBaseRetailPrice = (myQuality: number, localPrice: number, localQuality: number): number => {
        if (myQuality === 0 || localPrice === 0 || localQuality === 0) {
            throw new Error('Arguments must be > 0');
        }

        return Math.max(localPrice * (1 + Math.log(myQuality / localQuality)), 0, 4);
    }
}
