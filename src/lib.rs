extern crate wasm_bindgen;
extern crate js_sys;

#[macro_use(lazy_static)]
extern crate lazy_static;

mod packer;
mod constants;

use wasm_bindgen::prelude::*;
use packer::Packer;

#[wasm_bindgen]
pub fn native_pack(value: JsValue) -> Vec<u8> {
    let mut packer = Packer::new(value);
    let packed = packer.process();
    packed.to_vec()
}
