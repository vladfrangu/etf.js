extern crate wasm_bindgen;
extern crate js_sys;

use wasm_bindgen::prelude::*;
use js_sys::*;
mod packer;
mod constants;

use packer::Packer;

#[wasm_bindgen]
pub fn native_pack(value: JsValue) -> Uint8Array {
    let mut packer = Packer::new(value);
    let packed = packer.process();
    unsafe { Uint8Array::view(packed) }
}
