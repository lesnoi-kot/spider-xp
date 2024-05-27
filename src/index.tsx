/* @refresh reload */
import { render } from "solid-js/web";

import "/node_modules/xp.css/dist/XP.css";
import "./index.css";

import { App } from "./App";

render(() => <App />, document.getElementById("root")!);
