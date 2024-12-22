import { createEvent, createStore } from "effector";
import { debug } from "patronum";

export const incrementClicked = createEvent();
export const $counter = createStore(0);

$counter.on(incrementClicked, (counter) => counter + 1);

debug({ trace: true }, $counter);
