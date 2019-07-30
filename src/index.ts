import { native_pack as nativePack } from '../wasm/etfjs';
import Atom from './structures/AtomClass';

export const pack = (value: any) => {
	try {
		return nativePack(value);
	} catch (err) {
		// if (Error.captureStackTrace) Error.captureStackTrace(err);
		throw err;
	}
};

export { Atom };

let obj = { hi: true };

// @ts-ignore
console.log(pack(new Map([
	[
		Atom('hi'), true,
	],
	[
		obj, false,
	],
	[
		"hello", "true"
	]
])));

// console.log(pack(['Hello!']));
// console.log(pack(Symbol('Oh la la!')));
// console.log(pack(42069n));
