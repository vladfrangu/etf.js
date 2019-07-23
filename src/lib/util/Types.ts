export interface PortData {
	node: any;
	id: number;
	creation: number;
}

export interface PidData {
	node: any;
	id: number;
	serial: number;
	creation: number;
}

export interface NewReferenceData {
	node: any;
	creation: number;
	id: number[];
}

export interface ExportData {
	mod: unknown;
	fun: unknown;
	arity: unknown;
}
