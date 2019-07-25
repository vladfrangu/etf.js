export const TE = typeof TextEncoder === 'undefined'
	? require('util').TextEncoder as {
		new(): TextEncoder;
		prototype: TextEncoder;
	}
	: TextEncoder;

export const TD = typeof TextDecoder === 'undefined'
	? require('util').TextDecoder as {
		new(label?: string, options?: TextDecoderOptions): TextDecoder;
		prototype: TextDecoder;
	}
	: TextDecoder;
