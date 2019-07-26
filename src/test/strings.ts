import * as test from 'tape';
import { pack, unpack, Atom } from '../index';
import { AtomClass } from '../lib/structures/Atom';

const emojiString = '👀❤️👐';

// Yes, zalgo..Gotta test them all
const zalgoString = 'Ḣ͚͇͎̰̙̗̹́͟e̞̪̫̣͖̱͍̻̲ͧ̌̀̚̚͘͜w̸̡͕̽̈̾ͬw̥̪͈̖̻ͭ̈́̽ͫ̈͘ơ̢̞ͭͣ̅̑ͭ͗̒̃ ̸͔̝̟̟̳̝͋̄ͥ̈͞W̸͍̬̎̊̎̑͆̐̀̕ò̰̙̺̋ͭ͗́̄̚͝r̪͈̹͈ͧ̅ͨ͛͋͛̃͒̌́l̴̡̰̰͇̪̘̱ͯ̈̓ͨ̕d͎͙̥̩̔̾ͦ̀͞';

test('ASCII strings', t => {
	t.plan(1);

	const string = 'Hello world!';

	const unpacked = unpack(pack(string)) as string;

	t.equal(unpacked, string, 'string was unpacked properly');
});

test('UTF-8 strings', t => {
	t.plan(2);

	const emojiAtom = Atom(emojiString);

	const unpackedEmoji = unpack(pack(emojiString)) as string;

	t.equal(unpackedEmoji, emojiString, 'emoji string was unpacked properly');

	const unpackedAtom = unpack(pack(emojiAtom)) as AtomClass;

	t.equal(unpackedAtom.name, emojiAtom.name, 'Atom emoji string was unpacked properly');
});

test('Zalgo', t => {
	t.plan(2);

	const zalgoAtom = Atom(zalgoString);

	const unpackedZalgo = unpack(pack(zalgoString)) as string;

	t.equal(unpackedZalgo, zalgoString, 'zalgo text is unpacked correctly');

	const unpackedAtom = unpack(pack(zalgoAtom)) as AtomClass;

	t.equal(unpackedAtom.name, zalgoAtom.name, 'Atom zalgo string was unpacked properly');
});
