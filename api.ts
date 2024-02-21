/**
 * Модуль для работы c API amoCRM
 * Модуль используется для работы в NodeJS.
 */

import axios from "axios"
import querystring from "querystring";
import fs from "fs";
import axiosRetry from "axios-retry";
import {config} from "./config"
import {logger} from "./logger";
import {ContactsUpdateData, DataType, DealsUpdateData, RequestQuery, Token} from "./types";

axiosRetry(axios, {retries: 3, retryDelay: axiosRetry.exponentialDelay});

const AMO_TOKEN_PATH = "amo_token.json";

const LIMIT = 200;


export default new class Api {
	private access_token: null | string = null;
	private refresh_token: null | string = null;
	private defaultParams: object = {}
	private defaultTimeout: number = 0

	private ROOT_PATH: string = `https://${config.SUB_DOMAIN}.amocrm.ru`;
	private getConfig = (params?: object, timeout?: number) => {
		return {
			params: params ?? this.defaultParams,
			headers: {
				Authorization: `Bearer ${this.access_token}`,
			},
			timeout: timeout ?? this.defaultTimeout
		}
	}
	private createData = (grant_type: string): object => {
		const data: DataType = {
			client_id: config.CLIENT_ID,
			client_secret: config.CLIENT_SECRET,
			redirect_uri: config.REDIRECT_URI,
			grant_type: grant_type
		}
		if (grant_type === "refresh_token") {
			data.refresh_token = this.refresh_token
		} else data.code = config.AUTH_CODE
		return data
	}

	private authChecker = <T, U>(request: (args: T) => Promise<U>): ((args: T) => Promise<U>) => {
		return (...args) => {
			if (!this.access_token) {
				return this.getAccessToken().then(() => this.authChecker(request)(...args));
			}
			return request(...args).catch((err) => {
				logger.error(err.response);
				logger.error(err);
				logger.error(err.response.data);
				const data = err.response.data;
				if ("validation-errors" in data) {
					data["validation-errors"].forEach(({errors}: { errors: Error[] }) => logger.error(errors));
					logger.error("args", JSON.stringify(args, null, 2));
				}
				if (data.status == 401 && data.title === "Unauthorized") {
					logger.debug("Нужно обновить токен");
					return this.refreshToken().then(() => this.authChecker(request)(...args));
				}
				throw err;
			});
		};
	};

	private requestAccessToken = (): Promise<Token> => {
		return axios
			.post<Token>(`${this.ROOT_PATH}/oauth2/access_token`, this.createData("authorization_code"))
			.then((res) => {
				logger.debug("Свежий токен получен");
				return res.data;
			})
			.catch((err) => {
				logger.error(err.response.data);
				throw err;
			});
	};

	public getAccessToken = async (): Promise<string> => {
		if (this.access_token) {
			return Promise.resolve(this.access_token);
		}
		try {
			const content = fs.readFileSync(AMO_TOKEN_PATH);
			const token = JSON.parse(content.toString());
			this.access_token = token.access_token;
			this.refresh_token = token.refresh_token;
			return Promise.resolve(token.access_token);
		} catch (error) {
			logger.error(`Ошибка при чтении файла ${AMO_TOKEN_PATH}`, error);
			logger.debug("Попытка заново получить токен");
			const token = await this.requestAccessToken();
			fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
			this.access_token = token.access_token;
			this.refresh_token = token.refresh_token;
			return Promise.resolve(token.access_token);
		}
	};

	private refreshToken = (): Promise<string> => {
		return axios
			.post(`${this.ROOT_PATH}/oauth2/access_token`, this.createData("refresh_token"))
			.then((res) => {
				logger.debug("Токен успешно обновлен");
				const token = res.data;
				fs.writeFileSync(AMO_TOKEN_PATH, JSON.stringify(token));
				this.access_token = token.access_token;
				this.refresh_token = token.refresh_token;
				return token;
			})
			.catch((err) => {
				logger.error("Не удалось обновить токен");
				logger.error(err.response.data);
			});
	};

	// Получить сделку по id
	public getDeal = this.authChecker<RequestQuery, DealsUpdateData>(({id, withParam = []}): Promise<DealsUpdateData> => {
		return axios
			.get<DealsUpdateData>(
				`${this.ROOT_PATH}/api/v4/leads/${id}?${querystring.encode({
					with: withParam.join(",")
				})}`, this.getConfig())
			.then((res) => res.data);
	});
	// Получить сделки по фильтрам
	public getDeals = this.authChecker<RequestQuery, DealsUpdateData[]>(({page = 1, limit = LIMIT, filters}): Promise<DealsUpdateData[]> => {
		const url = `${this.ROOT_PATH}/api/v4/leads?${querystring.stringify({
			page,
			limit,
			with: ["contacts"],
			filters,
		})}`;
		return axios
			.get(url, this.getConfig())
			.then((res) => {
				return res.data ? res.data._embedded.leads : [];
			});
	});

	// Обновить сделки
	public updateDeals = this.authChecker<DealsUpdateData, object>((data): Promise<{ _embedded:object }> => {
		return axios.patch(`${this.ROOT_PATH}/api/v4/leads`, data, this.getConfig());
	});

	// Получить контакт по id
	public getContact = this.authChecker<number, ContactsUpdateData>((id: number): Promise<ContactsUpdateData> => {
		return axios
			.get<ContactsUpdateData>(`${this.ROOT_PATH}/api/v4/contacts/${id}?${querystring.stringify({
				with: ["leads"]
			})}`, this.getConfig())
			.then((res) => res.data);
	});

	// Обновить контакты
	public updateContacts = this.authChecker<ContactsUpdateData, unknown>((data): Promise<unknown> => {
		return axios.patch(`${this.ROOT_PATH}/api/v4/contacts`, [data], this.getConfig());
	});

}
