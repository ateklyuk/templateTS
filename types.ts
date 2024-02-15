export type Config = {
	CLIENT_ID: string,
	CLIENT_SECRET: string,
	AUTH_CODE: string,
	REDIRECT_URI: string,
	SUB_DOMAIN: string,
	PORT: number
}
export type GetTokenRes = {
	token_type: string,
	expires_in: number,
	access_token: string,
	refresh_token: string
}
export type GetDealRes = {}
export type GetDealsRes = {
	_page: number,
	_links: {},
	_embedded: {leads: Array<{}>}
}
export type Request = {
	id: number,
	limit: number,
	page: number,
	filters: number[],
}
export type CustomField = {
	field_id: number,
	id: number,
	values: { value: string }[],
}
