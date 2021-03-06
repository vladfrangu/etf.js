export type Atom = string | boolean | null | undefined;

export interface PortData {
	node: Atom;
	id: number;
	creation: number;
}

export interface PidData {
	node: Atom;
	id: number;
	serial: number;
	creation: number;
}

export interface NewReferenceData {
	node: Atom;
	creation: number;
	id: number[];
}

export interface ExportData {
	mod: Atom;
	fun: Atom;
	arity: number;
}

export interface FunData {
	numFree: number;
	pid: PidData;
	module: Atom;
	index: number;
	uniq: number;
	freeVars: unknown[];
}

export interface NewFunData {
	size: number;
	arity: number;
	uniq: string;
	index: number;
	numFree: number;
	module: Atom;
	oldIndex: number;
	oldUniq: number;
	pid: PidData;
	freeVars: unknown[];
}
