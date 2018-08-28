import { ICalculateChoice } from '../models/calculateChoice.model';

export class Market6pCalculateChoice implements ICalculateChoice {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Market 6%';
        this.description = 'Reach 6% of market share';
    }

    public calculate = (): number => {
        return 0;
    }
}
