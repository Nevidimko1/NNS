import { DateUtils } from '../../../utils/date';
import { LOG_STATUS } from '../../../shared/enums/logStatus.enum';
import { Status } from '../../../shared/status/status.singletone';
import { IStatusLog } from '../../../shared/status/models/statusLog.model';

export class StatusBarService {
    private status: Status;

    constructor() {
        this.status = Status.getInstance();
    }

    public addLog = (logItem: IStatusLog): void => {
        if (!logItem) {
            return;
        }

        let c = 'nns-text-grey';
        if (logItem.status === LOG_STATUS.ERROR) {
            c = 'nns-text-danger';
        }
        if (logItem.status === LOG_STATUS.SUCCESS) {
            c = 'nns-text-success';
        }

        const el = document.querySelector('#status-bar .logs') as any,
            scroll = (el.scrollHeight - el.scrollTop) <= el.offsetHeight;

        $('#status-bar .logs').append(`
            <div class="log-item ${c}">${DateUtils.time(logItem.date)}: ${logItem.text}</div>
        `);

        // scroll to last item if it was scrolled before adding new item
        if (scroll) {
            el.scrollTo(0, el.scrollHeight);
        }

        this.status.progressTick();
    }

}
