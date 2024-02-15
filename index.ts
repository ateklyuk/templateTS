/**
 * Основной модуль приложения - точка входа.
 */

import express from "express";
import Api from "./api";
import {logger} from "./logger";
import {config} from "./config";
import {strict} from "assert";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
const api = new Api()
api.getAccessToken().then(() => {
	app.get("/ping", (req, res) => res.send("pong " + Date.now()));

	app.post("/hook", (req, res) => {
		res.send("OK");
	});

	app.listen(config.PORT, () => logger.debug("Server started on ", config.PORT));
});

