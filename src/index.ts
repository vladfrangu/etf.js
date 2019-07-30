import { native_pack as nativePack } from '../wasm/etfjs';
import Atom from './structures/AtomClass';

export const pack = (value: any) => {
	try {
		return nativePack(value);
	} catch (err) {
		if (Error.captureStackTrace) Error.captureStackTrace(err);
		throw err;
	}
};

export { Atom };

console.log(pack([1, "true"]));

// console.log(pack(['Hello!']));
// console.log(pack(Symbol('Oh la la!')));
// console.log(pack(42069n));
