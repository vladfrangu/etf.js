import { test, pack } from '../wasm/etfjs';

test();
console.log(pack('Hello World!'));
console.log(pack(131));
console.log(pack(['Hello!']));
console.log(pack(Symbol('Oh la la!')));
console.log(pack(42069n));
