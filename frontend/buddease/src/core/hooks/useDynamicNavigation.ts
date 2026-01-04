useDynamicNavigation.ts
import { useNavigation } from "@/core/state/context/NavigationContext";
import { useEffect, useRef } from "react";

/**
 * condition: a boolean OR a function returning boolean
 * path: target path
 * view: optional view name
 * options:
 *  - direction: "none" | "backward" | "forward"  (controls custom stack navigation)
 *  - once: boolean - only trigger once when condition becomes true
 */
export const useDynamicNavigation = (
  condition: boolean | (() => boolean),
  path: string,
  view?: string,
  options?: { direction?: "none" | "backward" | "forward"; once?: boolean }
) => {
  const nav = useNavigation();
  const triggered = useRef(false);
  const getCondition = typeof condition === "function" ? condition : () => condition;

  useEffect(() => {
    const cond = getCondition();
    if (!cond) return;
    if (options?.once && triggered.current) return;

    // signal state machine
    nav.sendEvent({ type: "NAV_START" });

    if (!options?.direction || options.direction === "none") {
      nav.navigateTo(path, view);
    } else if (options.direction === "backward") {
      nav.goBack();
    } else if (options.direction === "forward") {
      nav.goForward();
    }

    nav.sendEvent({ type: "NAV_END" });
    triggered.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCondition(), path, view, options?.direction, options?.once]);
};
