import { derived } from "svelte/store";

import { svelteFlowStore } from "./svelteflow";

import type { OnInit } from "../types";

export function onInitHandler(onInit: OnInit<any> | undefined) {
    let isInitialized : boolean = false;

    const initStore = derived(svelteFlowStore(), $svelteFlowStore => {
        if (!isInitialized && $svelteFlowStore.viewportInitialized && onInit) {
            setTimeout(() => onInit($svelteFlowStore), 1);
            isInitialized = true;
        }

        return isInitialized;
    });

    return initStore;
}