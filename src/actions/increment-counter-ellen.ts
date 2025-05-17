import streamDeck, {
    action,
    KeyDownEvent,
    SingletonAction,
    WillAppearEvent,
    DidReceiveGlobalSettingsEvent
  } from "@elgato/streamdeck";
  
  /**
   * Shared settings shape.
   */
  type CounterSettings = {
    count?: number;
    incrementBy?: number;
  };
  
  @action({ UUID: "com.ellen-riemens.timetomato.increment" })
  export class GlobalIncrementCounter extends SingletonAction<CounterSettings> {
    /** Whenever any key appears, show the shared count. */
    override async onWillAppear(ev: WillAppearEvent<CounterSettings>): Promise<void> {
      const { count = 0 } = await streamDeck.settings.getGlobalSettings<CounterSettings>();
      await ev.action.setTitle(`${count}`);
    }
  
    /** Bump the shared count and persist it. */
    override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
      const settings = await streamDeck.settings.getGlobalSettings<CounterSettings>();
      settings.incrementBy ??= 1;
      settings.count = (settings.count ?? 0) + settings.incrementBy;
      await streamDeck.settings.setGlobalSettings(settings);
      // no manual setTitle needed – next event will fire onDidReceiveGlobalSettings
    }
  
    /**
     * Fired in every context whenever the global settings change.
     * We use it to update each button's title to the new count.
     */
    override async onDidReceiveGlobalSettings(ev: DidReceiveGlobalSettingsEvent<CounterSettings>): Promise<void> {
      const count = ev.payload.settings.count ?? 0;
      await ev.action.setTitle(`${count}`);
    }
  }
  