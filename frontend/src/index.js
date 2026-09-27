import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";  // Assure-toi que App.js existe dans le même dossier
import "./index.css";     // Optionnel, si tu veux un CSS global

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
