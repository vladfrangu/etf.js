extern crate wasm_bindgen;
extern crate js_sys;
extern crate byteorder;
extern crate regex;

use lazy_static;
use std::convert::TryFrom;
use wasm_bindgen::prelude::*;
use wasm_bindgen::throw_str;
use wasm_bindgen::JsCast;
use js_sys::{Array,Iterator,Map,Set,Object};
use byteorder::{ByteOrder,BigEndian,LittleEndian};
use regex::Regex;
use crate::constants::Constants::*;

#[wasm_bindgen(raw_module = "../dist/structures/AtomClass", js_namespace = AtomClass)]
extern {
	pub type AtomClass;

	#[wasm_bindgen(constructor)]
	fn new(arg: String) -> AtomClass;

	#[wasm_bindgen(method)]
	fn toString(this: &AtomClass) -> String;

	#[wasm_bindgen(method)]
	fn valueOf(this: &AtomClass) -> String;
}

lazy_static! {
	static ref ATOM_REGEXP: Regex = Regex::new(r"Atom\((.+)\)").unwrap();
}

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
		self.write_8(ETF_VERSION as u8);

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
			if let Err(error) = self.write_number(number) {
				throw_str(&error)
			}
			return;
		}

		if value.is_object() {
			if value.is_instance_of::<AtomClass>() {
				let atom = AtomClass::from(value.clone());
				return self.write_atom(&atom.valueOf()).unwrap_throw();
			}

			if Array::is_array(value) {
				let arr = Array::from(&value);
				return self.write_list(arr.length(), &arr.values());
			}

			if value.is_instance_of::<Set>() {
				let set = Set::from(value.clone());
				return self.write_list(set.size(), &set.values());
			}

			if value.is_instance_of::<Map>() {
				let map = Map::from(value.clone());
				return self.write_object(map.size(), &map.entries());
			}

			let entries = Object::entries(&Object::from(value.clone()));
			return self.write_object(entries.length(), &entries.values());
		}

		throw_str(&"The primitive value you passed in cannot be packed");
	}

	fn write_atom(&mut self, value: &str) -> Result<(), String> {
		let len = value.len();

		if len > 255 {
			return Err(format!("\"{}\" is too long of an Atom name", value));
		}

		let bytes = value.as_bytes();
		let is_ascii = bytes.iter().all(|&c| c < 0x80);

		if is_ascii {
			self.write_8(ATOM_EXT as u8);
		} else {
			self.write_8(ATOM_UTF8_EXT as u8);
		}

		self.write_16(len as u16);
		self.write_all(bytes);

		Ok(())
	}

	fn write_string(&mut self, value: String) {
		if value.is_empty() {
			self.write_8(NIL_EXT as u8);
			return;
		}
		self.write_8(BINARY_EXT as u8);
		self.write_32(value.len() as u32);
		self.write_all(value.as_bytes());
	}

	#[allow(clippy::float_cmp)]
	fn write_number(&mut self, value: f64) -> Result<(), String> {
		if !value.is_finite() {
			return Err(format!("\"{}\" is not a finite number", value.to_string()));
		}

		let rounded = value.round();

		if value == rounded {
			if rounded >= 0.0 && rounded <= 255.0 {
				self.write_8(SMALL_INTEGER_EXT as u8);
				self.write_8(rounded as u8);
			} else {
				self.write_8(INTEGER_EXT as u8);
				let mut bytes: [u8; 4] = [0, 0, 0, 0];
				BigEndian::write_i32(&mut bytes, rounded as i32);
				self.write_all(&bytes);
			}
		} else {
			self.write_8(NEW_FLOAT_EXT as u8);
			let mut bytes: [u8; 8] = [0, 0, 0, 0, 0, 0, 0, 0];
			LittleEndian::write_f64(&mut bytes, value);
			self.write_all(&bytes);
		}

		Ok(())
	}

	fn write_list(&mut self, len: u32, iterator: &Iterator) {
		if len == 0 {
			return self.write_8(NIL_EXT as u8);
		}

		self.write_8(LIST_EXT as u8);
		self.write_32(len);

		iterator.into_iter().for_each(|item| self.pack(&item.unwrap_throw()) );

		self.write_8(NIL_EXT as u8);
	}

	fn write_object(&mut self, len: u32, iterator: &Iterator) {
		self.write_8(MAP_EXT as u8);
		self.write_32(len);

		iterator.into_iter().for_each(|item| {
			let arr = Array::from(&item.unwrap_throw());

			arr.values().into_iter().for_each(|arr_item| {
				let kv = arr_item.unwrap_throw();

				if let Some(key) = kv.as_string() {
					if let Some(exec) = ATOM_REGEXP.captures(&key) {
						let atom_name = exec.get(1).unwrap_throw().as_str();
						return self.write_atom(atom_name).unwrap_throw();
					}
				} else if kv.is_object() {
					if let Ok(atom_cls) = AtomClass::try_from(kv.clone()) {
						if let Some(exec) = ATOM_REGEXP.captures(&atom_cls.toString()) {
							let atom_name = exec.get(1).unwrap_throw().as_str();
							return self.write_atom(atom_name).unwrap_throw();
						}
					}
				}

				self.pack(&kv);
			});
		});
	}

	fn write_all(&mut self, bytes: &[u8]) {
		self.buffer.extend_from_slice(bytes);
	}

	fn write_8(&mut self, value: u8) {
		self.buffer.push(value);
	}

	fn write_16(&mut self, value: u16) {
		let bytes = value.to_be_bytes();
		self.buffer.extend_from_slice(&bytes);
	}

	fn write_32(&mut self, value: u32) {
		let bytes = value.to_be_bytes();
		self.buffer.extend_from_slice(&bytes);
	}
}
