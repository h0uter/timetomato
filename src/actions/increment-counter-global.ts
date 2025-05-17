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
        }
    });
}