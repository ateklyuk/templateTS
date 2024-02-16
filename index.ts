/**
 * Основной модуль приложения - точка входа.
 */

import express from "express";
import api from "./api";
import {logger} from "./logger";
import {config} from "./config";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
api.getAccessToken().then(() => {
	app.get("/ping", (req, res) => res.send("pong " + Date.now()));

	app.post("/hook", (req, res) => {
		res.send("OK");
	});

	app.listen(config.PORT, () => logger.debug("Server started on ", config.PORT));
});

