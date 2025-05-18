import streamDeck, { action, KeyDownEvent, KeyUpEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

const ACTION_UUID = "com.ellen-riemens.timetomato.increment-reset";
/**
 * Global settings type.
 */

type GlobalCounterSettings = {
    count?: number;
    incrementBy?: number;
    keyDownTime?: number;
};


@action({ UUID: ACTION_UUID })
export class IncrementCounterReset extends SingletonAction<CounterSettings> {

    override async onWillAppear(ev: WillAppearEvent<CounterSettings>): Promise<void> {
        const { count = 0 } = await streamDeck.settings.getGlobalSettings<GlobalCounterSettings>();
        await ev.action.setTitle(`${count}`);
    }

    override async onKeyDown(_: KeyDownEvent<CounterSettings>): Promise<void> {
        const settings = await streamDeck.settings.getGlobalSettings<GlobalCounterSettings>();

        settings.keyDownTime = getTimeSecs();

        await streamDeck.settings.setGlobalSettings(settings);
        streamDeck.logger.info(`Key down`);

    }

    override async onKeyUp(ev: KeyUpEvent<CounterSettings>): Promise<void> {
        const LONGPRESS_DURATION = 2;

        const settings = await streamDeck.settings.getGlobalSettings<GlobalCounterSettings>();

        settings.incrementBy ??= 1;
        settings.keyDownTime ??= getTimeSecs();
        streamDeck.logger.info();
        let duration = getTimeSecs() - settings.keyDownTime;
        streamDeck.logger.info(`Key was held down for ${duration} seconds`);
        if (duration >= LONGPRESS_DURATION) {
            // longpressed so we reset the count
            settings.count = 0;
        } else {
            settings.count = (settings.count ?? 0) + settings.incrementBy;
        }

        await streamDeck.settings.setGlobalSettings(settings);

        // Update the current count in the action's settings, and change the title.
        await ev.action.setTitle(`${settings.count}`);
    }
}

function getTimeSecs(): number {
    const date = new Date();
    return Math.floor(date.getTime() / 1000);
}

export async function resetGlobalSettingsChangeHandler(): Promise<void> {
    const globalSettings = await streamDeck.settings.getGlobalSettings<GlobalCounterSettings>();

    // for each action, if it is this one, update the title with the current count if the settings have changed.
    streamDeck.actions.forEach(async (action) => {
        if (action.manifestId === ACTION_UUID) {
            await action.setTitle(`${globalSettings.count}`);
            // build your SVG string
            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <rect width="100%" height="100%" fill="#eee"/>
                <rect width="${globalSettings.count}%" height="100%" fill="#09f"/>
                </svg>
            `;

            // is setting the image takes some time, and we press te button too fast we can get weird behavior.
            await action.setImage(`data:image/svg+xml,${encodeURIComponent(svg)}`);
        }
    });
}

/**
 * Settings for {@link IncrementCounterWouter}.
 */
type CounterSettings = {
    _?: number;
};
