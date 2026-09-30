import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// The library stylesheet, straight from the source tree so the demo and the
// published `style.css` can never drift apart.
import "../../src/styles/index.css";
import "./demo.css";

import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from demo/index.html");

createRoot(container).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
