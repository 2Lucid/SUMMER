import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";
import { GameProvider } from "./game.jsx";

createRoot(document.getElementById("root")).render(
  <GameProvider>
    <App />
  </GameProvider>
);
