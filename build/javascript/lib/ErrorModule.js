var code = 0;
var message = '';

export function setError(inputCode, inputMessage) {
	code = inputCode;
	message = inputMessage;
}

export function printMessage() {
	console.log('ErrorCode: ' + code + '\n' + message);
}
