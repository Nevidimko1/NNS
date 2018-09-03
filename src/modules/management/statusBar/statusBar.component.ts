import { StatusBarService } from './statusBar.service';
import { Status } from '../../../shared/status/status.singletone';
import { LOG_STATUS } from '../../../shared/enums/logStatus.enum';
import { PROGRESS_STAGES } from '../../../shared/enums/progress.enum';
import { Globals } from '../../../shared/globals/globals.singletone';
import { Storage } from '../../../utils/storage';
import { IStatusBarSettings } from './models/statusBar.settings.model';

export class StatusBar {
    private readonly storageKey: string;

    private globals: Globals;
    private service: StatusBarService;
    private status: Status;

    private minimized: boolean;
    private size: number;

    constructor() {
        this.globals = Globals.getInstance();
        this.service = new StatusBarService();
        this.status = Status.getInstance(this.onStatusChange);

        this.storageKey = `${this.globals.info.realm}/${this.globals.companyInfo.id}/${this.globals.pageInfo.pageType}/StatusBar`;

        this.minimized = false;
        this.size = 1;
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

    private toggleMinimize = (value: boolean): void => {
        this.minimized = value;
        if (this.minimized) {
            $('#nns-status-minimize').addClass('nns-hidden');
            $('#nns-status-maximize').removeClass('nns-hidden');
            $('#status-bar .body').addClass('nns-hidden');
        } else {
            $('#nns-status-minimize').removeClass('nns-hidden');
            $('#nns-status-maximize').addClass('nns-hidden');
            $('#status-bar .body').removeClass('nns-hidden');
        }
    }

    private resize = (newSize?: number): void => {
        if (!newSize) {
            this.size = this.size < 3 ? this.size + 1 : 1;
        } else {
            this.size = newSize;
        }

        $('#status-bar .body').css('height', this.size * 100 + 'px');
    }

    private updateSettings = (): void => {
        const settings: IStatusBarSettings = {
            minimized: this.minimized,
            size: this.size
        };
        Storage.set(this.storageKey, settings, new Date());
    }

    private loadSettings = (): void => {
        const restored = Storage.get(this.storageKey),
            settings: IStatusBarSettings = restored ? restored.body.data : {};

        this.minimized = settings.minimized || false;
        this.size = settings.size || 1;
        this.toggleMinimize(this.minimized);
        this.resize(this.size);
    }

    public addStatusBar = (): void => {
        $('table.unit-list-2014').before(`
            <div id="status-bar">
                <div class="header d-flex">
                    <div class="flex-grow">
                        NNS script
                    </div>
                    <div class="actions">
                        <i id="nns-status-clear-log" class="action-item mr-10 fa fa-trash-o" aria-hidden="true" title="Clear logs"></i>
                        <i id="nns-status-resize" class="action-item fa fa-angle-double-down" aria-hidden="true" title="Resize"></i>
                        <i id="nns-status-minimize" class="action-item fa fa-minus-square" aria-hidden="true" title="Minimize"></i>
                        <i id="nns-status-maximize" class="action-item fa fa-plus-square nns-hidden" aria-hidden="true"
                            title="Maximize"></i>
                    </div>
                </div>
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

        $('#nns-status-clear-log').on('click', () => {
            $('#status-bar .body .logs').html('');
        });
        $('#nns-status-resize').on('click', () => {
            this.resize();
            this.updateSettings();
        });
        $('#nns-status-minimize').on('click', () => {
            this.toggleMinimize(!this.minimized);
            this.updateSettings();
        });
        $('#nns-status-maximize').on('click', () => {
            this.toggleMinimize(!this.minimized);
            this.updateSettings();
        });

        this.status.log('NNS script started', LOG_STATUS.SUCCESS);

        this.loadSettings();
    }

}
