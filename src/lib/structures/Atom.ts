/**
 * Represents an Atom in ETF
 */
class Atom {

	public name: string;

	public constructor(name: string) {
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
