// import { Tokens } from './util/Constants';

const float64Array = new Float64Array(1);
const uInt8Float64Array = new Uint8Array(float64Array.buffer);

class Packer {

	private offset = 0;
	private _buffer: Uint8Array | null = new Uint8Array(16);
	private _data: any;

	public constructor(data: any) {
		this._data = data;
	}

	public process() {
		this.parse(this._data);
		const temp = this._buffer!.subarray(0, this.offset);

		this._data = null;
		this.offset = 0;
		this._buffer = null;
		return temp;
	}

}

export { Packer };
