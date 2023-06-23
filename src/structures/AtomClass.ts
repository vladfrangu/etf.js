/**
 * Represents an Atom in ETF
 */
class Atom {

	public name: string;

	public constructor(name: string) {
		if (typeof name !== 'string') throw new TypeError('Atom name must be a string.');
		if (name.length > 255) throw new RangeError('Atom name must not be longer than 255 characters.');
		this.name = name;
	}

	/**
	 * Defines the toString() method of this class
	 */
	public toString() {
		return `Atom(${this.name})`;
	}

	public valueOf() {
		return this.name;
	}

}

export default (name: string) => new Atom(name);
export { Atom as AtomClass };
