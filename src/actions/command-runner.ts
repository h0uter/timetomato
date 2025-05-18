import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { exec, spawn } from "child_process";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.ellen-riemens.timetomato.command-runner" })
export class CommandRunner extends SingletonAction<CounterSettings> {

    override onWillAppear(ev: WillAppearEvent<CounterSettings>): void | Promise<void> {
        return ev.action.setTitle(`cmd \n Runner`);
    }

    override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
        // Update the count from the settings.
        const { settings } = ev.payload;

        let cmd = settings.commandToRun;
        if (cmd === undefined || cmd.length === 0) {
            streamDeck.logger.info("No command to run");
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

/**
 * Settings for {@link IncrementCounter}.
 */
type CounterSettings = {
    commandToRun?: string;
};
