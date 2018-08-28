import { Market6pCalculateChoice } from './market6p';
import { NotSelectedCalculateChoice } from './notSelected';

export const AllCalculateChoices = [
    new NotSelectedCalculateChoice(),
    new Market6pCalculateChoice()
];
