import { ICalculateChoice } from '../models/calculateChoice.model';

export class NotSelectedCalculateChoice implements ICalculateChoice {
    public label: string;
    public description: string;

    constructor() {
        this.label = '-';
        this.description = 'Not selected';
    }

    public calculate = (): number => {
        return NaN;
    }
}
