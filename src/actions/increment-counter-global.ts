import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
} from "@elgato/streamdeck";

const INCREMENT_GLOBAL_UUID = "com.ellen-riemens.timetomato.increment-global";
/**
 * Global settings type.
 */
type GlobalCounterSettings = {
    count?: number;
    incrementBy?: number;
};

@action({ UUID: INCREMENT_GLOBAL_UUID })
export class GlobalIncrementCounter extends SingletonAction<GlobalCounterSettings> {
    /** Whenever any key appears, show the shared count. */
    override async onWillAppear(ev: WillAppearEvent<GlobalCounterSettings>): Promise<void> {
        const { count = 0 } = await streamDeck.settings.getGlobalSettings<GlobalCounterSettings>();
        await ev.action.setTitle(`${count}`);
    }

    /** Bump the shared count and persist it. */
    override async onKeyDown(ev: KeyDownEvent<GlobalCounterSettings>): Promise<void> {
        const settings = await streamDeck.settings.getGlobalSettings<GlobalCounterSettings>();
        settings.incrementBy ??= 1;
        settings.count = (settings.count ?? 0) + settings.incrementBy;
        await streamDeck.settings.setGlobalSettings(settings);
    }
}

export async function GlobalSettingsChangeHandler(): Promise<void> {
    const globalSettings = await streamDeck.settings.getGlobalSettings<GlobalCounterSettings>();

    // for each action, if it is this one, update the title with the current count if the settings have changed.
    streamDeck.actions.forEach((action) => {
        if (action.manifestId === INCREMENT_GLOBAL_UUID) {
            action.setTitle(`${globalSettings.count}`);
            // build your SVG string
            const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <rect width="100%" height="100%" fill="#eee"/>
                <rect width="${globalSettings.count}%" height="100%" fill="#09f"/>
            </svg>
            `;
            action.setImage(`data:image/svg+xml,${encodeURIComponent(svg)}`);
        }
    });
}