import * as test from 'tape';
import { pack, unpack, Atom } from '../index';

test('Packing and Unpacking Atom', t => {
	t.plan(2);
	const packed = pack(Atom('hello_world'));
	console.log(packed);
	const unpacked = unpack(packed);
	console.log(unpacked);

	t.equal(`${unpacked}`, `Atom(hello_world)`, 'unpacked instance has the same name');
	t.assert(unpacked instanceof Atom('other_atom').constructor, 'unpacked is an Atom class');
});
