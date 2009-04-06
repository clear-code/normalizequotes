// 文字列等に非ASCII文字を使う場合は、ファイルのエンコーディングを
// UTF-8にしてください。

utils.include(baseURL+'loader.inc');
utils.include(baseURL+'addresses.inc');


function assert_normalize(aExpected, aTest)
{
	assert.equals(aExpected, RFC2822AddressesParser.normalize(aTest));
}

var normalizeTest = new TestCase('normalize');

normalizeTest.tests = {
	setUp : function() {
	  // put setup scripts here.
	},

	tearDown : function() {
	  // put teardown scripts here.
	},

	'閉じられていない括弧': function() {
		assert_normalize('foobar (foobar)', 'foobar (foobar）');
		assert_normalize('foobar (foobar)', 'foobar （foobar）');
	},

	'閉じられていない引用符': function() {
		assert_normalize('foobar "foobar"', 'foobar "foobar”');
		assert_normalize('foobar "foobar"', 'foobar “foobar"');
		assert_normalize('foobar "foobar"', 'foobar "foobar“');
		assert_normalize('foobar "foobar"', 'foobar ”foobar"');
	}
};


function assert_normalizeWhiteSpaces(aExpected, aTest)
{
	assert.equals(aExpected, RFC2822AddressesParser.normalizeWhiteSpaces(aTest));
}

var normalizeWhiteSpacesTest = new TestCase('normalizeWhiteSpaces');

normalizeWhiteSpacesTest.tests = {
	setUp : function() {
	  // put setup scripts here.
	},

	tearDown : function() {
	  // put teardown scripts here.
	},

	'空白': function() {
		assert_normalizeWhiteSpaces('foobar (foobar)', 'foobar   (foobar)');
		assert_normalizeWhiteSpaces('foobar (foobar)', '   foobar (foobar)');
		assert_normalizeWhiteSpaces('foobar (foobar)', 'foobar (foobar)   ');
		assert_normalizeWhiteSpaces('foobar (foobar)', 'foobar	(foobar)');
		assert_normalizeWhiteSpaces('foobar (foobar)', '		foobar (foobar)');
		assert_normalizeWhiteSpaces('foobar (foobar)', 'foobar (foobar)	');
	},

	'改行': function() {
		assert_normalizeWhiteSpaces('foo bar', 'foo\nbar');
		assert_normalizeWhiteSpaces('foo bar', 'foo\rbar');
		assert_normalizeWhiteSpaces('foo bar', 'foo\n\rbar');
		assert_normalizeWhiteSpaces('foo bar', 'foo\r\nbar');
		assert_normalizeWhiteSpaces('foo bar', '\n\n\nfoo bar');
		assert_normalizeWhiteSpaces('foo bar', 'foo bar\n\n\n');
	}
};


var encodeTest = new TestCase('encode');

encodeTest.tests = {
	setUp : function() {
	  // put setup scripts here.
	},

	tearDown : function() {
	  // put teardown scripts here.
	},

	'エンコード': function() {
		var orig = encoded_addresses.map(function(aAddress) {
				return aAddress.fixed;
			});
		var result = encoded_addresses.map(function(aAddress) {
				return aAddress.encoded;
			});
		assert.equals(result.join(', '), RFC2822AddressesParser.encode(orig.join(', '), 'UTF-8'));
	}
};


function removeAddressPart(aInput)
{
	return aInput.replace(/\s*<[^>]+>$/, '');
}

function assert_decode(aExpected, aTest)
{
	assert.equals(removeAddressPart(aExpected), RFC2822AddressesParser.decode(removeAddressPart(aTest)));
}

var decodeTest = new TestCase('decode');

decodeTest.tests = {
	setUp : function() {
	  // put setup scripts here.
	},

	tearDown : function() {
	  // put teardown scripts here.
	},

	'デコード': function() {
		assert_decode(encoded_multibytes.fixed,
			encoded_multibytes.encoded);
		assert_decode(encoded_quoted_split.fixed,
			encoded_quoted_split.encoded);
		assert_decode(encoded_quoted_printable.fixed,
			encoded_quoted_printable.encoded);
		assert_decode(encoded_quoted_printable_whitespace.fixed,
			encoded_quoted_printable_whitespace.encoded);
	}
};


var splitAndDecodeRawAddressesTest = new TestCase('splitAndDecodeRawAddresses');

splitAndDecodeRawAddressesTest.tests = {
	setUp : function() {
	  // put setup scripts here.
	},

	tearDown : function() {
	  // put teardown scripts here.
	},

	'デコードと分割': function() {
		var result = RFC2822AddressesParser.splitAndDecodeRawAddresses(encoded_addresses.join(', '));
		assert.equals(
			encoded_addresses.map(function(aAddress) {
				return aAddress.decoded;
			}).join(', '),
			result.map(function(aResult) {
				return aResult.value;
			}).join(', ')
		);
	}
};

function assert_wrapAddress(aTest)
{
	assert.equals(aTest.wrapped, RFC2822AddressesParser.wrapAddress(aTest.decoded));
}

var wrapAddressTest = new TestCase('wrapAddress');

wrapAddressTest.tests = {
	setUp : function() {
	  // put setup scripts here.
	},

	tearDown : function() {
	  // put teardown scripts here.
	},

	'エンコードなし：名前無し': function() {
		assert_wrapAddress(addresses.simple);
	},

	'エンコードなし：名前付き': function() {
		assert_wrapAddress(named_plain);
		assert_wrapAddress(named_quoted);
		assert_wrapAddress(named_quoted_comma);
	},

	'エンコードあり：名前付き': function() {
		assert_wrapAddress(encoded_plain);
		assert_wrapAddress(encoded_split);
		assert_wrapAddress(encoded_broken_paren);
		assert_wrapAddress(encoded_broken_paren_split);
		assert_wrapAddress(encoded_multibytes);
		assert_wrapAddress(encoded_multibytes_split);
		assert_wrapAddress(encoded_multibytes_split_joined);
		assert_wrapAddress(encoded_address_fully_quoted);
		assert_wrapAddress(encoded_address_part_quoted);
		assert_wrapAddress(encoded_invalid_paren);
		assert_wrapAddress(encoded_quoted_split);
		assert_wrapAddress(encoded_ascii);
		assert_wrapAddress(encoded_quoted_printable);
		assert_wrapAddress(encoded_quoted_printable_whitespace);
	}
};


var parseAddressesTest = new TestCase('parseAddresses');

parseAddressesTest.tests = {
	setUp : function() {
	  // put setup scripts here.
	},

	tearDown : function() {
	  // put teardown scripts here.
	},

	'エンコードなし：名前無し': function() {
		var result = RFC2822AddressesParser.parseAddresses(addresses.simple);
		assert.equals(1, result.addresses.length);
		assert.equals(addresses.simple, result.addresses[0]);
		assert.equals('', result.charset);

		var result = RFC2822AddressesParser.parseAddresses([
				simple,
				simple,
				simple
			].join(', '));
		assert.equals(simple, result.addresses[0]);
		assert.equals(simple, result.addresses[1]);
		assert.equals(simple, result.addresses[2]);
		assert.equals('', result.charset);
	},

	'エンコードなし：名前付き': function() {
		var result = RFC2822AddressesParser.parseAddresses(named_addresses.join(', '));
		var i = 0;
		named_addresses_tests.forEach(function(aTest) {
			assert.equals(getGlobal()[aTest], result.addresses[i++], aTest+' fails.');
		});
		assert.equals('', result.charset);
	},

	'エンコードあり：名前付き': function() {
		var result = RFC2822AddressesParser.parseAddresses(encoded_addresses.join(', '));
		var i = 0;
		encoded_addresses_tests.forEach(function(aTest) {
			assert.equals(getGlobal()[aTest].fixed, result.addresses[i++], aTest+' fails.');
		});
		assert.equals(encoded_addresses[encoded_addresses.length-1].encoding, result.charset);
	}
};

