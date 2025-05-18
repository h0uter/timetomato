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
            streamDeck.logger.error("[command runner] No command to run");
            ev.action.showAlert();
            return;
        }

        let args = settings.commandArguments ?? "";
        let envVars = settings.environmentVariables ?? "";

        execCommand(cmd, args, envVars);

        streamDeck.logger.info(`[command runner] Completed running command: ${cmd} ${args}`);
    }
}


function execCommand(cmd: string, args: string, envVars: string) {
    let combined = cmd + " " + args;

    streamDeck.logger.info(`[command runner] Running command: ${combined}`);

    // Parse envVars string into an object (comma-separated)
    const env: Record<string, string> = Object.fromEntries(
        Object.entries(process.env).filter(([_, v]) => typeof v === "string") as [string, string][]
    );

    if (envVars && envVars.trim().length > 0) {
        envVars.split(",").forEach(pair => {
            const trimmed = pair.trim();
            if (!trimmed) return;
            const [key, ...valParts] = trimmed.split("=");
            if (key && valParts.length > 0) {
                env[key] = valParts.join("=");
            }
        });
    }

    exec(combined, { env }, (error, stdout, stderr) => {
        if (error) {
            streamDeck.logger.error(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            streamDeck.logger.error(`stderr: ${stderr}`);
            return;
        }
        streamDeck.logger.info(`[command runner] stdout: ${stdout}`);
    });
}


type Settings = {
    commandToRun?: string;
    commandArguments?: string;
    environmentVariables?: string;
};
