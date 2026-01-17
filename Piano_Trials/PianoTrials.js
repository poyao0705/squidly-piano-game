import { SvgPlus, Vector } from "../vendor/Apps/app-class.js";

import { Loader } from "./Loader.js";

const baseUrl = import.meta.url.split("/").slice(0, -2).join("/") + "/";
// const baseUrl = "https://pianotrials.squidly.com.au/";

const noteImages = [
  `${baseUrl}images/pianotrials/note-1.png`,
  `${baseUrl}images/pianotrials/note-2.png`,
  `${baseUrl}images/pianotrials/note-3.png`,
  `${baseUrl}images/pianotrials/note-4.png`,
  `${baseUrl}images/pianotrials/note-5.png`,
  `${baseUrl}images/pianotrials/note-6.png`,
  `${baseUrl}images/pianotrials/note-7.png`,
  `${baseUrl}images/pianotrials/note-8.png`,
  `${baseUrl}images/pianotrials/note-9.png`,
  `${baseUrl}images/pianotrials/note-10.png`,
  `${baseUrl}images/pianotrials/note-11.png`,
  `${baseUrl}images/pianotrials/note-12.png`,
  `${baseUrl}images/pianotrials/note-13.png`,
  `${baseUrl}images/pianotrials/note-14.png`,
  `${baseUrl}images/pianotrials/note-15.png`,
  `${baseUrl}images/pianotrials/note-16.png`,
];

class PianoTrials extends SvgPlus {
  constructor(editable, app) {
    super("div");
    console.log("baseUrl:", baseUrl);
    // let shadow = this.attachShadow({mode: "open"})
    // let rel = this.createChild("div", {class: "rel"});
    // shadow.appendChild(rel);
    this.app = app;
    this.editable = editable;
    this.props = {
      id: "pianoTrials",
    };

    this.State = { page: "landing" };

    this.shadow = this.attachShadow({ mode: "open" });

    this.setupStyles();

    this.State = { page: "landing" };

    // this.currentInstrument = "piano";
    // this.currentVolume = 0.5;

    this.app.set("noteToPlay", "");
    

    this.app.onValue("noteToPlay", (value) => {
      if (!value) {
        console.log("no note to play");
        return;
      }
      const [note] = value.split("-"); // Extract the note from the value
      this.playAudio(note);
      //   find the key element
      const keyElement = this.shadow.getElementById(`key-${note}`);
      if (keyElement) {
        this.animateFlyingNote(note);
        keyElement.classList.add("active");
        setTimeout(() => {
          keyElement.classList.remove("active");
        }, 200);
      }
    });

    // Create separate divs for each page
    this.landingPage = this.createChild("div", {
      id: "landingPage",
      styles: { display: "none" },
    });
    
    this.landingPage.createChild("img", {
      id: "bg",
      src: `${baseUrl}images/pianotrials/bg.jpg`,
      styles: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      },
    });

    this.landingPage.createChild("div", {
      id: "whiteMask",
      styles: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(255, 255, 255, 0.05)", // Adjust the last number (0.3) to control opacity
        "pointer-events": "none", // This ensures clicks pass through to elements below
        "z-index": "1" // Adjust this value to control what the mask appears above/below
      }
    });

    const bgframecontainer = this.landingPage.createChild("div", {
      // bg frame container
      id: "bgframecontainer",
      styles: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "flex",
        "justify-content": "center",
        "align-items": "center"
      },
    });

    const logocontainer = bgframecontainer.createChild("div", {
      id: "logoContainer",
      styles: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%",
      },
    });

    logocontainer.createChild("img", {
      id: "logo",
      src: `${baseUrl}images/pianotrials/musicgamehome.jpg`,
      styles: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "auto",
      },
    });

    this.playbutton = this.landingPage.createChild("img", {
      id: "playbutton",
      src: `${baseUrl}images/pianotrials/playbutton.png`,
      styles: {
        position: "absolute",
        top: "80%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "10%",
        height: "auto",
        cursor: "pointer",
      },
    });

    this.playbutton.addEventListener("click", () => {
      this.app.set("state", "play");
    });

    this.playPage = this.createChild("div", {
      id: "playPage",
      styles: {
        display: "none",
        "flex-direction": "column",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      },
    });

    if (this.editable) {
      this.backbutton = this.playPage.createChild("img", {
        id: "backbutton",
        src: `${baseUrl}images/pianotrials/backbutton.png`,
        styles: {
          position: "absolute",
          top: "3%",
          right: "5%",
          width: "5%",
          height: "auto",
          cursor: "pointer",
          "z-index": "100",
        },
      });
      this.backbutton.addEventListener("click", () => {
        this.app.set("state", "landing");
      });
    }

    this.playPage.createChild("img", {
      id: "pianoContainer",
      src: `${baseUrl}images/pianotrials/menu-bg@2x.jpg`,
      styles: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      },
    });
    this.pianoframe = this.setupPiano();
    // this.State = { page: "play" };
    // this.State = { page: "landing" };
    this.shadow.appendChild(this.landingPage);

    this.shadow.appendChild(this.playPage);

    this.app.onValue("showKeys", (value) => {
      console.log(value);
      this.keyslist.querySelectorAll(".keyname").forEach((keyElement) => {
        keyElement.style.display = value ? "block" : "none";
      });
    });
    // set the initial showKeys to true
    this.app.set("showKeys", true);
    this.app.onValue("instrument", (value) => {
      if (!value) {
        return;
      }
      this.currentInstrument = value;
      // animate based on the instrument on change
      // query selector the button with the id of the instrument
      // clear the container background
      this.playPage.querySelectorAll(".containerbackground").forEach((container) => {
        container.src = `${baseUrl}images/pianotrials/containerbackground.png`;
      });
      const instrument = this.playPage.querySelector(`#${value}-containerbackground`);
      if (instrument) {
        instrument.src = `${baseUrl}images/pianotrials/highlightcontainerbackground.png`;
      }

    });
    // set the initial instrument to piano
    this.app.set("instrument", "piano");

    this.app.onValue("volume", (value) => {
      this.currentVolume = parseFloat(value);
      this.volumeinput.value = this.currentVolume;
    });
    // set the initial volume to 0.5
    this.app.set("volume", 0.5);

    this.app.onValue("state", (value) => {
      if (!value) this.State = { page: "landing" };
      else this.State = { page: value };
    });
  }

  setupStyles() {
    const style = document.createElement("style");
    style.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

* {
  margin: 0; /* Remove default margin */
  padding: 0; /* Remove default padding */
  box-sizing: border-box; /* Include padding and border in element's total width and height */
  font-family: 'Poppins', sans-serif; /* Apply Poppins font from Google Fonts */
}

body {
  display: flex; /* Use flexbox for layout */
  align-items: center; /* Vertically center items */
  justify-content: center; /* Horizontally center items */
  min-height: 100vh; /* Ensure body takes at least full viewport height */
  background: #E3F2FD; /* Light blue background color */
}

.wrapper {
  padding: 35px 40px; /* Add padding around the container */
  border-radius: 20px; /* Round the corners */
  background: #141414; /* Dark background color */
}

.wrapper header {
  display: flex; /* Use flexbox for layout */
  color: #B2B2B2; /* Light gray text color */
  align-items: center; /* Vertically align items */
  justify-content: space-between; /* Space out header elements */
}

header h2 {
  font-size: 1.6rem; /* Larger font size for the title */
}

header .column {
  display: flex; /* Use flexbox for layout */
  align-items: center; /* Vertically align items */
}

header span {
  font-weight: 500; /* Semi-bold font weight */
  margin-right: 15px; /* Space between the span and the input */
  font-size: 1.19rem; /* Slightly larger font size */
}

header input {
  outline: none; /* Remove default outline */
  border-radius: 30px; /* Round the corners of the input elements */
}

.volume-slider input {
  accent-color: #fff; /* Set the accent color of the slider to white */
}

.keys-checkbox input {
  height: 30px; /* Height of the checkbox */
  width: 60px; /* Width of the checkbox */
  cursor: pointer; /* Change cursor to pointer on hover */
  appearance: none; /* Remove default appearance */
  position: relative; /* Position relative for positioning ::before pseudo-element */
  background: #4B4B4B; /* Dark gray background color */
}

.keys-checkbox input::before {
  content: ""; /* Empty content for the pseudo-element */
  position: absolute; /* Absolute positioning */
  top: 50%; /* Center vertically */
  left: 5px; /* Position from the left */
  width: 20px; /* Width of the pseudo-element */
  height: 20px; /* Height of the pseudo-element */
  border-radius: 50%; /* Round the corners to make it a circle */
  background: #8c8c8c; /* Light gray background color */
  transform: translateY(-50%); /* Center vertically */
  transition: all 0.3s ease; /* Smooth transition for changes */
}

.keys-checkbox input:checked::before {
  left: 35px; /* Move slider to the right */
  background: #fff; /* Change background color to white */
}

.piano-keys {
  display: flex; /* Use flexbox for layout */
  list-style: none; /* Remove default list styling */
  margin-top: 40px; /* Space above the keys */
}

.piano-keys .key {
  cursor: pointer; /* Change cursor to pointer on hover */
  user-select: none; /* Prevent text selection */
  position: relative; /* Position relative for positioning child elements */
  text-transform: uppercase; /* Transform text to uppercase */
}

.piano-keys .black {
  z-index: 2; /* Ensure black keys appear above white keys */
  width: 44px; /* Width of the black key */
  height: 140px; /* Height of the black key */
  margin: 0 -30px; /* Negative margin to overlap with white keys */
  border-radius: 0 0 5px 5px; /* Round the bottom corners */
  background: linear-gradient(#333, #000); /* Dark gradient background */
}

.key.black.active {
  box-shadow: inset -5px -10px 10px rgba(255,255,255,0.1); /* Inner shadow effect */
  background: linear-gradient(to bottom, #000, #434343); /* Darker gradient background */
}

.piano-keys .white {
  height: 230px; /* Height of the white key */
  width: 70px; /* Width of the white key */
  border-radius: 8px; /* Round the corners */
  border: 1px solid #000; /* Black border around the key */
  background: linear-gradient(#fff 96%, #eee 4%); /* Light gradient background */
}

.key.white.active {
  box-shadow: inset -5px 5px 20px rgba(0,0,0,0.2); /* Inner shadow effect */
  background: linear-gradient(to bottom, #fff 0%, #eee 100%); /* Lighter gradient background */
}

.piano-keys .key span {
  position: absolute; /* Absolute positioning */
  bottom: 20px; /* Position at the bottom */
  width: 100%; /* Full width of the key */
  color: #A2A2A2; /* Light gray text color */
  font-size: 1.13rem; /* Font size for the key labels */
  text-align: center; /* Center the text horizontally */
}

.piano-keys .key.hide span {
  display: none; /* Hide the text */
}

.piano-keys .black span {
  bottom: 13px; /* Position closer to the bottom */
  color: #888888; /* Gray text color */
}

@media screen and (max-width: 815px) {
  .wrapper {
    padding: 25px; /* Reduce padding */
  }
  header {
    flex-direction: column; /* Stack header elements vertically */
  }
  header :where(h2, .column) {
    margin-bottom: 13px; /* Space between header elements */
  }
  .volume-slider input {
    max-width: 100px; /* Limit the width of the volume slider */
  }
  .piano-keys {
    margin-top: 20px; /* Reduce space above the keys */
  }
  .piano-keys .key:where(:nth-child(9), :nth-child(10)) {
    display: none; /* Hide some keys on smaller screens */
  }
  .piano-keys .black {
    height: 100px; /* Reduce height of black keys */
    width: 40px; /* Reduce width of black keys */
    margin: 0 -20px; /* Adjust margin for reduced width */
  }
  .piano-keys .white {
    height: 180px; /* Reduce height of white keys */
    width: 60px; /* Reduce width of white keys */
  }
}

@media screen and (max-width: 615px) {
  .piano-keys .key:nth-child(13),
  .piano-keys .key:nth-child(14),
  .piano-keys .key:nth-child(15),
  .piano-keys .key:nth-child(16),
  .piano-keys .key :nth-child(17) {
    display: none; /* Hide more keys on very small screens */
  }
  .piano-keys .white {
    width: 50px; /* Further reduce width of white keys */
  }
}
  @keyframes enlargeShrink {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }

  .animated {
    animation: enlargeShrink 0.6s ease-in-out infinite, shake 0.6s ease-in-out infinite;
  }
        `;
    this.shadow.appendChild(style);
  }

  hideAllPages() {
    if (this.landingPage) this.landingPage.style.display = "none";
    if (this.playPage) this.playPage.style.display = "none";
  }

  set State(stateObj) {
    this.hideAllPages();
    const { page } = stateObj;
    switch (page) {
      case "landing":
        // this.landingPage.style.display = "block";
        this.init();
        break;
      case "play":
        this.play();
        break;
    }
  }

  init() {
    if (this.landingPage) this.landingPage.style.display = "block";
    // todo: add landing page content
    // add play button to start the game
  }

  play() {
    this.playPage.style.display = "flex";
    // todo: add play page content
  }

  playAudio(key) {
    // console.log(key);
    // play the audio
    // const audio = new Audio(`./audio/${key}.mp3`);
    // uppercase the key
    // const upperKey = key.toUpperCase();
    // console.log(upperKey);
    const audio = new Audio(
      `${baseUrl}sounds/pianotrials/${this.currentInstrument}-${key}.mp3`
    );
    audio.volume = this.currentVolume;
    audio.play();
  }

  setupPiano() {
    // todo: add piano content
    // init: check if the play page exists, if not, create it
    if (!this.play) return;
    // check if the piano exists, if so, do nothing
    if (this.pianoframe) return;

    // append the piano to the shadow root

    const keys = [
      { class: "white", key: "c2", display: "C" },
      { class: "black", key: "db2", display: "C#" },
      { class: "white", key: "d2", display: "D" },
      { class: "black", key: "eb2", display: "D#" },
      { class: "white", key: "e2", display: "E" },
      { class: "white", key: "f2", display: "F" },
      { class: "black", key: "gb2", display: "F#" },
      { class: "white", key: "g2", display: "G" },
    ];

    // create the piano frame
    this.pianoframe = this.playPage.createChild("div", {
      id: "pianoframe",
      // make the piano take up the half width and height of the play page
      // position it in the center of the play page
      styles: {
        width: "90vw",
        height: "55vh",
        position: "relative",
        background: "#000",
        // center the piano
        margin: "0 auto",
        "margin-top": "15vh",
        // center the piano in the frame
        "justify-content": "center",
        "align-items": "center",
        "border-radius": "10px",
        padding: "10px",
      },
    });

    this.instrumentgroup = this.playPage.createChild("div", {
      id: "instrumentgroup",
      styles: {
        display: "flex",
        width: "100%",
        height: "100%",
        "justify-content": "center",
        "align-items": "center",
        position: "relative",
        // margin between the instruments
      },
    });

    // piano.png
    // add a div to contain the piano button  
    this.pianocontainer = this.instrumentgroup.createChild("div", {
      id: "pianocontainer",
      class: "instrumentcontainer",
      styles: {
        width: "10vw",
        height: "10vw",
        cursor: "pointer",
        margin: "0 5vw",
        position: "relative",
      },
    });
    this.pianocontainer.createChild("img", {
      id: "piano-containerbackground",
      class: "containerbackground",
      src: `${baseUrl}images/pianotrials/containerbackground.png`,
      styles: {
        width: "100%",
        height: "100%",
        cursor: "pointer",
        position: "absolute",
        "z-index": "0",
      },
    });
    this.pianocontainer.createChild("img", {
      id: "pianoimg",
      class: "instrumentimg",
      src: `${baseUrl}images/pianotrials/piano1.png`,
      styles: {
        width: "70%",
        height: "70%",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)",
        cursor: "pointer",
        position: "absolute",
      },
    });

    this.pianocontainer.addEventListener("click", () => {
      this.app.set("instrument", "piano");
      // this.animateInstrument(this.pianobutton);
      console.log(this.currentInstrument);
    });

    // guitar.png
    this.guitarcontainer = this.instrumentgroup.createChild("div", {
      id: "guitarcontainer",
      class: "instrumentcontainer",
      styles: {
        position: "relative",
        width: "10vw",
        height: "10vw",
        margin: "0 5vw",
        cursor: "pointer",
      },
    });
    this.guitarcontainer.createChild("img", {
      id: "guitar-containerbackground",
      class: "containerbackground",
      src: `${baseUrl}images/pianotrials/containerbackground.png`,
      styles: {
        width: "100%",
        height: "100%",
        cursor: "pointer",
        position: "absolute",
        "z-index": "0",
      },
    });
    this.guitarcontainer.createChild("img", {
      id: "guitarimg",
      class: "instrumentimg",
      src: `${baseUrl}images/pianotrials/guitar.png`,
      styles: {
        width: "70%",
        height: "70%",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)",
        cursor: "pointer",
        position: "absolute",
      },
    });

    this.guitarcontainer.addEventListener("click", () => {
      this.app.set("instrument", "guitar");
      console.log(this.currentInstrument);
    });

    // violin.png
    this.violincontainer = this.instrumentgroup.createChild("div", {
      id: "violincontainer",
      class: "instrumentcontainer",
      styles: {
        position: "relative",
        width: "10vw",
        height: "10vw",
        margin: "0 5vw",
        cursor: "pointer",
      },
    });
    this.violincontainer.createChild("img", {
      id: "violin-containerbackground",
      class: "containerbackground",
      src: `${baseUrl}images/pianotrials/containerbackground.png`,
      styles: {
        width: "100%",
        height: "100%",
        cursor: "pointer",
        position: "absolute",
        "z-index": "0",
      },
    });
    this.violincontainer.createChild("img", {
      id: "violinimg",
      class: "instrumentimg",
      src: `${baseUrl}images/pianotrials/violin.png`,
      styles: {
        width: "70%",
        height: "70%",
        cursor: "pointer",
        position: "absolute",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)",
        "z-index": "1",
      },
    });

    this.violincontainer.addEventListener("click", () => {
      this.app.set("instrument", "violin");
    });

    // trumpet.png
    this.trumpetcontainer = this.instrumentgroup.createChild("div", {
      id: "trumpetcontainer",
      class: "instrumentcontainer",
      styles: {
        width: "10vw",
        height: "10vw",
        cursor: "pointer",
        margin: "0 5vw",
        position: "relative",
      },
    });
    this.trumpetcontainer.createChild("img", {
      id: "trumpet-containerbackground",
      class: "containerbackground",
      src: `${baseUrl}images/pianotrials/containerbackground.png`,
      styles: {
        width: "100%",
        height: "100%",
        cursor: "pointer",
        position: "absolute",
        "z-index": "0",
      },
    });
    this.trumpetcontainer.createChild("img", {
      id: "trumpetimg",
      class: "instrumentimg",
      src: `${baseUrl}images/pianotrials/trumpet.png`,
      styles: {
        width: "70%",
        height: "50%",
        cursor: "pointer",
        position: "absolute",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)",
        "z-index": "1",
      },
    });

    this.trumpetcontainer.addEventListener("click", () => {
      this.app.set("instrument", "trumpet");
    });

    // create the piano header
    this.pianoheader = this.pianoframe.createChild("header", {
      id: "pianoheader",
      styles: {
        display: "flex",
        "justify-content": "flex-start",
        "align-items": "center",
        padding: "0 1em",
        "margin-bottom": "1em",
      },
    });
    // create the piano title
    this.pianotitle = this.pianoheader.createChild("h2", {
      id: "pianotitle",
      content: "World Orchestra",
      styles: {
        "text-transform": "uppercase",
        flex: "1",
        "text-align": "center",
        color: "#888",
        // place it to the left
      },
    });

    // create the volume slider container
    this.volumesliderdiv = this.pianoheader.createChild("div", {
      id: "volumesliderdiv",
      styles: {
        width: "50%",
        flex: "1",
        "text-align": "center",
        color: "#888",
      },
    });
    // create the volume label
    this.volumesliderdiv.createChild("label", {
      id: "volumesliderlabel",
      content: "Volume",
      styles: {
        "text-align": "center",
      },
    });

    if (!this.editable) {
      this.volumesliderdiv.style.display = "none";
    }

    // create the volume slider
    this.volumeinput = this.volumesliderdiv.createChild("input", {
      id: "volumeslider",
      type: "range",
      min: "0",
      max: "1",
      value: "0.5",
      step: "any",
      styles: {
        "margin-left": "10px",
      },
    });

    this.volumeinput.addEventListener("input", (event) => {
      this.app.set("volume", event.target.value);
    });

    this.keyscheckboxdiv = this.pianoheader.createChild("div", {
      id: "keyscheckboxdiv",
      class: "keys-checkbox",
      styles: {
        display: "flex",
        "justify-content": "center",
        "align-items": "center",
        flex: "1",
        "text-align": "center",
        color: "#888",
      },
    });
    // create the keys checkbox
    // if it is on the user side, then don't display it
    if (!this.editable) {
      this.keyscheckboxdiv.style.display = "none";
    }
    this.keyscheckbox = this.keyscheckboxdiv.createChild("input", {
      id: "keyscheckbox",
      type: "checkbox",
      checked: true,
      styles: {
        "margin-right": "10px",
      },
    });

    // create the keys checkbox label
    this.keyscheckboxdiv.createChild("label", {
      id: "keyscheckboxlabel",
      content: "Show Keys",
    });

    // create a list of keys
    this.keyslist = this.pianoframe.createChild("ul", {
      id: "keyslist",
      styles: {
        "list-style": "none",
        padding: "0",
        display: "flex",
        "justify-content": "center",
        width: "100%",
      },
    });

    keys.forEach((key) => {
      const li = this.keyslist.createChild("li", {
        id: `key-${key.key}`,
        class: `key ${key.class} ${key.key}button`,
        styles: {
          cursor: "pointer",
          margin: "0 1px",
          width: key.class === "white" ? "18%" : "12%",
          height: key.class === "white" ? "40vh" : "24vh",
          "min-width": key.class === "white" ? "50px" : "30px", // Minimum width to prevent squeezing
          "border-radius": key.class === "white" ? "8px" : "0 0 5px 5px",
          background:
            key.class === "white"
              ? "linear-gradient(#fff 96%, #eee 4%)"
              : "linear-gradient(#333, #000)",
          position: "relative",
          "user-select": "none",
          "text-transform": "uppercase",
          border: key.class === "white" ? "5px solid #000" : "none",
          "z-index": key.class === "black" ? "2" : "1",
          "margin-left": key.class === "black" ? "-3.5vw" : "0",
          "margin-right": key.class === "black" ? "-3.5vw" : "0",
        },
      });
      // Create the <span> element inside the <li>
      li.createChild("span", {
        id: `keyname-${key.key}`,
        class: "keyname",
        styles: {
          position: "absolute",
          width: "100%",
          "text-align": "center",
          color: key.class === "white" ? "#A2A2A2" : "#888888",
          "font-size": "1.13rem",
          bottom: key.class === "white" ? "20px" : "13px",
        },
        content: key.display,
      });
      //  add event listener to play the audio
      li.addEventListener("click", () => {
        const noteWithTimestamp = `${key.key}-${Date.now()}`;
        this.app.set("noteToPlay", noteWithTimestamp);
      });
    });
    // add event listener to the checkbox
    this.keyscheckbox.addEventListener("change", (event) => {
      const showKeys = this.keyscheckbox.checked;
      // write to the database instead
      this.app.set("showKeys", showKeys);
    });

    this.setupLoader();
  }

  animateInstrument(selectedButton) {
    // Remove the animation class from all instrument buttons
    [
      this.pianobutton,
      this.guitarbutton,
      this.violinbutton,
      this.trumpetbutton,
    ].forEach((button) => {
      button.classList.remove("animated");
    });

    // Add the animation class to the selected button
    selectedButton.classList.add("animated");
  }

  animateFlyingNote(note) {
    // Randomly select an image from the array
    const randomIndex = Math.floor(Math.random() * noteImages.length);
    const randomImageSrc = noteImages[randomIndex];

    // Find the key element
    const keyElement = this.shadow.getElementById(`key-${note}`);
    if (!keyElement) return;

    // Get the position of the key element
    const rect = keyElement.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const noteElement = document.createElement("img");
    noteElement.alt = note;
    noteElement.src = randomImageSrc;
    noteElement.style.position = "absolute";
    noteElement.style.left = `${startX}px`;
    noteElement.style.top = `${startY}px`;
    noteElement.style.width = "30px";
    noteElement.style.transition = "transform 1s ease-out, opacity 1s ease-out";
    noteElement.style.zIndex = "1000";
    this.shadow.appendChild(noteElement);

    // force the note to go up

    const translateY = -100;
    const translateX = 0;
    // Trigger the animation
    requestAnimationFrame(() => {
      noteElement.style.transform = `translate(${translateX}px, ${translateY}px)`;
      noteElement.style.opacity = "0";
    });

    // Remove the note element after the animation
    setTimeout(() => {
      this.shadow.removeChild(noteElement);
    }, 1000);
  }

  checkVectorOnItem(vector) {
    // let x = vector.x;
    // let y = vector.y;
    // let items = this.playPage.querySelectorAll(".instrumentcontainer, li");
    // ////////
    // // check if it is black key or white key
    // // step 1: query all the keys
    // // step 2: find if the coordinates are in the keys
    // // step 3: if it is on black key and white key, always return the black key first

    // for (let i = 0; i < items.length; i++) {
    //   let item = items[i];
    //   let rect = item.getBoundingClientRect();
    //   if (x > rect.left && x < rect.right && y > rect.top && y < rect.bottom) {
    //     console.log("item", item);
    //     return item;
    //   }
    // }
    // return null;
    let x = vector.x;
    let y = vector.y;
  
    let blackKeys = this.playPage.querySelectorAll(".key.black");
    for (let blackKey of blackKeys) {
      let blackRect = blackKey.getBoundingClientRect();
      if (x >= blackRect.left && x <= blackRect.right && y >= blackRect.top && y <= blackRect.bottom) {
        return blackKey;
      }
    }
  
    let whiteKeys = this.playPage.querySelectorAll(".key.white");
    for (let whiteKey of whiteKeys) {
      let whiteRect = whiteKey.getBoundingClientRect();
      if (x >= whiteRect.left && x <= whiteRect.right && y >= whiteRect.top && y <= whiteRect.bottom) {
        return whiteKey;
      }
    }
    return null;
  }

  set eyePosition(vector) {
    let item = this.checkVectorOnItem(vector);
    this.playPage.querySelectorAll("path").forEach((loader) => {
      loader.hover = false;
    });
    if (item) {
      const loader = item.querySelector("path");
      loader.hover = true;

      // Monitor loader progress
      const checkProgress = () => {
        if (loader.progress >= 1) { // Assuming progress is a value between 0 and 1
          const event = new Event("click");
          item.dispatchEvent(event);
          loader.progress = 0; // Reset the loader's progress
        } else {
          requestAnimationFrame(checkProgress); // Continue checking
        }
      };
      checkProgress();
    }
  }

  setupLoader() {
    // for all the instruments and keys, create a loader
    // const instruments = ["piano", "guitar", "violin", "trumpet"];

    const keysList = this.keyslist.querySelectorAll("li");

    const instrumentList = this.instrumentgroup.querySelectorAll(
      ".instrumentcontainer"
    );

    requestAnimationFrame(() => {
      instrumentList.forEach((instrument) => {
        console.log("instrument", instrument);
        // const instrumentrect = instrument.querySelector("img");
        
        const loadersvg = instrument.createChild("svg", {
          class: "loader",
          viewBox: "-50 -50 100 100",
          styles: {
            // to stack the loaders on top of instrument
            position: "absolute", // Ensure the loader is positioned absolutely
            top: "50%", // Center vertically
            left: "50%", // Center horizontally
            transform: "translate(-50%, -50%)", // Adjust for centering
            width: "100%",
            height: "100%",
            overflow: "visible", // Ensure the loader is not clipped
            "z-index": "100",
          },
        });
        const loader = new Loader();
        loader.size = 5;
        const newPos = new Vector(12.5, 12.5);
        console.log("instrument newPos", newPos);
        loader.position = newPos;
        loadersvg.appendChild(loader);

        // Monitor loader progress
        const restartMonitoring = () => {
          const checkProgress = () => {
            if (loader.progress >= 1) { // Assuming progress is a value between 0 and 1
              const event = new Event("click");
              instrument.dispatchEvent(event);
              loader._progress = 0;
              console.log("clicked instrument");
            } else {
              requestAnimationFrame(checkProgress); // Continue checking
            }
          };
          checkProgress();
        };
        // checkProgress();

        instrument.addEventListener("mouseenter", () => {
          loader.hover = true;
          restartMonitoring();
        });
        instrument.addEventListener("mouseleave", () => {
          loader.hover = false;
          restartMonitoring();
        });
      });
      keysList.forEach((keyWrapper) => {
        console.log("keyWrapper", keyWrapper);
        const loadersvg = keyWrapper.createChild("svg", {
          class: "loader",
          viewBox: "0 0 100 100",
          styles: {
            position: "absolute", // Ensure the loader is positioned absolutely
            top: "85%", // Center vertically
            left: "80%", // Center horizontally
            transform: "translate(-50%, -50%)", // Adjust for centering
            width: "50%",
            height: "50%",
            overflow: "visible", // Ensure the loader is not clipped
          },
        });

        const loader = new Loader();
        loader.size = 5;
        const rect = keyWrapper.getBoundingClientRect();
        const newPos = new Vector(rect.width / 2, rect.height / 2);
        console.log("key newPos", newPos);
        loader.position = newPos;
        // loader._position = elementpos;
        loadersvg.appendChild(loader);

        // Monitor loader progress
        const restartMonitoring = () => {
          const checkProgress = () => {
            if (loader.progress >= 1) {
              keyWrapper.click(); // Trigger click event
              loader.progress = 0; // Reset the loader's progress
            } else {
              requestAnimationFrame(checkProgress); // Continue checking
            }
          };
          checkProgress();
        };
        // checkProgress();

        keyWrapper.addEventListener("mouseenter", () => {
          loader.hover = true;
          restartMonitoring();
        });

        keyWrapper.addEventListener("mouseleave", () => {
          loader.hover = false;
          restartMonitoring();
        });
      });
    });
  }
}

export default PianoTrials;

