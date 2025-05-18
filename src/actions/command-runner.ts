import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { exec } from "child_process";

type Settings = {
    commandToRun?: string;
    commandArguments?: string;
    environmentVariables?: string;
    workingDirectory?: string;
};


@action({ UUID: "com.ellen-riemens.timetomato.command-runner" })
export class CommandRunner extends SingletonAction<Settings> {

    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const { settings } = ev.payload;

        let cmd = settings.commandToRun;
        if (cmd === undefined || cmd.length === 0) {
            streamDeck.logger.error("[command runner] No command to run");
            ev.action.showAlert();
            return;
        }

        let args = settings.commandArguments ?? "";
        let envVars = settings.environmentVariables ?? undefined;
        let cwd = settings.workingDirectory ?? undefined;

        function alert(error: boolean) {
            if (error) {
                streamDeck.logger.error("[command runner] Error running command");
                ev.action.showAlert();
            } else {
                streamDeck.logger.info("[command runner] Command completed successfully");
                ev.action.showOk();
            }
        }

        execCommand(cmd, args, envVars, cwd, alert);

        streamDeck.logger.info(`[command runner] Completed running command: ${cmd} ${args}`);
    }
}

function execCommand(
    cmd: string,
    args: string,
    envVars: string | undefined,
    cwd: string | undefined,
    alert: (error: boolean) => void
): void {
    let combined = cmd + " " + args;
    let execOptions = {};

    streamDeck.logger.info(`[command runner] Running command: ${combined}`);

    if (envVars !== undefined) {
        const env = parseEnvVars(envVars);

        execOptions = { ...execOptions, env };
    }

    if (cwd !== undefined) {
        execOptions = { ...execOptions, cwd };
    }

    exec(combined, execOptions, (error, stdout, stderr) => {
        if (error) {
            streamDeck.logger.error(`[command runner] error: ${error.message}`);
            alert(true);
            return;
        }
        if (stderr) {
            streamDeck.logger.error(`[command runner] stderr: ${stderr}`);
            alert(true);
            return;
        }
        streamDeck.logger.info(`[command runner] stdout: ${stdout}`);
        alert(false);
    });
}

function parseEnvVars(envVars: string): Record<string, string> {
    // Parse envVars string into an object (comma-separated)
    // Example: "VAR1=value1,VAR2=value2" => { VAR1: "value1", VAR2: "value2" }
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
    return env;
}
