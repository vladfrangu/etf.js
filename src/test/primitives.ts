import * as test from 'tape';
import { pack, unpack } from '../index';

test('true/false primitives', t => {
	t.plan(2);

	const unpackedTrue = unpack(pack(true)) as true;

	t.true(unpackedTrue, 'true primitive was unpacked correctly');

	const unpackedFalse = unpack(pack(false)) as false;

	t.false(unpackedFalse, 'false primitive was unpacked correctly');
});

test('null/undefined primitives', t => {
	t.plan(2);

	const unpackedNull = unpack(pack(null)) as null;

	t.equal(unpackedNull, null, 'null primitive was unpacked correctly');

	const unpackedUndefined = unpack(pack(undefined)) as null;

	t.equal(unpackedUndefined, null, 'undefined primitive was unpacked correctly to null');
});

test('number (float and non-float)', t => {
	t.plan(4);

	const smallNumber = -64;
	const number = 128;
	const float = 4.2;

	const unpackedSmallNumber = unpack(pack(smallNumber)) as number;

	t.equal(unpackedSmallNumber, smallNumber, 'small number primitive was unpacked correctly');

	const unpackedNumber = unpack(pack(number)) as number;

	t.equal(unpackedNumber, number, 'number primitive was unpacked correctly');

	const unpackedFloat = unpack(pack(float)) as number;

	t.equal(unpackedFloat, float, 'number primitive (float) was unpacked correctly');

	t.throws(() => pack(Infinity), 'cannot pack non-finite numbers');
});

test('bigint', t => {
	t.plan(1);

	const number = 32n;

	const unpackedNumber = unpack(pack(number)) as bigint;

	t.equal(unpackedNumber, number, 'bigint primitive was unpacked correctly');
});

test('bigint (32bit integer limit :: signed/unsigned)', t => {
	t.plan(2);

	const signed = 2147483647n;

	const unpackedSigned = unpack(pack(signed)) as bigint;

	t.equal(unpackedSigned, signed, 'signed bigint primitive was unpacked correctly');

	const unsigned = 4294967295n;

	const unpackedUnsigned = unpack(pack(unsigned)) as bigint;

	t.equal(unpackedUnsigned, unsigned, 'unsigned bigint primitive was unpacked correctly');
});

test('bigint (64bit integer limit :: signed/unsigned)', t => {
	t.plan(2);

	const signed = 9223372036854775807n;

	const unpackedSigned = unpack(pack(signed)) as bigint;

	t.equal(unpackedSigned, signed, 'signed bigint primitive was unpacked correctly');

	const unsigned = -18446744073709551615n;

	const unpackedUnsigned = unpack(pack(unsigned)) as bigint;

	t.equal(unpackedUnsigned, unsigned, 'unsigned negative bigint primitive was unpacked correctly');
});

test('Cannot serialize Symbols', t => {
	t.plan(1);

	t.throws(() => pack(Symbol('hello_world')));
});
