import { logout } from "../../store/auth/authSlice";
import { store } from "../../store/store";

let logoutTimer: number | null = null;

export function getJwtExpMs(token: string): number | null {
    try {
        const [, payloadB64] = token.split(".");
        const json = JSON.parse(payloadB64
            ? atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/"))
            : ""
        );
        if (typeof json.exp === "number") return json.exp * 1000;
    } catch { }
    return null;
}

export function startSessionWatch(token: string) {
    stopSessionWatch();

    const expMs = getJwtExpMs(token);
    if (!expMs) return;

    // malý buffer kvůli clock skew
    const msLeft = expMs - Date.now() - 5000;
    if (msLeft <= 0) {
        store.dispatch(logout());
        return;
    }

    logoutTimer = window.setTimeout(() => {
        store.dispatch(logout());
    }, msLeft);
}

export function stopSessionWatch() {
    if (logoutTimer) {
        window.clearTimeout(logoutTimer);
        logoutTimer = null;
    }
}