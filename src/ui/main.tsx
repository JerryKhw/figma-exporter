import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);

const systemDarkMode = window.matchMedia(
    "(prefers-color-scheme: dark)"
).matches;

if (systemDarkMode) {
    document.documentElement.classList.add("dark");
} else {
    document.documentElement.classList.remove("dark");
}

root.render(<App />);
document.getElementById("loading")!.remove();
