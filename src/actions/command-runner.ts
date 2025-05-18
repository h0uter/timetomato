import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { exec } from "child_process";


@action({ UUID: "com.ellen-riemens.timetomato.command-runner" })
export class CommandRunner extends SingletonAction<Settings> {

    override onWillAppear(ev: WillAppearEvent<Settings>): void | Promise<void> {
        return ev.action.setTitle(`cmd \n Runner`);
    }

    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const { settings } = ev.payload;

        let cmd = settings.commandToRun;
        if (cmd === undefined || cmd.length === 0) {
            streamDeck.logger.error("No command to run");
            ev.action.showAlert();
            return;
        }

        execCommand(settings.commandToRun!);
    }
}


function execCommand(cmd: string) {
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            streamDeck.logger.info(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            streamDeck.logger.info(`stderr: ${stderr}`);
            return;
        }
        streamDeck.logger.info(`stdout: ${stdout}`);
    });
}


type Settings = {
    commandToRun?: string;
};
