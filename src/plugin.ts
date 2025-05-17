import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";
import { IncrementCounterWouter } from "./actions/increment-counter-wouter";
import { GlobalIncrementCounter, GlobalSettingsChangeHandler } from "./actions/increment-counter-global";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);


// Register the increment action.
streamDeck.actions.registerAction(new IncrementCounter());
streamDeck.actions.registerAction(new IncrementCounterWouter());
streamDeck.actions.registerAction(new GlobalIncrementCounter());

streamDeck.settings.onDidReceiveGlobalSettings(GlobalSettingsChangeHandler)

// Finally, connect to the Stream Deck.
streamDeck.connect();
