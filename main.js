import { run } from './game.js';
import pacmanDirectionHandler from './task.js';
import { GAME_SETTINGS } from './settings.js';

run({
    pacmanDirectionHandler,
    settings: GAME_SETTINGS.secondTask,
    showTestOutput: true,
    turnLimit: 1000,
    turnTimeMs: 30,
});

// secondTask[0] - 511
// secondTask[1] - 713
// secondTask[2] - 596
// secondTask[3] - 631
// secondTask[4] - 618