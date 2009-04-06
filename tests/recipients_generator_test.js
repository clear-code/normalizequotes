// 文字列等に非ASCII文字を使う場合は、ファイルのエンコーディングを
// UTF-8にしてください。

utils.include(baseURL+'loader.inc');
utils.include(baseURL+'addresses.inc');

var removeDuplicateAddressesTest = new TestCase('removeDuplicateAddresses');

removeDuplicateAddressesTest.tests = {
	setUp : function() {
	  // put setup scripts here.
	},

	tearDown : function() {
	  // put teardown scripts here.
	},

	'同じアドレスがたくさんある場合': function() {
		var orig = [
				'address+1@example.com',
				'address+1@example.com',
				'address+1@example.com',
				'address+1@example.com',
				'address+1@example.com',
				'address+1@example.com',
				'address+1@example.com',
				'address+5@example.com'
			];
		var remove = [
				orig[0]
			];
		var result = [
				orig[7]
			];

		assert.equals(result.join(', '), ComposerRecipientsListGenerator.removeDuplicateAddresses(orig.join(', '), remove.join(', ')));
	},

	'シンプル': function() {
		var orig = [
				'address+1@example.com',
				'address+2@example.com',
				'address+3@example.com',
				'address+4@example.com',
				'address+5@example.com'
			];
		var remove = [
				orig[0],
				orig[2]
			];
		var result = [
				orig[1],
				orig[3],
				orig[4]
			];

		assert.equals(result.join(', '), ComposerRecipientsListGenerator.removeDuplicateAddresses(orig.join(', '), remove.join(', ')));
	},

	'エンコードされたアドレス': function() {
		var orig = [
				encoded_plain.fixed,
				encoded_split.fixed,
				encoded_broken_paren.fixed,
				encoded_broken_paren_split.fixed,
				encoded_multibytes.fixed,
				encoded_quoted_split.fixed,
				encoded_ascii.fixed
			].join(', ');
		var remove = [
				encoded_plain.fixed,
				encoded_broken_paren.fixed
			].join(', ');
		var result = [
				encoded_split.fixed,
				encoded_broken_paren_split.fixed,
				encoded_multibytes.fixed,
				encoded_quoted_split.fixed,
				encoded_ascii.fixed
			];

		assert.equals(result.join(', '), ComposerRecipientsListGenerator.removeDuplicateAddresses(orig, remove));
	}
};


var generateForReplyTest = new TestCase('generateForReply');

generateForReplyTest.tests = {
	setUp : function() {
	  // put setup scripts here.
	},

	tearDown : function() {
	  // put teardown scripts here.
	},

	'差出人への返信': function() {
		var info = ComposerRecipientsListGenerator.generateForReply(
				Components.interfaces.nsIMsgCompType.ReplyToSender,
				encoded_plain.fixed,
				[
					encoded_plain.fixed,
					encoded_split.fixed,
					encoded_broken_paren.fixed,
					encoded_broken_paren_split.fixed
				].join(', '),
				[
					encoded_multibytes.fixed,
					encoded_multibytes_split.fixed,
					encoded_multibytes_split_joined.fixed
				].join(', '),
				[
					encoded_address_fully_quoted.fixed,
					encoded_address_part_quoted.fixed,
					encoded_invalid_paren.fixed,
					encoded_quoted_split.fixed,
					encoded_ascii.fixed
				].join(', ')
			);

		assert.isTrue(info);

		assert.equals(
			[
				encoded_split.fixed,
				encoded_broken_paren.fixed,
				encoded_broken_paren_split.fixed
			].join(', '),
			info.recipients
		);

		assert.equals('', info.cc);
	},

	'全員への返信': function() {
		var info = ComposerRecipientsListGenerator.generateForReply(
				Components.interfaces.nsIMsgCompType.ReplyAll,
				encoded_plain.fixed,
				[
					encoded_plain.fixed,
					encoded_split.fixed,
					encoded_broken_paren.fixed,
					encoded_broken_paren_split.fixed
				].join(', '),
				[
					encoded_broken_paren.fixed,
					encoded_broken_paren_split.fixed,
					encoded_multibytes.fixed,
					encoded_multibytes_split.fixed,
					encoded_multibytes_split_joined.fixed
				].join(', '),
				[
					encoded_broken_paren.fixed,
					encoded_broken_paren_split.fixed,
					encoded_multibytes.fixed,
					encoded_multibytes_split.fixed,
					encoded_multibytes_split_joined.fixed,
					encoded_address_fully_quoted.fixed,
					encoded_address_part_quoted.fixed,
					encoded_invalid_paren.fixed,
					encoded_quoted_split.fixed,
					encoded_ascii.fixed
				].join(', ')
			);

		assert.isTrue(info);

		assert.equals(
			[
				encoded_split.fixed,
				encoded_broken_paren.fixed,
				encoded_broken_paren_split.fixed,
				encoded_multibytes.fixed,
				encoded_multibytes_split.fixed,
				encoded_multibytes_split_joined.fixed
			].join(', '),
			info.recipients
		);

		assert.equals(
			[
				encoded_multibytes.fixed,
				encoded_multibytes_split.fixed,
				encoded_multibytes_split_joined.fixed,
				encoded_broken_paren.fixed,
				encoded_broken_paren_split.fixed,
				encoded_address_fully_quoted.fixed,
				encoded_address_part_quoted.fixed,
				encoded_invalid_paren.fixed,
				encoded_quoted_split.fixed,
				encoded_ascii.fixed
			].join(', '),
			info.cc
		);
	}
};
