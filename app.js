/**
 * Squidly Piano Game - Main Application
 *
 * Manages interactive piano game functionality.
 */

const PIANO_TYPE_METHODS = {
    "piano-game/default": "_switchToDefault",
};

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
            // TODO: Initialize piano game here
            this.currentGame = null;

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
        // TODO: Handle input updates for piano game
        if (!this.currentGame) return;
    },
};

document.addEventListener("DOMContentLoaded", () => {
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
    // TODO: Add cursor/input listener when needed
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

