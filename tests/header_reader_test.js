// 文字列等に非ASCII文字を使う場合は、ファイルのエンコーディングを
// UTF-8にしてください。

utils.include(baseURL+'loader.inc');



var mailFile = utils.getFileFromURLSpec(baseURL+'mail.eml');
var mailContents = utils.readFrom(mailFile);

var mailFileWithAttachments = utils.getFileFromURLSpec(baseURL+'attached.eml');
var mailContentsWithAttachments = utils.readFrom(mailFileWithAttachments);


var from = <><![CDATA[
	=?UTF-8?B?U0hJTU9EQSwgSGlyb3NoaQ==?= <address+1@example.com>,
	=?UTF-8?B?U0hJTU9EQSw=?= =?UTF-8?B?SGlyb3NoaQ==?= <address+2@example.com>,
	=?UTF-8?B?U0hJTU9EQSBIaXJvc2hpIChmb29iYXLvvIk=?= <address+3@example.com>
]]></>.toString();

var recipients = <><![CDATA[
	=?UTF-8?B?U0hJTU9EQSwgSGlyb3NoaQ==?= <address+4@example.com>,
	=?UTF-8?B?U0hJTU9EQSw=?= =?UTF-8?B?SGlyb3NoaQ==?= <address+5@example.com>,
	=?UTF-8?B?U0hJTU9EQSBIaXJvc2hpIChmb29iYXLvvIk=?= <address+6@example.com>,
	=?UTF-8?B?U0hJTU9EQQ==?= =?UTF-8?B?SGlyb3NoaSAoZm9vYmFy77yJ?= <address+7@example.com>,
	=?UTF-8?B?5LiL55SwIOa0i+W/lw==?= <address+8@example.com>
]]></>.toString();

var ccList = <><![CDATA[
	=?UTF-8?B?5LiL55Sw?= =?UTF-8?B?5rSL5b+X?= <address+9@example.com>,
	=?UTF-8?B?6Laz5rC4IOaLk+mDjg==?= <"address+10@example.com">,
	=?UTF-8?B?5rGg5re7IOa1qeS5iw==?= <"address+11"@example.com>,
	=?UTF-8?B?6aCI6JekIOWKnw==?==?UTF-8?B?5bmz?= <address+12@example.com>,
	=?UTF-8?B?PE1pbmFtaSBTaGluLWljaGlybz4=?= <address+13@example.com>
]]></>.toString();



var getHeaderValueFromCacheTest = new TestCase('getHeaderValueFromCache');

getHeaderValueFromCacheTest.tests = {
	setUp : function() {
	  MessagesHeaderReader.cachedContents = mailContents;
	  MessagesHeaderReader.cachedHeader = {};
	},

	tearDown : function() {
	  MessagesHeaderReader.cachedContents = '';
	  MessagesHeaderReader.cachedHeader = {};
	},

	'ヘッダの値の取得': function() {
		assert.equals(RFC2822AddressesParser.normalizeWhiteSpaces(from),
			RFC2822AddressesParser.normalizeWhiteSpaces(MessagesHeaderReader.getHeaderValueFromCache('from')));
		assert.equals(RFC2822AddressesParser.normalizeWhiteSpaces(recipients),
			RFC2822AddressesParser.normalizeWhiteSpaces(MessagesHeaderReader.getHeaderValueFromCache('to')));
		assert.equals(RFC2822AddressesParser.normalizeWhiteSpaces(ccList),
			RFC2822AddressesParser.normalizeWhiteSpaces(MessagesHeaderReader.getHeaderValueFromCache('cc')));
	}
};


var getHeaderValueFromFileTest = new TestCase('getHeaderValueFromFile');

getHeaderValueFromFileTest.tests = {
	setUp : function() {
		MessagesHeaderReader.cachedContents = '';
		MessagesHeaderReader.cachedHeader = {};

		MessagesHeaderReader.__defineGetter__('messageFile', function() {
			return mailFile;
		});
	},

	tearDown : function() {
		MessagesHeaderReader.cachedContents = '';
		MessagesHeaderReader.cachedHeader = {};
	},

	'ヘッダの値の取得': function() {
		assert.equals(RFC2822AddressesParser.normalizeWhiteSpaces(from),
			RFC2822AddressesParser.normalizeWhiteSpaces(MessagesHeaderReader.getHeaderValueFromFile('from')));
		assert.equals(RFC2822AddressesParser.normalizeWhiteSpaces(recipients),
			RFC2822AddressesParser.normalizeWhiteSpaces(MessagesHeaderReader.getHeaderValueFromFile('to')));
		assert.equals(RFC2822AddressesParser.normalizeWhiteSpaces(ccList),
			RFC2822AddressesParser.normalizeWhiteSpaces(MessagesHeaderReader.getHeaderValueFromFile('cc')));
	}
};


var getHeaderValueFromFileWithAttachmentsTest = new TestCase('getHeaderValueFromFile (with attachments)');

getHeaderValueFromFileWithAttachmentsTest.tests = {
	setUp : function() {
		MessagesHeaderReader.cachedContents = '';
		MessagesHeaderReader.cachedHeader = {};

		MessagesHeaderReader.__defineGetter__('messageFile', function() {
			return mailFileWithAttachments;
		});
	},

	tearDown : function() {
		MessagesHeaderReader.cachedContents = '';
		MessagesHeaderReader.cachedHeader = {};
	},

	'ヘッダの値の取得': function() {
		assert.equals(RFC2822AddressesParser.normalizeWhiteSpaces(from),
			RFC2822AddressesParser.normalizeWhiteSpaces(MessagesHeaderReader.getHeaderValueFromFile('from')));
		assert.equals(RFC2822AddressesParser.normalizeWhiteSpaces(recipients),
			RFC2822AddressesParser.normalizeWhiteSpaces(MessagesHeaderReader.getHeaderValueFromFile('to')));
		assert.equals(RFC2822AddressesParser.normalizeWhiteSpaces(ccList),
			RFC2822AddressesParser.normalizeWhiteSpaces(MessagesHeaderReader.getHeaderValueFromFile('cc')));
	}
};
