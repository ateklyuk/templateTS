export type Config = {
	CLIENT_ID: string,
	CLIENT_SECRET: string,
	AUTH_CODE: string,
	REDIRECT_URI: string,
	SUB_DOMAIN: string,
	PORT: number
}

export type RequestQuery = {
	id: number,
	limit: number,
	page: number,
	filters: number[],
	withParam: []
}
export type CustomField = {
	field_id: number,
	id: number,
	values: { value: string }[],
}
export type token = {
	access_token: string,
	refresh_token: string
}
