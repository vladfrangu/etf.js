extern crate wasm_bindgen;
extern crate js_sys;

use wasm_bindgen::prelude::*;
use crate::constants::*;

pub struct Packer {
	value: JsValue,
	buffer: Vec<u8>
}

impl Packer {
	pub fn new(value: JsValue) -> Packer {
		let buffer = vec![];
		Packer {
			value,
			buffer
		}
	}

	pub fn process(&mut self) -> &Vec<u8> {
		self.write_8(ETF_VERSION);

		self.buffer.as_ref()
	}

	fn write_8(&mut self, value: u8) {
		self.buffer.push(value);
	}

	// fn write_16(&mut self, value: u16) {
	// 	let bytes = value.to_be_bytes();
	// 	self.buffer[self.offset] = bytes[0];
	// 	self.buffer[self.offset + 1] = bytes[1];
	// 	self.offset = self.offset + 2;
	// }

	// fn write_32(&mut self, value: u32) {
	// 	let bytes = value.to_be_bytes();
	// 	self.buffer[self.offset] = bytes[0];
	// 	self.buffer[self.offset + 1] = bytes[1];
	// 	self.buffer[self.offset + 2] = bytes[2];
	// 	self.buffer[self.offset + 3] = bytes[3];
	// 	self.offset = self.offset + 4;
	// }
}
