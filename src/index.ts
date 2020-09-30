import { native_pack as nativePack } from '../wasm/etfjs';
import Atom from './structures/AtomClass';

export const pack = (value: any) => {
	try {
		return new Uint8Array(nativePack(value));
	} catch (err) {
		if (Error.captureStackTrace) Error.captureStackTrace(err);
		throw err;
	}
};

export { Atom };

console.log(pack({
	'Atom(hi mommy)': true,
	'hi': false
}));

// @ts-ignore
console.log(pack(new Map([
	[Atom('hi'), true],
	['tits', false]
])));
// console.log(pack(['Hello!']));
// console.log(pack(Symbol('Oh la la!')));
// console.log(pack(42069n));
