import { DateUtils } from '../../utils/date';
import { IStatusProgress } from './models/statusProgress.model';
import { IStatusLog } from './models/statusLog.model';
import { LOG_STATUS } from '../enums/logStatus.enum';
import { PROGRESS_STAGES } from '../enums/progress.enum';

export class Status {
    private static instance: Status;

    public progress: IStatusProgress;
    public restCalls: number;
    public progressStage: PROGRESS_STAGES;

    private startedAt: Date;
    private logs: IStatusLog[];
    private changeCallbacks: Function[];
    private progressInterval: any;

    constructor() {
        this.progressStage = PROGRESS_STAGES.NOT_STARTED;
        this.changeCallbacks = [];
        this.logs = [];
    }

    private notify = (): void => {
        this.changeCallbacks.forEach(cb => cb());
    }

    private stop = (): void => {
        this.progressStage = PROGRESS_STAGES.DONE;

        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    public progressTick = (): void => {
        if (this.progressStage !== PROGRESS_STAGES.IN_PROGRESS) {
            return;
        }

        this.progress.current++;

        if (this.progress.current === this.progress.target) {
            this.stop();
        }

        this.notify();
    }

    public elapsed(): string {
        const now = new Date(),
            offset = now.getTimezoneOffset() * 60000;
        return DateUtils.time(new Date(now.getTime() - this.startedAt.getTime() + offset));
    }

    public start = (ticksToComplete: number): boolean => {
        if (!ticksToComplete) {
            return false;
        }
        this.progress = { current: 0, target: ticksToComplete };
        this.restCalls = 0;
        this.startedAt = new Date();
        this.progressStage = PROGRESS_STAGES.IN_PROGRESS;

        // elapsed time should be updated once per second
        this.progressInterval = setInterval(this.notify, 1000);
        this.notify();

        return true;
    }

    public reset = (): void => {
        this.progress = { current: 0, target: 0 };
        this.restCalls = 0;
        this.startedAt = new Date();
        this.progressStage = PROGRESS_STAGES.NOT_STARTED;
        this.notify();
    }

    public restCallUsed = (): void => {
        this.restCalls++;
        this.notify();
    }

    public log = (text: string, status: LOG_STATUS = LOG_STATUS.NORMAL): void => {
        this.logs.push({ date: new Date(), text, status});
        this.notify();
    }

    public popLog = (): IStatusLog => {
        return this.logs.pop();
    }

    static getInstance(cb?: Function): Status {
        if (!Status.instance) {
            Status.instance = new Status();
        }

        if (cb) {
            Status.instance.changeCallbacks.push(cb);
        }

        return Status.instance;
    }

}
