import { Tokens, ETF_VERSION } from './util/Constants';
import { PortData, NewReferenceData, PidData, ExportData } from './util/Types';

const float64Array = new Float64Array(1);
const uInt8Float64Array = new Uint8Array(float64Array.buffer);

export class Unpacker {

	private offset = 0;
	private _buffer: Uint8Array | null;

	public constructor(buffer: Uint8Array) {
		this._buffer = buffer;
	}

	public unpack() {
		if (this.read8() !== ETF_VERSION) throw new Error('Incompatible ETF version.');
		if (this.read8() === Tokens.COMPRESSED) this.decompress();
		return this.read();
	}

	private read() {
		const type = this.read8();
		switch (type) {
			case Tokens.ATOM_CACHE_REF: return this.readAtomCacheRef();
			case Tokens.SMALL_INTEGER_EXT: return this.readSmallIntegerExt();
			case Tokens.INTEGER_EXT: return this.readIntegerExt();
			case Tokens.FLOAT_EXT: return this.readFloatExt();
			case Tokens.PORT_EXT: return this.readPortExt();
			case Tokens.NEW_PORT_EXT: return this.readNewPortExt();
			case Tokens.PID_EXT: return this.readPidExt();
			case Tokens.NEW_PID_EXT: return this.readNewPidExt();
			case Tokens.SMALL_TUPLE_EXT: return this.readSmallTupleExt();
			case Tokens.LARGE_TUPLE_EXT: return this.readLargeTupleExt();
			case Tokens.MAP_EXT: return this.readMapExt();
			case Tokens.NIL_EXT: return this.readNilExt();
			case Tokens.STRING_EXT: return this.readStringExt();
			case Tokens.LIST_EXT: return this.readListExt();
			case Tokens.BINARY_EXT: return this.readBinaryExt();
			case Tokens.SMALL_BIG_EXT: return this.readSmallBigExt();
			case Tokens.LARGE_BIG_EXT: return this.readLargeBigExt();
			case Tokens.NEW_REFERENCE_EXT: return this.readNewReferenceExt();
			case Tokens.NEWER_REFERENCE_EXT: return this.readNewerReferenceExt();
			case Tokens.FUN_EXT: return this.readFunExt();
			case Tokens.NEW_FUN_EXT: return this.readNewFunExt();
			case Tokens.EXPORT_EXT: return this.readExportExt();
			case Tokens.BIT_BINARY_EXT: return this.readBitBinaryExt();
			case Tokens.NEW_FLOAT_EXT: return this.readNewFloatExt();
			case Tokens.ATOM_UTF8_EXT: return this.readAtomUtf8Ext();
			case Tokens.SMALL_ATOM_UTF8_EXT: return this.readSmallAtomUtf8Ext();
			default: throw new Error(`Unsupported erlang term type identifier found: ${type}`);
		}
	}

	/**
	 * Refers to the atom with AtomCacheReferenceIndex in the distribution header.
	 * @structure
	 * | 1  | 1                       |
	 * | 82 | AtomCacheReferenceIndex |
	 * @internal
	 */
	private readAtomCacheRef() {
		// TODO(kyranet): Finish this
	}

	/**
	 * Unsigned 8-bit integer.
	 * @structure
	 * | 1  | 1   |
	 * | 97 | Int |
	 * @internal
	 */
	private readSmallIntegerExt() {
		return this.read8();
	}

	/**
	 * Signed 32-bit integer in big-endian format.
	 * @structure
	 * | 1  | 4   |
	 * | 98 | Int |
	 * @internal
	 */
	private readIntegerExt() {
		return this.read32();
	}

	/**
	 * A finite float (i.e. not inf, -inf or NaN) is stored in string format.
	 * @structure
	 * | 1  | 31           |
	 * | 99 | Float string |
	 * @internal
	 */
	private readFloatExt() {
		return this.readF64();
	}

	/**
	 * Same as NEW_PORT_EXT except the Creation field is only one byte and only two bits are significant, the rest are
	 * to be 0.
	 * @structure
	 * | 1   | N    | 4  | 1        |
	 * | 102 | Node | ID | Creation |
	 * @internal
	 */
	private readPortExt(): PortData {
		return {
			node: this.read(),
			id: this.read32(),
			creation: this.read8()
		};
	}

	/**
	 * Encodes a port identifier. Node is an encoded atom, that is, ATOM_UTF8_EXT, SMALL_ATOM_UTF8_EXT or ATOM_CACHE_REF.
	 * ID is a 32-bit big endian unsigned integer. Only 28 bits are significant; the rest are to be 0. The Creation works
	 * just like in NEW_PID_EXT. Port operations are not allowed across node boundaries.
	 * @structure
	 * | 1  | N    | 4  | 4        |
	 * | 89 | Node | ID | Creation |
	 * @internal
	 */
	private readNewPortExt(): PortData {
		return {
			node: this.read(),
			id: this.read32(),
			creation: this.read32()
		};
	}

	/**
	 * Same as NEW_PID_EXT except the Creation field is only one byte and only two bits are significant, the rest are
	 * to be 0.
	 * @structure
	 * | 1   | N    | 4  | 4      | 1        |
	 * | 103 | Node | ID | Serial | Creation |
	 * @internal
	 */
	private readPidExt(): PidData {
		return {
			node: this.read(),
			id: this.read32(),
			serial: this.read32(),
			creation: this.read8()
		};
	}

	/**
	 * Encodes an Erlang process identifier object.
	 * - Node
	 *     The name of the originating node, encoded using ATOM_UTF8_EXT, SMALL_ATOM_UTF8_EXT or ATOM_CACHE_REF.
	 * - ID
	 *     A 32-bit big endian unsigned integer. Only 15 bits are significant; the rest are to be 0.
	 * - Serial
	 *     A 32-bit big endian unsigned integer. Only 13 bits are significant; the rest are to be 0.
	 * - Creation
	 *     A 32-bit big endian unsigned integer. All identifiers originating from the same node incarnation must have
	 *     identical Creation values. This makes it possible to separate identifiers from old (crashed) nodes from a new
	 *     one.
	 * @structure
	 * | 1  | N    | 4  | 4      | 4        |
	 * | 88 | Node | ID | Serial | Creation |
	 * @internal
	 */
	private readNewPidExt(): PidData {
		return {
			node: this.read(),
			id: this.read32(),
			serial: this.read32(),
			creation: this.read32()
		};
	}

	/**
	 * Encodes a tuple. The Arity field is an unsigned byte that determines how many elements that follows in section
	 * Elements.
	 * @structure
	 * | 1   | 1     | N        |
	 * | 104 | Arity | Elements |
	 * @internal
	 */
	private readSmallTupleExt() {
		const len = this.read8();
		return this.readArray(len);
	}

	/**
	 * Same as SMALL_TUPLE_EXT except that Arity is an unsigned 4 byte integer in big-endian format.
	 * @structure
	 * | 1   | 4     | N        |
	 * | 105 | Arity | Elements |
	 * @internal
	 */
	private readLargeTupleExt() {
		const len = this.read32();
		return this.readArray(len);
	}

	/**
	 * Encodes a map. The Arity field is an unsigned 4 byte integer in big-endian format that determines the number of
	 * key-value pairs in the map. Key and value pairs (Ki => Vi) are encoded in section Pairs in the following order:
	 * K1, V1, K2, V2,..., Kn, Vn. Duplicate keys are not allowed within the same map.
	 * @structure
	 * | 1   | 4     | N     |
	 * | 116 | Arity | Pairs |
	 * @internal
	 */
	private readMapExt() {
		const obj: Record<any, unknown> = {};
		const len = this.read32();
		for (let i = 0; i < len; i++) {
			const key: any = this.read();
			const value = this.read();
			obj[key] = value;
		}

		return obj;
	}

	/**
	 * The representation for an empty list, that is, the Erlang syntax [].
	 * @structure
	 * | 1   |
	 * | 106 |
	 * @internal
	 */
	private readNilExt() {
		return [];
	}

	/**
	 * String does not have a corresponding Erlang representation, but is an optimization for sending lists of bytes
	 * (integer in the range 0-255) more efficiently over the distribution. As field Length is an unsigned 2 byte
	 * integer (big-endian), implementations must ensure that lists longer than 65535 elements are encoded as LIST_EXT.
	 * @structure
	 * | 1   | 2   | Len        |
	 * | 107 | Len | Characters |
	 * @internal
	 */
	private readStringExt() {
		const len = this.read16();
		return this.readString(len);
	}

	/**
	 * Length is the number of elements that follows in section Elements. Tail is the final tail of the list; it is
	 * NIL_EXT for a proper list, but can be any type if the list is improper.
	 * @structure
	 * | 1   | 4      |          |      |
	 * | 108 | Length | Elements | Tail |
	 * @internal
	 */
	private readListExt() {
		const len = this.read32();
		const array = this.readArray(len);

		const tail = this.read8();

		if (tail !== Tokens.NIL_EXT) throw new Error("Received list doesn't end with a tail marker when it should");

		return array;
	}

	/**
	 * Binaries are generated with bit syntax expression or with erlang:list_to_binary/1, erlang:term_to_binary/1, or as
	 * input from binary ports. The Len length field is an unsigned 4 byte integer (big-endian).
	 * @structure
	 * | 1   | 4   | Len  |
	 * | 109 | Len | Data |
	 * @internal
	 */
	private readBinaryExt() {
		const length = this.read32();
		this.ensureBytes(length);
		const buffer = this._buffer!.subarray(this.offset, length);
		this.offset += length;
		return buffer;
	}

	/**
	 * Bignums are stored in unary form with a Sign byte, that is, 0 if the binum is positive and 1 if it is negative.
	 * The digits are stored with the least significant byte stored first. To calculate the integer, the following
	 * formula can be used:
	 * (d0 * B ^ 0 + d1 * B ^ 1 + d2 * B ^ 2 + ... d(N - 1) * B ^ (n - 1))
	 * @structure
	 * | 1   | 1 | 1    | n               |
	 * | 110 | n | Sign | d(0) ... d(n-1) |
	 * @internal
	 */
	private readSmallBigExt() {
		const bytes = this.read8();
		return this.decodeBig(bytes);
	}

	/**
	 * Same as SMALL_BIG_EXT except that the length field is an unsigned 4 byte integer.
	 * @structure
	 * | 1   | 4 | 1    | n               |
	 * | 111 | n | Sign | d(0) ... d(n-1) |
	 * @internal
	 */
	private readLargeBigExt() {
		const bytes = this.read32();
		return this.decodeBig(bytes);
	}

	/**
	 * The same as NEWER_REFERENCE_EXT except:
	 * - ID
	 *     In the first word (4 bytes) of ID, only 18 bits are significant, the rest must be 0.
	 * - Creation
	 *     Only one byte long and only two bits are significant, the rest must be 0.
	 * @structure
	 * | 1   | 2   | N    | 1        | N'     |
	 * | 114 | Len | Node | Creation | ID ... |
	 * @internal
	 */
	private readNewReferenceExt() {
		const data: NewReferenceData = { node: null, creation: 0, id: [] };
		const len = this.read16();

		data.node = this.read();
		data.creation = this.read8();

		for (let i = 0; i < len; i++) data.id.push(this.read32());

		return data;
	}

	/**
	 * Encodes a reference term generated with erlang:make_ref/0.
	 * - Node
	 *     The name of the originating node, encoded using ATOM_UTF8_EXT, SMALL_ATOM_UTF8_EXT or ATOM_CACHE_REF.
	 * - Len
	 *     A 16-bit big endian unsigned integer not larger than 3.
	 * - ID
	 *     A sequence of Len big-endian unsigned integers (4 bytes each, so N' = 4 * Len), but is to be regarded as
	 *     uninterpreted data.
	 * - Creation
	 *     Works just like in NEW_PID_EXT.
	 * @structure
	 * | 1  | 2   | N    | 4        | N'     |
	 * | 90 | Len | Node | Creation | ID ... |
	 * @internal
	 */
	private readNewerReferenceExt() {
		const data: NewReferenceData = { node: null, creation: 0, id: [] };
		const len = this.read16();

		data.node = this.read();
		data.creation = this.read32();

		for (let i = 0; i < len; i++) data.id.push(this.read32());

		return data;
	}

	/**
	 * - Pid
	 *     A process identifier as in PID_EXT. Represents the process in which the fun was created.
	 * - Module
	 *     Encoded as an atom, using ATOM_UTF8_EXT, SMALL_ATOM_UTF8_EXT, or ATOM_CACHE_REF. This is the module that the
	 *     fun is implemented in.
	 * - Index
	 *     An integer encoded using SMALL_INTEGER_EXT or INTEGER_EXT. It is typically a small index into the module's
	 *     fun table.
	 * - Uniq
	 *     An integer encoded using SMALL_INTEGER_EXT or INTEGER_EXT. Uniq is the hash value of the parse for the fun.
	 * - Free vars
	 *     NumFree number of terms, each one encoded according to its type.
	 * @structure
	 * | 1   | 4       | N1  | N2     | N3    | N4   | N5            |
	 * | 117 | NumFree | Pid | Module | Index | Uniq | Free vars ... |
	 * @internal
	 */
	private readFunExt() {
		// TODO(kyranet): Having fun?
	}

	/**
	 * This is the new encoding of internal funs: fun F/A and fun(Arg1,..) -> ... end.
	 * - Size
	 *     The total number of bytes, including field Size.
	 * - Arity
	 *     The arity of the function implementing the fun.
	 * - Uniq
	 *     The 16 bytes MD5 of the significant parts of the Beam file.
	 * - Index
	 *     An index number. Each fun within a module has an unique index. Index is stored in big-endian byte order.
	 * - NumFree
	 *     The number of free variables.
	 * - Module
	 *     Encoded as an atom, using ATOM_UTF8_EXT, SMALL_ATOM_UTF8_EXT, or ATOM_CACHE_REF. Is the module that the fun
	 *     is implemented in.
	 * - OldIndex
	 *     An integer encoded using SMALL_INTEGER_EXT or INTEGER_EXT. Is typically a small index into the module's fun
	 *     table.
	 * - OldUniq
	 *     An integer encoded using SMALL_INTEGER_EXT or INTEGER_EXT. Uniq is the hash value of the parse tree for the
	 *     fun.
	 * - Pid
	 *     A process identifier as in PID_EXT. Represents the process in which the fun was created.
	 * - Free vars
	 *     NumFree number of terms, each one encoded according to its type.
	 * @structure
	 * | 1   | 4    | 1     | 16   | 4     | 4       | N1     | N2       | N3      | N4  | N5        |
	 * | 112 | Size | Arity | Uniq | Index | NumFree | Module | OldIndex | OldUniq | Pid | Free Vars |
	 * @internal
	 */
	private readNewFunExt() {
		// TODO(kyranet): Even more fun!
	}

	/**
	 * This term is the encoding for external funs: fun M:F/A.
	 * Module and Function are atoms (encoded using ATOM_UTF8_EXT, SMALL_ATOM_UTF8_EXT, or ATOM_CACHE_REF).
	 * Arity is an integer encoded using SMALL_INTEGER_EXT.
	 * @structure
	 * | 1   | N1     | N2       | N3    |
	 * | 113 | Module | Function | Arity |
	 * @internal
	 */
	private readExportExt(): ExportData {
		return {
			mod: this.read(),
			fun: this.read(),
			arity: this.read()
		};
	}

	/**
	 * This term represents a bitstring whose length in bits does not have to be a multiple of 8. The Len field is an
	 * unsigned 4 byte integer (big-endian). The Bits field is the number of bits (1-8) that are used in the last byte
	 * in the data field, counting from the most significant bit to the least significant.
	 * @structure
	 * | 1  | 4   | 1    | Len  |
	 * | 77 | Len | Bits | Data |
	 * @internal
	 */
	private readBitBinaryExt() {
		const len = this.read32();
		const bits = this.read8();
		this.ensureBytes(len);
		const buffer = new Uint8Array(len);
		buffer.set(this._buffer!.subarray(this.offset, this.offset + len));
		this.offset += len;
		buffer[len - 1] = buffer[len - 1] >> (8 - bits);
		return buffer;
	}

	/**
	 * A finite float (i.e. not inf, -inf or NaN) is stored as 8 bytes in big-endian IEEE format.
	 * This term is used in minor version 1 of the external format.
	 * @structure
	 * | 1  | 8          |
	 * | 70 | IEEE float |
	 * @internal
	 */
	private readNewFloatExt() {
		return this.readF64();
	}

	/**
	 * An atom is stored with a 2 byte unsigned length in big-endian order, followed by Len bytes containing the
	 * AtomName encoded in UTF-8.
	 * @structure
	 * | 1   | 2   | Len      |
	 * | 118 | Len | AtomName |
	 * @internal
	 */
	private readAtomUtf8Ext() {
		const len = this.read16();
		const atom = this.readString(len);
		return this.parseAtom(atom);
	}

	/**
	 * An atom is stored with a 1 byte unsigned length, followed by Len bytes containing the AtomName encoded in UTF-8.
	 * Longer atoms encoded in UTF-8 can be represented using ATOM_UTF8_EXT.
	 * @structure
	 * | 1   | 1   | Len      |
	 * | 119 | Len | AtomName |
	 * @internal
	 */
	private readSmallAtomUtf8Ext() {
		const len = this.read8();
		const atom = this.readString(len);
		return this.parseAtom(atom);
	}

	private decompress() {
		// const length = this.read32();
		// Implement z-lib compression stuff
		// TODO(vladfrangu): use pako for cross-compatible decompressing of data
	}

	private decodeBig(digits: number) {
		const sign = this.read8();
		if (digits > 8) {
			throw new Error('Unable to decode big ints larger than 8 bytes');
		}

		let value = 0n;
		let b = 1n;
		for (let i = 0; i < digits; ++i) {
			const digit = BigInt(this.read8());
			value += digit * b;
			b <<= 8n;
		}

		return sign === 0 ? value : -value;
	}

	private parseAtom(atom?: unknown) {
		if (!atom) {
			return undefined;
		}

		if (atom === 'nil' || atom === 'null') {
			return null;
		}

		if (atom === 'true') {
			return true;
		}

		if (atom === 'false') {
			return false;
		}

		return atom;
	}

	private readString(length: number) {
		this.ensureBytes(length);
		const sub = this._buffer!.subarray(this.offset, this.offset + length);
		const str: string = Unpacker._textDecoder.decode(sub);
		this.offset += length;
		return str;
	}

	private readArray(length: number) {
		const result: unknown[] = [];
		for (let i = 0; i < length; i++) {
			const value = this.read();
			result.push(value);
		}

		return result;
	}

	private read8() {
		this.ensureBytes(1);
		return this._buffer![this.offset++];
	}

	private read16() {
		this.ensureBytes(2);
		return (this._buffer![this.offset++] * (2 ** 8)) +
			this._buffer![this.offset++];
	}

	private read32() {
		this.ensureBytes(4);
		return (this._buffer![this.offset++] * (2 ** 24)) +
			(this._buffer![this.offset++] * (2 ** 16)) +
			(this._buffer![this.offset++] * (2 ** 8)) +
			this._buffer![this.offset++];
	}

	private readF64() {
		this.ensureBytes(8);
		uInt8Float64Array[0] = this._buffer![this.offset++];
		uInt8Float64Array[1] = this._buffer![this.offset++];
		uInt8Float64Array[2] = this._buffer![this.offset++];
		uInt8Float64Array[3] = this._buffer![this.offset++];
		uInt8Float64Array[4] = this._buffer![this.offset++];
		uInt8Float64Array[5] = this._buffer![this.offset++];
		uInt8Float64Array[6] = this._buffer![this.offset++];
		uInt8Float64Array[7] = this._buffer![this.offset++];
		return float64Array[0];
	}

	private ensureBytes(amount: number) {
		if (this.offset + amount > this._buffer!.length) {
			throw new Error(`Found End-Of-Buffer, expecting ${amount} byte(s).`);
		}
	}

	private static _textDecoder = new TextDecoder('utf8');

}
