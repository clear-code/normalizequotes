// 文字列等に非ASCII文字を使う場合は、ファイルのエンコーディングを
// UTF-8にしてください。

var mailFile = utils.getFileFromURLSpec(baseURL+'mail.eml');
var mailFileWithAttachments = utils.getFileFromURLSpec(baseURL+'attached.eml');

var messageWindow;
var messageWindowOption = {
		type      : null,
		uri       : 'chrome://messenger/content/messageWindow.xul',
		name      : '_blank',
		flags     : 'all,chrome,dialog=no,status,toolbar',
		arguments : [
			utils.getURLFromFilePath(mailFile.path),
			null,
			null
		]
	};
messageWindowOption.arguments[0].spec += '?type=application/x-message-display';

var messageWindowOptionWithAttachments = {
		type      : null,
		uri       : 'chrome://messenger/content/messageWindow.xul',
		name      : '_blank',
		flags     : 'all,chrome,dialog=no,status,toolbar',
		arguments : [
			utils.getURLFromFilePath(mailFileWithAttachments.path),
			null,
			null
		]
	};
messageWindowOptionWithAttachments.arguments[0].spec += '?type=application/x-message-display';


function getComposeWindows() {
	return utils.getChromeWindows({ type : 'msgcompose' });
}


var emlFileFunctionalTest = new TestCase('emlファイルの機能テスト', {runStrategy: 'async'});

emlFileFunctionalTest.tests = {
	setUp : function() {
		getComposeWindows().forEach(function(aWindow) {
			aWindow.close();
		});
		yield utils.setUpTestWindow(null, messageWindowOption);
		yield 2000;
		messageWindow = utils.getTestWindow(messageWindowOption);
	},

	tearDown : function() {
		getComposeWindows().forEach(function(aWindow) {
			aWindow.close();
		});
		utils.tearDownTestWindow(messageWindowOption);
	},

	'ヘッダの表示の修復': function() {
		var header;

		header = messageWindow.document.getElementById('expandedfromBox');
		assert.equals(3, header.mAddresses.length);

		header = messageWindow.document.getElementById('expandedtoBox');
		assert.equals(5, header.mAddresses.length);

		header = messageWindow.document.getElementById('expandedccBox');
		assert.equals(5, header.mAddresses.length);
	},

	'差出人へ返信': function() {
		messageWindow.MsgReplySender();
		yield (function() {
				return getComposeWindows().length > 0
			});

		yield 2000;
		var composer = getComposeWindows()[0];
		var box = composer.document.getElementById('addressingWidget');
		var items = Array.prototype.slice.apply(box.getElementsByTagName('listitem')).filter(function (aItem) {
				return aItem.lastChild.hasChildNodes();
			});

		assert.equals(3, items.length);
		assert.equals('addr_to', items[0].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+1@example.com>', items[0].lastChild.lastChild.value);
		assert.equals('addr_to', items[1].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+2@example.com>', items[1].lastChild.lastChild.value);
		assert.equals('addr_to', items[2].firstChild.lastChild.value);
		assert.equals('SHIMODA Hiroshi (foobar) <address+3@example.com>', items[2].lastChild.lastChild.value);
	},

	'全員へ返信': function() {
		messageWindow.MsgReplyToAllMessage();
		yield (function() {
				return getComposeWindows().length > 0
			});

		yield 2000;
		var composer = getComposeWindows()[0];
		var box = composer.document.getElementById('addressingWidget');
		var items = Array.prototype.slice.apply(box.getElementsByTagName('listitem')).filter(function (aItem) {
				return aItem.lastChild.hasChildNodes();
			});

		assert.equals(13, items.length);
		assert.equals('addr_to', items[0].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+1@example.com>', items[0].lastChild.lastChild.value);
		assert.equals('addr_to', items[1].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+2@example.com>', items[1].lastChild.lastChild.value);
		assert.equals('addr_to', items[2].firstChild.lastChild.value);
		assert.equals('SHIMODA Hiroshi (foobar) <address+3@example.com>', items[2].lastChild.lastChild.value);
		assert.equals('addr_to', items[3].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+4@example.com>', items[3].lastChild.lastChild.value);
		assert.equals('addr_to', items[4].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+5@example.com>', items[4].lastChild.lastChild.value);
		assert.equals('addr_to', items[5].firstChild.lastChild.value);
		assert.equals('SHIMODA Hiroshi (foobar) <address+6@example.com>', items[5].lastChild.lastChild.value);
		assert.equals('addr_to', items[6].firstChild.lastChild.value);
		assert.equals('SHIMODA Hiroshi (foobar) <address+7@example.com>', items[6].lastChild.lastChild.value);
		assert.equals('addr_to', items[7].firstChild.lastChild.value);
		assert.equals('下田 洋志 <address+8@example.com>', items[7].lastChild.lastChild.value);
		assert.equals('addr_cc', items[8].firstChild.lastChild.value);
		assert.equals('下田 洋志 <address+9@example.com>', items[8].lastChild.lastChild.value);
		assert.equals('addr_cc', items[9].firstChild.lastChild.value);
		assert.equals('addr_cc', items[10].firstChild.lastChild.value);
		assert.equals('addr_cc', items[11].firstChild.lastChild.value);
		assert.equals('addr_cc', items[12].firstChild.lastChild.value);
	}
};


var emlFileWithAttachmentsFunctionalTest = new TestCase('添付ファイルとしてメッセージを含むemlファイルの機能テスト', {runStrategy: 'async'});

emlFileWithAttachmentsFunctionalTest.tests = {
	setUp : function() {
		getComposeWindows().forEach(function(aWindow) {
			aWindow.close();
		});
		yield utils.setUpTestWindow(null, messageWindowOptionWithAttachments);
		yield 2000;
		messageWindow = utils.getTestWindow(messageWindowOptionWithAttachments);
	},

	tearDown : function() {
		getComposeWindows().forEach(function(aWindow) {
			aWindow.close();
		});
		utils.tearDownTestWindow(messageWindowOptionWithAttachments);
	},

	'ヘッダの表示の修復': function() {
		var header;

		header = messageWindow.document.getElementById('expandedfromBox');
		assert.equals(3, header.mAddresses.length);

		header = messageWindow.document.getElementById('expandedtoBox');
		assert.equals(5, header.mAddresses.length);

		header = messageWindow.document.getElementById('expandedccBox');
		assert.equals(5, header.mAddresses.length);
	},

	'差出人へ返信': function() {
		messageWindow.MsgReplySender();
		yield (function() {
				return getComposeWindows().length > 0
			});

		yield 2000;
		var composer = getComposeWindows()[0];
		var box = composer.document.getElementById('addressingWidget');
		var items = Array.prototype.slice.apply(box.getElementsByTagName('listitem')).filter(function (aItem) {
				return aItem.lastChild.hasChildNodes();
			});

		assert.equals(3, items.length);
		assert.equals('addr_to', items[0].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+1@example.com>', items[0].lastChild.lastChild.value);
		assert.equals('addr_to', items[1].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+2@example.com>', items[1].lastChild.lastChild.value);
		assert.equals('addr_to', items[2].firstChild.lastChild.value);
		assert.equals('SHIMODA Hiroshi (foobar) <address+3@example.com>', items[2].lastChild.lastChild.value);
	},

	'全員へ返信': function() {
		messageWindow.MsgReplyToAllMessage();
		yield (function() {
				return getComposeWindows().length > 0
			});

		yield 2000;
		var composer = getComposeWindows()[0];
		var box = composer.document.getElementById('addressingWidget');
		var items = Array.prototype.slice.apply(box.getElementsByTagName('listitem')).filter(function (aItem) {
				return aItem.lastChild.hasChildNodes();
			});

		assert.equals(13, items.length);
		assert.equals('addr_to', items[0].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+1@example.com>', items[0].lastChild.lastChild.value);
		assert.equals('addr_to', items[1].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+2@example.com>', items[1].lastChild.lastChild.value);
		assert.equals('addr_to', items[2].firstChild.lastChild.value);
		assert.equals('SHIMODA Hiroshi (foobar) <address+3@example.com>', items[2].lastChild.lastChild.value);
		assert.equals('addr_to', items[3].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+4@example.com>', items[3].lastChild.lastChild.value);
		assert.equals('addr_to', items[4].firstChild.lastChild.value);
		assert.equals('"SHIMODA, Hiroshi" <address+5@example.com>', items[4].lastChild.lastChild.value);
		assert.equals('addr_to', items[5].firstChild.lastChild.value);
		assert.equals('SHIMODA Hiroshi (foobar) <address+6@example.com>', items[5].lastChild.lastChild.value);
		assert.equals('addr_to', items[6].firstChild.lastChild.value);
		assert.equals('SHIMODA Hiroshi (foobar) <address+7@example.com>', items[6].lastChild.lastChild.value);
		assert.equals('addr_to', items[7].firstChild.lastChild.value);
		assert.equals('下田 洋志 <address+8@example.com>', items[7].lastChild.lastChild.value);
		assert.equals('addr_cc', items[8].firstChild.lastChild.value);
		assert.equals('下田 洋志 <address+9@example.com>', items[8].lastChild.lastChild.value);
		assert.equals('addr_cc', items[9].firstChild.lastChild.value);
		assert.equals('addr_cc', items[10].firstChild.lastChild.value);
		assert.equals('addr_cc', items[11].firstChild.lastChild.value);
		assert.equals('addr_cc', items[12].firstChild.lastChild.value);
	}
};
