extern crate wasm_bindgen;
extern crate js_sys;

#[macro_use(lazy_static)]
extern crate lazy_static;

use wasm_bindgen::prelude::*;
mod packer;
mod constants;

#[wasm_bindgen]
extern {
  #[wasm_bindgen(js_namespace = console, js_name = log)]
  pub fn console_log(s: &str);
}

use packer::Packer;

#[wasm_bindgen]
pub fn native_pack(value: JsValue) -> Vec<u8> {
    let mut packer = Packer::new(value);
    let packed = packer.process();
    console_log(&format!("{:?}", packed));
    packed.to_vec()
}
