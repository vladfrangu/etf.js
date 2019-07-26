import * as test from 'tape';
import { pack, unpack } from '../index';
// import { AtomClass } from '../lib/structures/Atom';

test('Empty array', t => {
	t.plan(1);

	const unpacked = unpack(pack([])) as never[];

	t.equal(unpacked.length, 0);
});

test('Empty set', t => {
	t.plan(1);

	const unpacked = unpack(pack(new Set())) as never[];

	t.equal(unpacked.length, 0);
});
