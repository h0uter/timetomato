import { action, KeyDownEvent, KeyUpEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.ellen-riemens.timetomato.increment-wouter" })
export class IncrementCounterWouter extends SingletonAction<CounterSettings> {
    /**
     * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible. This could be due to the Stream Deck first
     * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
     * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
     */
    override onWillAppear(ev: WillAppearEvent<CounterSettings>): void | Promise<void> {
        return ev.action.setTitle(`w\n${ev.payload.settings.count ?? 0}`);
    }

    /**
     * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
     * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
     * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
     * settings using `setSettings` and `getSettings`.
     */
    override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
        // Update the count from the settings.
        const { settings } = ev.payload;
        settings.incrementBy ??= 1;


        settings.time = getTimeSecs();
        await ev.action.setSettings(settings);
    }

    override async onKeyUp(ev: KeyUpEvent<CounterSettings>): Promise<void> {
        const LONGPRESS_DURATION = 1;
        const LONGPRESS_INCREMENT = 100;

        const { settings } = ev.payload;

        settings.incrementBy ??= 1;
        settings.time ??= getTimeSecs();

        if (getTimeSecs() - settings.time > LONGPRESS_DURATION) {
            settings.count = (settings.count ?? 0) + settings.incrementBy * LONGPRESS_INCREMENT;
        } else {
            settings.count = (settings.count ?? 0) + settings.incrementBy;
        }

        // Update the current count in the action's settings, and change the title.
        await ev.action.setSettings(settings);
        await ev.action.setTitle(`w\n${settings.count}`);
    }
}

function getTimeSecs(): number {
    const date = new Date();
    return Math.floor(date.getTime() / 1000);
}

/**
 * Settings for {@link IncrementCounterWouter}.
 */
type CounterSettings = {
    count?: number;
    incrementBy?: number;
    time?: number;
};
