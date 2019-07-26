import * as test from 'tape';
import { pack, unpack, Atom } from '../index';
import { AtomClass } from '../lib/structures/Atom';

const helloWorldAtom = Atom('hello_world');

test('Atom throws if input is not a string', t => {
	t.plan(1);

	// @ts-ignore
	t.throws(() => Atom(null));
});

test('Atom throws if input is longer than 255 chars', t => {
	t.plan(1);

	t.throws(() => Atom('*'.repeat(256)));
});

test('Packing and unpacking Atom keeps the same content', t => {
	t.plan(2);
	const packed = pack(helloWorldAtom);
	const unpacked = unpack(packed);

	t.assert(unpacked instanceof AtomClass, 'unpacked is an Atom class');
	t.equal(`${unpacked}`, 'Atom(hello_world)', 'unpacked instance has the same name as the original instance');
});

test('Atom works as object key', t => {
	t.plan(2);

	// @ts-ignore Complains that it isn't a string, but it gets stringified by JS. Use `toString()` when you use it as an object key
	const obj = { [helloWorldAtom]: true };

	t.assert('Atom(hello_world)' in obj, 'the Atom name is in the object');

	const unpacked = unpack(pack(obj)) as Record<string, boolean>;

	t.assert('Atom(hello_world)' in unpacked, 'the Atom name is in the unpacked object');
});

test('Atom works as map key', t => {
	t.plan(2);

	const map = new Map([
		[helloWorldAtom, true]
	]);

	t.assert(map.has(helloWorldAtom), 'the Atom name is in the map');

	const unpacked = unpack(pack(map)) as Record<string, boolean>;

	t.assert('Atom(hello_world)' in unpacked, 'the Atom name is in the unpacked map (which is an object when unpacked)');
});

test('Atom works as object value', t => {
	t.plan(3);

	const obj = { helloWorld: helloWorldAtom };

	t.assert(obj.helloWorld instanceof AtomClass, 'object value is an atom');

	const unpacked = unpack(pack(obj)) as Record<string, AtomClass>;

	t.assert(unpacked.helloWorld instanceof AtomClass, 'unpacked object value is an Atom');

	t.same(unpacked.helloWorld.name, helloWorldAtom.name, 'Atoms have the same name after unpacking');
});

test('Atom works as map value', t => {
	t.plan(3);

	const map = new Map([
		['helloWorld', helloWorldAtom]
	]);

	const entry = map.get('helloWorld')!;

	t.assert(entry instanceof AtomClass, 'object value is an atom');

	const unpacked = unpack(pack(map)) as Record<string, AtomClass>;

	t.assert(unpacked.helloWorld instanceof AtomClass, 'unpacked object value is an Atom');

	t.same(unpacked.helloWorld.name, helloWorldAtom.name, 'Atoms have the same name after unpacking');
});

test('Atoms in arrays', t => {
	t.plan(2);

	const array = Array.from({ length: 3 }, () => helloWorldAtom);

	const unpacked = unpack(pack(array)) as AtomClass[];

	t.equal(unpacked.length, array.length, 'unpacked the same number of Atoms');
	t.true(unpacked.every(value => value instanceof AtomClass), 'all items in the unpacked array are instances of AtomClass');
});

test('Booleans are not Atoms after unpacking', t => {
	t.plan(2);

	const trueAtom = Atom('true');
	const falseAtom = Atom('false');

	const array = [trueAtom, falseAtom];

	const unpacked = unpack(pack(array)) as boolean[];

	t.equal(unpacked.length, array.length, 'unpacked the same number of Atoms');
	t.true(unpacked.every(value => typeof value === 'boolean'), 'booleans were converted to primitives after unpacking');
});

test('null and nil Atoms, null and undefined primitives are converted to primitive null', t => {
	t.plan(2);

	const nullAtom = Atom('null');
	const nilAtom = Atom('nil');

	const array = [nullAtom, nilAtom, null, undefined];

	const unpacked = unpack(pack(array)) as null[];
	t.equal(unpacked.length, array.length, 'unpacked the same number of Atoms');
	t.true(unpacked.every(value => value === null), 'null and nil Atoms, primite null and undefined were converted to primitive null after unpacking');
});
