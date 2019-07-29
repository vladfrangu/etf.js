extern crate wasm_bindgen;
extern crate js_sys;
extern crate byteorder;

use wasm_bindgen::prelude::*;
use wasm_bindgen::throw_str;
use byteorder::{ByteOrder,BigEndian,LittleEndian};

use crate::constants::*;

#[wasm_bindgen]
extern {
  #[wasm_bindgen(js_namespace = console, js_name = log)]
  pub fn console_log(s: &str);
}

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

		self.pack(&self.value.as_ref().clone());

		self.buffer.as_ref()
	}

	fn pack(&mut self, value: &JsValue) {
		if value.is_null() || value.is_undefined() {
			return self.write_atom(&"nil").unwrap_throw();
		}

		if let Some(boolean) = value.as_bool() {
			return if boolean {
				self.write_atom(&"true").unwrap_throw()
			} else {
				self.write_atom(&"false").unwrap_throw()
			}
		}

		if let Some(string) = value.as_string() {
			return self.write_string(string);
		}

		if let Some(number) = value.as_f64() {
			match self.write_number(number) {
				Err(error) => throw_str(&error),
				_ => {}
			}
			return;
		}

		// TODO: Atom classes, Arrays/Set, Map/Objects

		throw_str(&"The primitive value you passed in cannot be packed");
	}

	fn write_atom(&mut self, value: &str) -> Result<(), String> {
		if value.len() > 255 {
			return Err(format!("\"{}\" is too long of an Atom name", value));
		}

		let is_ascii = value.as_bytes().iter().all(|&c| c < 0x80);

		if is_ascii {
			self.write_8(ATOM_EXT);
		} else {
			self.write_8(ATOM_UTF8_EXT);
		}

		self.write_16(value.len() as u16);
		self.write_all(value.as_bytes());

		Ok(())
	}

	fn write_string(&mut self, value: String) {
		if value.len() == 0 {
			self.write_8(NIL_EXT);
			return;
		}
		self.write_8(STRING_EXT);
		self.write_32(value.len() as u32);
		self.write_all(value.as_bytes());
	}

	fn write_number(&mut self, value: f64) -> Result<bool, String> {
		if !value.is_finite() {
			return Err(format!("\"{}\" is not a finite number", value.to_string()));
		}

		let rounded = value.round();

		if value == rounded {
			if rounded >= 0.0 && rounded <= 255.0 {
				self.write_8(SMALL_INTEGER_EXT);
				self.write_8(rounded as u8);
			} else {
				self.write_8(INTEGER_EXT);
				let mut bytes: [u8; 4] = [0, 0, 0, 0];
				BigEndian::write_i32(&mut bytes, rounded as i32);
				self.write_all(&bytes);
			}
		} else {
			self.write_8(NEW_FLOAT_EXT);
			let mut bytes: [u8; 8] = [0, 0, 0, 0, 0, 0, 0, 0];
			LittleEndian::write_f64(&mut bytes, value);
			self.write_all(&bytes);
		}

		Ok(true)
	}

	fn write_all(&mut self, bytes: &[u8]) {
		for byte in bytes.iter() {
			self.write_8(*byte);
		}
	}

	fn write_8(&mut self, value: u8) {
		self.buffer.push(value);
	}

	fn write_16(&mut self, value: u16) {
		let bytes = value.to_be_bytes();
		for byte in bytes.iter() {
			self.write_8(*byte);
		}
	}

	fn write_32(&mut self, value: u32) {
		let bytes = value.to_be_bytes();
		for byte in bytes.iter() {
			self.write_8(*byte);
		}
	}
}
