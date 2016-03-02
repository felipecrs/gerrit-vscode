import { window, InputBoxOptions } from "vscode";
import { Gerrit } from "./gerrit";
import { Ref } from "./ref";
import { Logger } from "./logger";
import * as utils from "./utils";

export class GerritController {
    private logger: Logger;

    constructor(private gerrit: Gerrit) {
        this.logger = Logger.logger;
    }

    public stageCurrentFile() {
        let path: string = window.activeTextEditor.document.fileName;
        this.gerrit.stage(path);
    }

    public commit() {
        let options: InputBoxOptions = {
            placeHolder: "Commit Message",
            prompt: "The commit description"
        };

        window.showInputBox(options).then(message => {
            this.gerrit.commit(message, [""], false);
        }, reason => {
        });
    }

    public commitAmend() {
        // TODO: should not require new commit message
        this.gerrit.commit("", [""], true);
    }

    public checkoutBranch() {
        let options: InputBoxOptions = {
            value: "master",
            prompt: "The branch to checkout"
        };

        window.showInputBox(options).then(branch => {
            this.gerrit.checkoutBranch(branch);
        }, reason => {
        });
    }

    public checkoutRevision() {
        let revisionOptions: InputBoxOptions = {
            placeHolder: "Ref Number",
            validateInput: utils.isValidNumber,
            prompt: "The revision to checkout"
        };

        window.showInputBox(revisionOptions).then(refString => {
            if (utils.isValidNumber(refString) !== null) {
                window.showWarningMessage("Valid Ref number not entered");
                return;
            }
            let refId = parseInt(refString);
            let patchsetOptions: InputBoxOptions = revisionOptions;
            patchsetOptions.placeHolder = `Patchset for Ref: ${refString}`;
            patchsetOptions.prompt = "The patchset to checkout";

            window.showInputBox(patchsetOptions).then(patchString => {
                if (utils.isValidNumber(patchString) !== null) {
                    window.showWarningMessage("Valid PatchSetnumber not entered");
                    return;
                }
                let patchId = parseInt(patchString);
                let newRef: Ref = new Ref(refId, patchId);
                this.gerrit.checkoutRef(newRef);
            }, reason => {
            });
        }, reason => {
        });
    }

    public cherrypickRevision() {
        let revisionOptions: InputBoxOptions = {
            placeHolder: "Ref Number",
            validateInput: utils.isValidNumber,
            prompt: "The revision to cherrypick"
        };

        window.showInputBox(revisionOptions).then(refString => {
            if (utils.isValidNumber(refString) !== null) {
                window.showWarningMessage("Valid Ref number not entered");
                return;
            }
            let refId = parseInt(refString);
            let patchsetOptions: InputBoxOptions = revisionOptions;
            patchsetOptions.placeHolder = `Patchset for Ref: ${refString}`;
            patchsetOptions.prompt = "The patchset to cherrypick";

            window.showInputBox(patchsetOptions).then(patchString => {
                if (utils.isValidNumber(patchString) !== null) {
                    window.showWarningMessage("Valid PatchSetnumber not entered");
                    return;
                }
                let patchId = parseInt(patchString);
                let newRef: Ref = new Ref(refId, patchId);
                this.gerrit.cherrypickRef(newRef);
            }, reason => {
            });
        }, reason => {
        });
    }

    public cherrypickContinue() {
        this.gerrit.cherrypickContinue();
    }

    public push() {
        let options: InputBoxOptions = {
            value: "master",
            prompt: "The branch to push"
        };

        window.showInputBox(options).then(branch => {
            this.gerrit.push(branch);
        }, reason => {
        });
    }

    public rebase() {
        let rebaseOptions: InputBoxOptions = {
            placeHolder: "master",
            prompt: "The branch to rebase"
        };

        window.showInputBox(rebaseOptions).then(branch => {
            this.gerrit.rebase(branch);
        }, reason => {
        });
    }

    public rebasentinue() {
        this.gerrit.rebaseContinue();
    }
}