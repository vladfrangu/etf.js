import { Packer } from './lib/Packer';
import { Unpacker } from './lib/Unpacker';

/**
 * Packs the data into a serialized ETF buffer
 * @param data The data to pack
 */
export const pack = (data: unknown) => new Packer(data).process();

/**
 * Unpacks the ETF data into usable JS objects
 * @param buffer The raw data
 */
export const unpack = (buffer: Uint8Array) => new Unpacker(buffer).unpack();
