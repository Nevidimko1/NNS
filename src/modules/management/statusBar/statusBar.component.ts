import { StatusBarService } from './statusBar.service';
import { Status } from '../../../shared/status/status.singletone';
import { LOG_STATUS } from '../../../shared/enums/logStatus.enum';
import { PROGRESS_STAGES } from '../../../shared/enums/progress.enum';

export class StatusBar {
    private service: StatusBarService;
    private status: Status;

    constructor() {
        this.status = Status.getInstance(this.onStatusChange);
        this.service = new StatusBarService();
    }

    private onStatusChange = (): void => {
        let s = '';
        if (this.status.progressStage === PROGRESS_STAGES.IN_PROGRESS) {
            s = '<span class="nns-text-warning">In progress</span>';
        } else if (this.status.progressStage === PROGRESS_STAGES.DONE) {
            s = '<span class="nns-text-success">Done!</span>';
        }
        $('#status-bar .status-status').html(`${s}`);

        if (this.status.progressStage !== PROGRESS_STAGES.NOT_STARTED) {
            $('#status-bar .status-progress').html(`<span>${this.status.progress.current} / ${this.status.progress.target}</span>`);
            $('#status-bar .status-rest-calls').html(`${this.status.restCalls}`);
            $('#status-bar .status-time').html(`${this.status.elapsed()}`);
        }

        // check incoming log message
        this.service.addLog(this.status.popLog());
    }

    public addStatusBar = (): void => {
        $('table.unit-list-2014').before(`
            <div id="status-bar">
                <div class="header">NNS script</div>
                <div class="body">
                    <div class="status">
                        <div class="status-item"><div class="status-label">Status:</div> <span class="status-status"></span></div>
                        <div class="status-item"><div class="status-label">Progress:</div> <span class="status-progress"></span></div>
                        <div class="status-item"><div class="status-label">REST calls:</div> <span class="status-rest-calls"></span></div>
                        <div class="status-item"><div class="status-label">Time elaplsed:</div> <span class="status-time"></span></div>
                    </div>
                    <div class="logs"></div>
                </div>
            </div>
        `);

        this.status.log('NNS script started', LOG_STATUS.SUCCESS);
    }

}
