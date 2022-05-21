import { readable, Readable, Subscriber } from "svelte/store";

import type { KeyCode } from "../types";

type Keys = Array<string>;
type PressedKeys = Set<string>;
type KeyOrCode = "key" | "code";

export interface KeyPressOptions {
  target: Window | Document | HTMLElement | ShadowRoot | null;
}

const doc = typeof document !== "undefined" ? document : null;

function isInputDOMNode(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement;

  return (
    ["INPUT", "SELECT", "TEXTAREA"].includes(target?.nodeName) ||
    target?.hasAttribute("contenteditable")
  );
}

function useKeyOrCode(eventCode: string, keysToWatch: KeyCode): KeyOrCode {
  return keysToWatch.includes(eventCode) ? "code" : "key";
}

function isMatchingKey(
  keyCodes: Array<Keys>,
  pressedKeys: PressedKeys,
  isUp: boolean
): boolean {
  return keyCodes
    .filter((keys) => isUp || keys.length === pressedKeys.size)
    .some((keys) => keys.every((k) => pressedKeys.has(k)));
}

export const keyPressed = (
  keyCode: KeyCode | null = null,
  options: KeyPressOptions = { target: doc }
): Readable<boolean> => {
  const pressed = readable<boolean>(
    false,
    function start(set: Subscriber<boolean>) {
      const pressedKeys = new Set([]);

      let keyCodes: Array<Keys> = [];
      let keysToWatch: Keys = [];

      if (keyCode !== null) {
        const keyCodeArray = Array.isArray(keyCode) ? keyCode : [keyCode];

        keyCodes = keyCodeArray
          .filter((kc) => typeof kc === "string")
          .map((kc) => kc.split("+"));
        keysToWatch = keyCodes.reduce(
          (res: Keys, item) => res.concat(...item),
          []
        );

        const downHandler = (event: KeyboardEvent) => {
          if (isInputDOMNode(event)) {
            return false;
          }

          const KeyOrCode = useKeyOrCode(event.code, keysToWatch);
          pressedKeys.add(event[KeyOrCode]);

          if (isMatchingKey(keyCodes, pressedKeys, false)) {
            event.preventDefault();
            set(true);
          }
        };

        const upHandler = (event: KeyboardEvent) => {
          if (isInputDOMNode(event)) {
            return false;
          }

          const keyOrCode = useKeyOrCode(event.code, keysToWatch);

          if (isMatchingKey(keyCodes, pressedKeys, true)) {
            set(false);
            pressedKeys.clear();
          } else {
            pressedKeys.delete(event[keyOrCode]);
          }
        };

        const resetHandler = () => {
          pressedKeys.clear();
          set(false);
        };

        options?.target?.addEventListener("keydown", downHandler);
        options?.target?.addEventListener("keyup", upHandler);
        window.addEventListener("blur", resetHandler);

        return function stop() {
          options?.target?.removeEventListener("keydown", downHandler);
          options?.target?.removeEventListener("keyup", upHandler);
          window.removeEventListener("blur", resetHandler);
        };
      }
    }
  );

  return pressed;
};
