import { LOG_STATUS } from '../../enums/logStatus.enum';

export interface IStatusLog {
    date: Date;
    text: string;
    status: LOG_STATUS;
}
