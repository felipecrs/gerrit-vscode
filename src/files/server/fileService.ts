import { BasicFileContainer } from "../basicFileContainer";
import * as fileCommon from "../common";
import { BasicGit } from "../../git/basicGit";
import * as gitCommon from "../../git/common";
import * as utils from "../../common/utils";

// TODO: Make GlobalFileContainer singleton
export class FileService extends BasicFileContainer {
    private git: BasicGit;


    constructor() {
        super();
        this.git = BasicGit.getInstance();
    }

    updateFiles() {
        let filter = (values: fileCommon.IUpdateResult[], search: gitCommon.GitStatus) => {
            return values.find((value, index, obj) => {
                return (value.status === search);
            });
        };
        return Promise.all([
            this.updateIndex(),
            this.updateModified(),
            this.updateDeleted(),
            this.updateUntracked(),
            // TODO: add staged, as this is the only type which could be a second property of a file
            // this.updateStaged()
        ]).then(values => {
            this.clear();
            this.push(filter(values, gitCommon.GitStatus.CLEAN).container);
            this.push(filter(values, gitCommon.GitStatus.DELETED).container);
            this.push(filter(values, gitCommon.GitStatus.MODIFIED).container);
            this.push(filter(values, gitCommon.GitStatus.UNTRACKED).container);
        });
    }

    private updateIndex(): Promise<fileCommon.IUpdateResult> {
        return this.updateType(gitCommon.GitStatus.CLEAN);
    }

    private updateModified(): Promise<fileCommon.IUpdateResult> {
        return this.updateType(gitCommon.GitStatus.MODIFIED, ["--exclude-standard", "-m"]);
    }

    private updateDeleted(): Promise<fileCommon.IUpdateResult> {
        return this.updateType(gitCommon.GitStatus.DELETED, ["--exclude-standard", "-d"]);
    }

    private updateUntracked(): Promise<fileCommon.IUpdateResult> {
        return this.updateType(gitCommon.GitStatus.UNTRACKED, ["--exclude-standard", "-o"]);
    }

    private updateStaged(): Promise<fileCommon.IUpdateResult> {
        return this.updateType(gitCommon.GitStatus.STAGED, ["--name-only", "--cached"]);
    }

    private updateType(type: gitCommon.GitStatus, options?: string[]): Promise<fileCommon.IUpdateResult> {
        let value: Promise<string>;
        switch (type) {
            case gitCommon.GitStatus.STAGED:
                value = this.git.diff([], options);
                break;
            case gitCommon.GitStatus.CLEAN:
            case gitCommon.GitStatus.MODIFIED:
            case gitCommon.GitStatus.DELETED:
            case gitCommon.GitStatus.UNTRACKED:
                value = this.git.ls_files(options);
        }
        return value.then(value => {
            return this.parseUpdate(value, type);
        });
    }

    private parseUpdate(value: string, type: gitCommon.GitStatus): fileCommon.IUpdateResult {
        let container: fileCommon.IFile[] = [];
        let files: string[] = value.split(utils.SPLIT_LINE);
        for (let i in files) {
            if (files[i] === "") {
                continue;
            }
            container.push({
                path: files[i],
                status: type
            });
        }
        return { status: type, container: container };
    }

    getDescriptorsByType(type: gitCommon.GitStatus[]): fileCommon.BasciFileQuickPick[] {
        let descriptors: fileCommon.BasciFileQuickPick[] = [];
        for (let status in type) {
            let files = this.getByType([type[status]]);
            files.forEach((value, index, map) => {
                descriptors.push({
                    label: value.path,
                    path: value.path,
                    description: gitCommon.GitStatus[value.status]
                });
            });
        }
        return descriptors;
    }
}