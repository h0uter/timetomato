import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { IncrementCounter } from "./actions/increment-counter";
import { IncrementCounterWouter } from "./actions/increment-counter-wouter";
import { IncrementCounterReset, resetGlobalSettingsChangeHandler } from "./actions/increment-counter-reset";
import { CommandRunner } from "./actions/command-runner";
// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.INFO);


// Register the increment action.
streamDeck.actions.registerAction(new IncrementCounter());
streamDeck.actions.registerAction(new IncrementCounterWouter());
streamDeck.actions.registerAction(new IncrementCounterReset());
streamDeck.actions.registerAction(new CommandRunner());

streamDeck.settings.onDidReceiveGlobalSettings(resetGlobalSettingsChangeHandler);

// Finally, connect to the Stream Deck.
streamDeck.connect();
