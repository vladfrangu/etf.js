extern crate wasm_bindgen;
extern crate js_sys;

use wasm_bindgen::prelude::*;
use js_sys::*;
mod packer;
mod constants;

use packer::Packer;

#[wasm_bindgen]
extern {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    pub fn console_log(s: &str);
}

#[wasm_bindgen]
pub fn pack(value: JsValue) -> Uint8Array {
    let mut packer = Packer::new(value);
    let packed = packer.process();
    unsafe { Uint8Array::view(packed) }
}

#[wasm_bindgen]
pub fn test() {
    console_log(&"Hello mommy");
}
