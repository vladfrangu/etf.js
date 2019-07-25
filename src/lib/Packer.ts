import { Tokens } from './util/Constants';

const float64Array = new Float64Array(1);
const uInt8Float64Array = new Uint8Array(float64Array.buffer);

class Packer {

	private _offset = 0;
	private _buffer: Uint8Array | null = new Uint8Array(16);
	private _data: any;

	public constructor(data: any) {
		this._data = data;
	}

	public process() {
		this.pack(this._data);
		const temp = this._buffer!.subarray(0, this._offset);

		this._data = null;
		this._offset = 0;
		this._buffer = null;
		return temp;
	}

	private pack(value: unknown) {
		if (value === null || value === undefined) {
			return this.writeAtom('nil');
		}

		const typeofValue = typeof value;

		switch (typeofValue) {
			case 'bigint': return this.writeBigInt(value as bigint);
			case 'boolean': return this.writeAtom(value ? 'true' : 'false');
			case 'number': return this.writeNumber(value as number);
			case 'string': return this.writeString(value as string);
			case 'object': {
				if (Array.isArray(value) || value instanceof Set) return this.writeArray(value);
				if (value instanceof Map) return this.writeMap(value);
				return this.writeMap(value as Record<any, unknown>);
			}
			// TODO: Symbols and functions?
			default: throw new Error(`Could not parse primitive type "${typeofValue}".`);
		}

	}

	private writeAtom(atom: any) {
		const encoded = Packer._textEncoder.encode(atom);
		if (encoded.length > 0xFFFF) throw new Error('Atom is too large!');
		const isAscii = encoded.every(byte => byte < 0x80);
		if (isAscii) {
			this.write8(Tokens.ATOM_EXT);
		} else {
			this.write8(Tokens.ATOM_UTF8_EXT);
		}
		this.write16(encoded.length);
		this.write(encoded);
	}

	private writeNil() {
		this.write8(Tokens.NIL_EXT);
	}

	private writeNumber(value: number) {
		if (!Number.isFinite(value)) throw new Error(`"${value}" is not a finite number.`);
		if (value === (value | 0)) {
			if (value > -128 && value < 128) {
				this.write8(Tokens.SMALL_INTEGER_EXT);
				this.write8(value);
			} else {
				this.write8(Tokens.INTEGER_EXT);
				this.write32(value);
			}
		} else {
			this.write8(Tokens.NEW_FLOAT_EXT);
			this.writeF64(value);
		}
	}

	private writeBigInt(value: bigint) {
		this.write8(Tokens.LARGE_BIG_EXT);

		const byteCountIndex = this._offset;

		this.ensureAlloc(4);
		this._offset += 4;

		const sign = value > 0n ? 0 : 1;
		this.write8(sign);

		let byteCount = 0;
		let b = sign === 1 ? -value : value;
		while (b > 0) {
			byteCount += 1;
			this.write8(Number(b & 0xFFn));
			b >>= 8n;
		}

		this._buffer![byteCountIndex] = byteCount;
	}

	private writeString(value: string) {
		this.write8(Tokens.BINARY_EXT);
		const encoded = Packer._textEncoder.encode(value);
		this.write32(encoded.length);
		this.write(encoded);
	}

	private writeArray(array: unknown[] | Set<unknown>) {
		const length = Array.isArray(array) ? array.length : array.size;

		if (length === 0) {
			return this.writeNil();
		}

		this.write8(Tokens.LIST_EXT);
		this.write32(length);

		for (const value of array) this.pack(value);

		this.writeNil();
	}

	private writeMap(value: Record<any, unknown> | Map<any, unknown>) {
		const entries = value instanceof Map ? [...value.entries()] : Object.entries(value);
		this.write8(Tokens.MAP_EXT);

		this.write32(entries.length);

		for (const [key, value] of entries) {
			this.pack(key);
			this.pack(value);
		}
	}

	private write(value: Uint8Array) {
		this.ensureAlloc(value.byteLength);
		this._buffer!.set(value, this._offset);
		this._offset += value.byteLength;
	}

	private write8(value: number) {
		this.ensureAlloc(1);
		this._buffer![this._offset++] = value;
	}

	private write16(value: number) {
		this.ensureAlloc(2);
		this.write16At(value, this._offset);
		this._offset += 2;
	}

	private write16At(value: number, offset: number) {
		this._buffer![offset + 1] = value;
		value >>>= 8;
		this._buffer![offset] = value;
	}

	private write32(value: number) {
		this.ensureAlloc(4);
		this.write32At(value, this._offset);
		this._offset += 4;
	}

	private write32At(value: number, offset: number) {
		this._buffer![offset + 3] = value;
		value >>>= 8;
		this._buffer![offset + 2] = value;
		value >>>= 8;
		this._buffer![offset + 1] = value;
		value >>>= 8;
		this._buffer![offset] = value;
	}

	private writeF64(value: number) {
		float64Array[0] = value;
		this.write(uInt8Float64Array);
	}

	private ensureAlloc(amount: number) {
		this.expandBuffer(this._offset + amount);
	}

	private expandBuffer(length: number) {
		if (this._buffer!.length < length) {
			const old = this._buffer;
			this._buffer = new Uint8Array(Math.pow(2, Math.ceil(Math.log2(length))));
			this._buffer.set(old!);
		}
	}

	private static _textEncoder = new TextEncoder();
}

export { Packer };
