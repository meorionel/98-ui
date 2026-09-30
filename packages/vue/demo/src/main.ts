import { createApp } from "vue";

// The library stylesheet, straight from the source tree so the demo and the
// published `style.css` can never drift apart.
import "../../src/styles/index.css";
import "./demo.css";

import App from "./App.vue";

const container = document.getElementById("root");
if (!container) throw new Error("#root is missing from demo/index.html");

createApp(App).mount(container);
