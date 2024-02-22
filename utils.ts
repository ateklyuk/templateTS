/**
 * Модуль утилитарных функций:
 *  - для обработки данных из amoCRM;
 *  - общего назначения;
 */

import fs from "fs";
import {logger} from "./logger";
import {CustomField, FieldsResponse} from "./types";

/**
 * Функция извлекает значение из id поля, массива полей custom_fields сущности amoCRM
 *
 * @param {*} customFields - массив полей сущности;
 * @param {*} fieldId - id поля из которого нужно получить значение;
 * @returns значение поля
 */

export const getFieldValue = <T extends CustomField, U>(customFields: T[], fieldId: U): string | number | boolean | undefined  => {
	const field = customFields
		? customFields.find((item) => String(item.field_id || item.id) === String(fieldId))
		: undefined;
	return field && field.values[0].value;
};
 
/**
 * Функция извлекает значения из id поля, массива полей custom_fields сущности amoCRM
 * Подходит для работы со списковыми или мультисписковыми полями
 *
 * @param {*} customFields - массив полей сущности;
 * @param {*} fieldId - id поля из которого нужно получить значения;
 * @returns массив значений поля
 */
export const getFieldValues = <T extends CustomField, U>(customFields: T[], fieldId: U): unknown[] => {
	const field = customFields
		? customFields.find((item) => String(item.field_id || item.id) === String(fieldId))
		: undefined;
	const values = field ? field.values : [];
	return values.map(item => item.value);
};

/**
 * Функция заполнения поля в amoCRM
 * @param {*} field_id - id поля, которое планируется заполнить. Поле должно быть заранее создано в amoCRM, id копируется из amo;
 * @param {*} value - значение поля, тип данных должен быть идентичным с типом поля в amoCRM;
 * @param {*} enum_id - В случае, если поле списковое или мультисписковое, то для указания нужного значения указывается данный параметр, т.е. id - варианта списка;
 * @returns типовой объект с данными о поле, который необходимо передать в amoCRM.
 */
export const makeField = <T>(field_id: number, value: T, enum_id: number): undefined | FieldsResponse  => {
	if (value === undefined || value === null) {
		return undefined;
	}
	return {
		field_id,
		values: [
			{
				value,
				enum_id
			},
		],
	};
};

/**
 * Функция для разбиения запроса на создание на несколько по chunkSize
 * @param {*} request - функция-запрос в amo
 * @param {*} data - данные запроса (до разбиения на chunkSize)
 * @param {*} chunkSize - размер chunkSize
 * @param {*} operationName - название операции
 */
export const bulkOperation = async <T, U>(
	request: (args: T[]) => Promise<U>,
	data: T[],
	chunkSize: number,
	operationName: string = "bulk"
): Promise<void> => {
	let failed = [];
	if (data.length) {
		logger.debug(`Старт операции ${operationName}`);
		try {
			const chunksCount = data.length / chunkSize;
			for (let i = 0; i < chunksCount; i++) {
				try {
					const sliced = data.slice(i * chunkSize, (i + 1) * chunkSize);
					await request(sliced);
				} catch (e) {
					logger.error(e);
					failed.push(...data.slice(i * chunkSize, (i + 1) * chunkSize));
				}
				logger.debug(
					`${operationName} ${i * chunkSize} - ${(i + 1) * chunkSize}`
				);
			}
		} catch (e) {
			logger.error(e);
		}
	}
	logger.debug(
		`операция "${operationName}" завершена. Неуспешных - ${failed.length}`
	);
	fs.writeFileSync(`${operationName}Failed.txt`, JSON.stringify(failed));
};

/**
 * Функция выгрузки всех страниц сущности в amoCRM.
 * @param {*} request - функция-запрос, которая будет выполняться рекурсивно
 * @param {*} page - номер страницы (стартует с 1)
 * @param {*} limit - лимит на количество элементов в ответе (по дефолту - 200)
 * @returns [ ...elements ] все элементы сущности аккаунта
 */
export const getAllPages = async <T>(request: (args: {}) => Promise<T[]>, page: number = 1, limit: number = 200): Promise<T[] | undefined> => {
	try {
		console.log(`Загрузка страницы ${page}`);
		const res = await request({ page, limit });
		if (res.length === limit) {
			const next =  <T[]>await getAllPages(request, page + 1, limit);
			return [...res, ...next];
		}
		return res;
	} catch (e) {
		logger.error(e);
	}
};

/**
 * Функция принимает строку в которой есть цифры и символы и возвращает строку только с цифрами
 * применялась чтобы получать чистый номер телефона
 * @param {*} tel - String
 * @returns String | undefined
 */
export const getClearPhoneNumber = (tel: string): string | undefined => {
	return tel ? tel.split("").filter(item => new RegExp(/\d/).test(item)).join("") : undefined;
};
