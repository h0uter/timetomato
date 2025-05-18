# timetomato

Streamdeck plugin for timer

# Resources

timers

- old official elgato reliable timer example: <https://github.com/elgatosf/streamdeck-timerfix>
- tasktimer: <https://github.com/75py/streamdeck-tasktimer/blob/main/Sources/com.nagopy.streamdeck.tasktimer.sdPlugin/app.js>
- tomato-timer: <https://github.com/gallowaylabs/streamdeck-tomato-timer/blob/main/Sources/js/app.js>
- stopwatch: <https://github.com/gabe565/streamdeck-stopwatch/blob/main/src/com.gabe565.stopwatch.sdPlugin/js/Stopwatch.js>

## Running shell commands notes

```typescript
function getGitUser(callback) {
    execute("git config --global user.name", function (name) {
        execute("git config --global user.email", function (email) {
            callback({ name: name.replace("\n", ""), email: email.replace("\n", "") });
        });
    });
};

import { exec } from "child_process";

exec("ls -la", (error, stdout, stderr) => {
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
```
