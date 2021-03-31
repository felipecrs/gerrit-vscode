import Event from "../common/event";

type Credentials = {
    username: string;
    password: string;
};
export interface SettingsExport {
    url: string;
    project: string;
    credentials: Credentials;
    showLog: boolean;
    workspaceRoot: string;
    extensionRoot: string;
}

class Settings {
    private _active: boolean;
    private _showLog: boolean;
    private _url: string;
    private _credentials: Credentials;
    private _project: string;
    private _workspaceRoot: string;
    private _extensionRoot: string;
    private static instance: Settings;

    private constructor() { }

    public static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.instance = new Settings();
        }
        return Settings.instance;
    }

    public loadSettings(settings: any): void {
        this._active = settings.active;
        this._url = settings.url;
        this._project = settings.project;
        this._credentials = settings.credentials[this._url];
        this._showLog = settings.showLog;
        this.emitUpdate();
    }

    exportSettings(): SettingsExport {
        return {
            url: this._url,
            project: this._project,
            credentials: this._credentials,
            showLog: this._showLog,
            workspaceRoot: this._workspaceRoot,
            extensionRoot: this._extensionRoot
        };
    }

    private emitUpdate() {
        Event.emit("settings-update");
    }

    get active(): boolean {
        return this._active;
    }

    get url(): string {
        return this._url;
    }

    get credentials(): Credentials {
        return this._credentials;
    }

    get project(): string {
        return this._project;
    }

    set project(project: string) {
        this._project = project;
        this.emitUpdate();
    }

    get showLog(): boolean {
        return this._showLog;
    }

    get workspaceRoot(): string {
        return this._workspaceRoot;
    }

    set workspaceRoot(value: string) {
        this._workspaceRoot = value;
        this.emitUpdate();
    }

    get extensionRoot(): string {
        return this._extensionRoot;
    }

    set extensionRoot(value: string) {
        this._extensionRoot = value;
        this.emitUpdate();
    }
}

export default Settings;
export { Settings };
