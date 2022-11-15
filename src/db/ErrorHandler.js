/** @format */
class ApiError extends Error {
	constructor(message, errCode) {
		super(message);
		this.code = errCode;
	}
}

module.exports = ApiError;
