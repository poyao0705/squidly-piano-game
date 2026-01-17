/**
 * Squidly Piano Game - Main Application
 *
 * Manages interactive piano game functionality.
 */

import PianoTrials from "./Piano_Trials/PianoTrials.js";

const PIANO_TYPE_METHODS = {
    "piano-game/default": "_switchToDefault",
};

const GAME_PREFIX = "piano-game";
const GAME_ROOT_ID = "piano-game-root";

class FirebaseAppAdapter {
    constructor(prefix) {
        this.prefix = prefix;
        this.hasHost = window.parent && window.parent !== window;
        this.store = new Map();
        this.callbacks = new Map();
    }

    set(key, value) {
        const path = `${this.prefix}/${key}`;
        if (this.hasHost && typeof firebaseSet === "function") {
            firebaseSet(path, value);
            return;
        }
        this.store.set(path, value);
        if (this.callbacks.has(path)) {
            this.callbacks.get(path).forEach((cb) => cb(value));
        }
    }

    onValue(key, callback) {
        const path = `${this.prefix}/${key}`;
        if (this.hasHost && typeof firebaseOnValue === "function") {
            firebaseOnValue(path, callback);
            return;
        }
        if (!this.callbacks.has(path)) {
            this.callbacks.set(path, new Set());
        }
        this.callbacks.get(path).add(callback);
        if (this.store.has(path)) {
            callback(this.store.get(path));
        } else {
            callback(null);
        }
    }
}

function ensureRoot() {
    let root = document.getElementById(GAME_ROOT_ID);
    if (!root) {
        root = document.createElement("div");
        root.id = GAME_ROOT_ID;
        root.style.position = "absolute";
        root.style.inset = "0";
        root.style.width = "100%";
        root.style.height = "100%";
        document.body.appendChild(root);
    }
    return root;
}

function createPianoTrials() {
    const app = new FirebaseAppAdapter(GAME_PREFIX);
    const editable = true;
    const piano = new PianoTrials(editable, app);
    piano.styles = {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
    };
    piano.destroy = () => {
        piano.remove();
    };
    app.set("state", "landing");
    return piano;
}

// Initialize default piano type
firebaseSet("piano-game/currentType", "piano-game/default");

window.pianoGame = {
    currentType: null,
    currentGame: null,
    switching: false,
    syncingFromParent: false,

    setAppType: function (type) {
        if (this.currentType !== type) {
            this.currentType = type;
            document.body.setAttribute("app-type", type);
            if (!this.syncingFromParent) {
                firebaseSet("piano-game/currentType", type);
            }
        }
    },

    requestSwitch: function (type) {
        if (type) {
            firebaseSet("piano-game/currentType", type);
        }
    },

    _switchToDefault: function () {
        if (this.switching) return;
        this.switching = true;

        this.destroyCurrentGame().then(() => {
            const root = ensureRoot();
            root.innerHTML = "";

            const game = createPianoTrials();
            root.appendChild(game);
            this.currentGame = game;

            this.currentType = "piano-game/default";
            document.body.setAttribute("app-type", "piano-game/default");
            this.switching = false;
        });
    },

    destroyCurrentGame: function () {
        if (this.currentGame && this.currentGame.destroy) {
            this.currentGame.destroy();
            this.currentGame = null;
        }
        return Promise.resolve();
    },

    updateInput: function (data) {
        if (!this.currentGame || !data) return;
        if (typeof data.x === "number" && typeof data.y === "number") {
            this.currentGame.eyePosition = data;
        }
    },
};

document.addEventListener("DOMContentLoaded", () => {
    const instruction = document.getElementById("instruction-text");
    if (instruction) {
        instruction.style.display = "none";
    }

    // Initialize with default piano game
    window.pianoGame._switchToDefault();

    // Sync with Firebase
    firebaseOnValue("piano-game/currentType", (value) => {
        if (value !== window.pianoGame.currentType) {
            const methodName = PIANO_TYPE_METHODS[value];
            if (methodName && typeof window.pianoGame[methodName] === "function") {
                window.pianoGame.syncingFromParent = true;
                window.pianoGame[methodName]();
                window.pianoGame.syncingFromParent = false;
            }
        }
    });

    // Multi-user input updates
    // addCursorListener((data) => {
    //   window.pianoGame.updateInput(data);
    // });

    // Grid icon for switching
    setIcon(
        1,
        0,
        {
            symbol: "music",
            displayValue: "Piano Mode",
            type: "action",
        },
        () => {
            console.log("Piano mode active");
        }
    );
});
