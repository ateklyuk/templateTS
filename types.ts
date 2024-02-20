
export type Config = {
	CLIENT_ID: string,
	CLIENT_SECRET: string,
	AUTH_CODE: string,
	REDIRECT_URI: string,
	SUB_DOMAIN: string,
	PORT: number
}

export type PostTokenData = {
	client_id: string,
	client_secret: string,
	grant_type: string,
	refresh_token: string,
	redirect_uri: string,
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
export type Token = {
	access_token: string,
	refresh_token: string
}

export type DealRes = {
	id: number,
	name: string,
	price: number,
	responsible_user_id: number,
	group_id: number,
	status_id: number,
	pipeline_id: number,
}


export type DealsUpdateData = {
	id: number,
	pipeline_id: number,
	status_id: number,
	closed_at: number,
	loss_reason_id: number,
	updated_by: number
}

export type ContactRes = {
	id: number,
	name: string,
	first_name: string,
	last_name: string,
	responsible_user_id: number,
	custom_fields_values: {}[]
}

export type ContactsUpdateData = {
	id: number,
	first_name: string,
	last_name: string,
	custom_fields_values: {}[]
}
