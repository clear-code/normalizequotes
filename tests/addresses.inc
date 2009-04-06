function Address(aRaw, aDecoded, aWrapped, aFixed, aEncoded)
{
	this.raw      = aRaw || '';
	this.decoded  = aDecoded || this.raw;
	this.wrapped  = aWrapped || this.raw;
	this.fixed    = aFixed || this.raw;
	this.encoded  = aEncoded || this.raw;
	this.encoding = 'UTF-8';
}
Address.prototype.toString = function()
{
	return this.raw;
}

var addresses = {

	simple :
		new Address('address+0@example.com'),

	named_plain :
		new Address('SHIMODA Hiroshi <address+1@example.com>'),
	named_quoted :
		new Address('"SHIMODA Hiroshi" <address+2@example.com>'),
	named_quoted_comma :
		new Address('"SHIMODA, Hiroshi" <address+3@example.com>'),

	// 参考： http://0xcc.net/jsescape/

	encoded_plain :
		new Address(
			'=?UTF-8?B?U0hJTU9EQSwgSGlyb3NoaQ==?= <address+4@example.com>',
			'SHIMODA, Hiroshi <address+4@example.com>',
			'"SHIMODA, Hiroshi" <address+4@example.com>',
			'"SHIMODA, Hiroshi" <address+4@example.com>',
			'"SHIMODA, Hiroshi" <address+4@example.com>'
		),
	encoded_split :
		new Address(
			'=?UTF-8?B?U0hJTU9EQSw=?= =?UTF-8?B?SGlyb3NoaQ==?= <address+5@example.com>',
			'SHIMODA, Hiroshi <address+5@example.com>',
			'"SHIMODA, Hiroshi" <address+5@example.com>',
			'"SHIMODA, Hiroshi" <address+5@example.com>',
			'"SHIMODA, Hiroshi" <address+5@example.com>'
		),
	encoded_broken_paren :
		new Address(
			'=?UTF-8?B?U0hJTU9EQSBIaXJvc2hpIChmb29iYXLvvIk=?= <address+6@example.com>',
			'SHIMODA Hiroshi (foobar） <address+6@example.com>',
			'"SHIMODA Hiroshi (foobar）" <address+6@example.com>',
			'"SHIMODA Hiroshi (foobar)" <address+6@example.com>',
			'"SHIMODA Hiroshi (foobar)" <address+6@example.com>'
		),
	encoded_broken_paren_split :
		new Address(
			'=?UTF-8?B?U0hJTU9EQQ==?= =?UTF-8?B?SGlyb3NoaSAoZm9vYmFy77yJ?= <address+7@example.com>',
			'SHIMODA Hiroshi (foobar） <address+7@example.com>',
			'"SHIMODA Hiroshi (foobar）" <address+7@example.com>',
			'"SHIMODA Hiroshi (foobar)" <address+7@example.com>',
			'"SHIMODA Hiroshi (foobar)" <address+7@example.com>'
		),
	encoded_multibytes :
		new Address(
			'=?UTF-8?B?5LiL55SwIOa0i+W/lw==?= <address+8@example.com>',
			'下田 洋志 <address+8@example.com>',
			'下田 洋志 <address+8@example.com>',
			'下田 洋志 <address+8@example.com>',
			'=?UTF-8?B?5LiL55SwIOa0i+W/lw==?= <address+8@example.com>'
		),
	encoded_multibytes_split :
		new Address(
			'=?UTF-8?B?5LiL55Sw?= =?UTF-8?B?5rSL5b+X?= <address+9@example.com>',
			'下田 洋志 <address+9@example.com>',
			'下田 洋志 <address+9@example.com>',
			'下田 洋志 <address+9@example.com>',
			'=?UTF-8?B?5LiL55SwIOa0i+W/lw==?= <address+9@example.com>'
		),
	encoded_multibytes_split_joined :
		new Address(
			'=?UTF-8?B?6aCI6JekIOWKnw==?==?UTF-8?B?5bmz?= <address+12@example.com>',
			'須藤 功平 <address+12@example.com>',
			'須藤 功平 <address+12@example.com>',
			'須藤 功平 <address+12@example.com>',
			'=?UTF-8?B?6aCI6JekIOWKn+W5sw==?= <address+12@example.com>'
		),
	encoded_address_fully_quoted :
		new Address(
			'=?UTF-8?B?6Laz5rC4IOaLk+mDjg==?= <"address+10@example.com">',
			'足永 拓郎 <"address+10@example.com">',
			'足永 拓郎 <"address+10@example.com">',
			'足永 拓郎 <"address+10@example.com">',
			'=?UTF-8?B?6Laz5rC4IOaLk+mDjg==?= <"address+10@example.com">'
		),
	encoded_address_part_quoted :
		new Address(
			'=?UTF-8?B?5rGg5re7IOa1qeS5iw==?= <"address+11"@example.com>',
			'池添 浩之 <"address+11"@example.com>',
			'池添 浩之 <"address+11"@example.com>',
			'池添 浩之 <"address+11"@example.com>',
			'=?UTF-8?B?5rGg5re7IOa1qeS5iw==?= <"address+11"@example.com>'
		),
	encoded_invalid_paren :
		new Address(
			'=?UTF-8?B?PE1pbmFtaSBTaGluLWljaGlybz4=?= <address+13@example.com>',
			'<Minami Shin-ichiro> <address+13@example.com>',
			'"<Minami Shin-ichiro>" <address+13@example.com>',
			'"<Minami Shin-ichiro>" <address+13@example.com>',
			'"<Minami Shin-ichiro>" <address+13@example.com>'
		),
	encoded_quoted_split :
		new Address(
			'=?UTF-8?B?IuS4i+eUsCw=?= =?UTF-8?B?5rSL5b+XIg==?= <address+14@example.com>',
			'"下田, 洋志" <address+14@example.com>',
			'"下田, 洋志" <address+14@example.com>',
			'"下田, 洋志" <address+14@example.com>',
			'=?UTF-8?B?IuS4i+eUsCwg5rSL5b+XIg==?= <address+14@example.com>'
		),
	encoded_ascii :
		new Address(
			'=?US-ASCII?B?U0hJTU9EQSwgSGlyb3NoaQ==?= <address+15@example.com>',
			'SHIMODA, Hiroshi <address+15@example.com>',
			'"SHIMODA, Hiroshi" <address+15@example.com>',
			'"SHIMODA, Hiroshi" <address+15@example.com>',
			'"SHIMODA, Hiroshi" <address+15@example.com>'
		),
	encoded_quoted_printable :
		new Address(
			'=?UTF-8?Q?=E4=B8=8B=E7=94=B0=E6=B4=8B=E5=BF=97?= <address+16@example.com>',
			'下田洋志 <address+16@example.com>',
			'下田洋志 <address+16@example.com>',
			'下田洋志 <address+16@example.com>',
			'=?UTF-8?B?5LiL55Sw5rSL5b+X?= <address+16@example.com>'
		),
	encoded_quoted_printable_whitespace :
		new Address(
			'=?UTF-8?Q?=E4=B8=8B=E7=94=B0 =E6=B4=8B=E5=BF=97?= <address+17@example.com>',
			'下田 洋志 <address+17@example.com>',
			'下田 洋志 <address+17@example.com>',
			'下田 洋志 <address+17@example.com>',
			'=?UTF-8?B?5LiL55SwIOa0i+W/lw==?= <address+17@example.com>'
		)
};


function getGlobal() {
	return (function() { return this; })();
}

var named_addresses = [];
var named_addresses_tests = [];
var encoded_addresses = [];
var encoded_addresses_tests = [];
for (var i in addresses)
{
	getGlobal()[i] = addresses[i];
	if (i.indexOf('named') == 0) {
		named_addresses.push(addresses[i]);
		named_addresses_tests.push(i);
	}
	else if (i.indexOf('encoded') == 0) {
		encoded_addresses.push(addresses[i]);
		encoded_addresses_tests.push(i);
	}
}
