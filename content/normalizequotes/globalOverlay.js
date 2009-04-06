/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is "Patch to Fix Problems on Splitting E-mail Addresses".
 *
 * The Initial Developer of the Original Code is ClearCode Inc.
 * Portions created by the Initial Developer are Copyright (C) 2008
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): ClearCode Inc. <info@clear-code.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

window.addEventListener('DOMContentLoaded', function() { 
	window.removeEventListener('DOMContentLoaded', arguments.callee, false);

	if ('MessagesHeaderFixer' in window) return;
	 
	/* for display */ 
	
	// ヘッダ表示領域に表示されるE-mailアドレスのリストを修復する 
	if ('OutputEmailAddresses' in window) {
		eval('window.OutputEmailAddresses = '+
			window.OutputEmailAddresses.toSource().replace(
				'if (msgHeaderParser) {',
				<><![CDATA[$&
					emailAddresses = MessagesHeaderFixer.fixUpAddresses(emailAddresses, headerEntry)
				]]></>
			)
		);

		[
			gCollapsedHeaderList,
			gExpandedHeaderList,
			gCollapsedHeaderView,
			gExpandedHeaderView
		].forEach(function(aList) {
			var item;
			for (var i in aList)
			{
				item = aList[i];
		if (!item) continue;
				if ('outputFunction' in item &&
					/\(?function OutputEmailAddresses\(/.test(item.outputFunction.toSource()))
					item.outputFunction = OutputEmailAddresses;
			}
		});
	}

	if ('addRecipientsToIgnoreList' in window) {
		eval('window.addRecipientsToIgnoreList = '+
			window.addRecipientsToIgnoreList.toSource().replace(
				'{',
				<><![CDATA[$&
					aAddressesToAdd = RFC2822AddressesParser.normalize(aAddressesToAdd);
				]]></>
			)
		);
	}
 
	window.MessagesHeaderFixer = { 
	
		fixUpAddresses : function(aAddresses, aHeaderEntry) 
		{
			if (/^"[^"]+"$/.test(aAddresses)) { // IMAP
				return aAddresses;
			}
			var source = aHeaderEntry.enclosingBox.id.replace(/^(collapsed|expanded)|Box$/g, '');
			if (source != 'from' && source != 'to' && source != 'cc')
				return aAddresses;


			if (MessagesHeaderReader.isAttachment || MessagesHeaderReader.isLocalFile) {
				var value = MessagesHeaderReader.isAttachment ?
						MessagesHeaderReader.getHeaderValueFromAttachment(source) :
						MessagesHeaderReader.getHeaderValueFromFile(source) ;
				if (value) {
					var result = RFC2822AddressesParser.parseAddresses(value);
					var normalizedAddresses = result.addresses.join(', ');
					if (normalizedAddresses &&
						normalizedAddresses != aAddresses)
						aAddresses = normalizedAddresses;
				}
				return aAddresses;
			}

			// 通常のメッセージ
			var result = RFC2822AddressesParser.parseAddresses(
					MessagesHeaderReader.getHeaderValueFrom(source)
				);
			var normalizedAddresses = result.addresses.join(', ');
			var charset = result.charset;
			// 修復結果をDBHdrに書き戻しておく
			if (normalizedAddresses &&
				normalizedAddresses != aAddresses) {
				aAddresses = normalizedAddresses;
				var hdr = MessagesHeaderReader.getMsgDBHdrForMessage();
				switch (source)
				{
					case 'from':
						hdr.author = RFC2822AddressesParser.encode(aAddresses, charset);
						break;
					case 'to':
						hdr.recipients = RFC2822AddressesParser.encode(aAddresses, charset);
						break;
					case 'cc':
						hdr.ccList = RFC2822AddressesParser.encode(aAddresses, charset);
						break;
				}
			}
			return aAddresses;
		}
 
	}; 

  
	window.RFC2822AddressesParser = { 
	
		parseAddresses : function(aAddresses) 
		{
			var addresses = this.splitAndDecodeRawAddresses(aAddresses);
			var self = this;
			var charset = '';
			addresses = addresses.map(function(aAddress) {
				if (aAddress.charset && aAddress.charset.toLowerCase() != 'us-ascii' &&
					aAddress.charset != charset)
					charset = aAddress.charset;
				aAddress.value = self.normalize(aAddress.value);
				aAddress.value = self.wrapAddress(aAddress.value);
				return aAddress.value;
			});
			return {
				addresses : addresses,
				charset   : charset
			};
		},
	
		splitAndDecodeRawAddresses : function(aAddresses) 
		{
			aAddresses = this.normalizeWhiteSpaces(aAddresses).split('');
			var addresses = [];
			var inQuotes = false;
			var inEncoded = false;
			var inCharset = false;
			var inQuotedPair = false;

			var encodedPart = '';
			var address = {
					value   : '',
					charset : ''
				};
			while (aAddresses.length)
			{
				char = aAddresses.shift();
				if (inQuotedPair) {
					inQuotedPair = false;
					address.value += char;
					continue;
				}
				switch (char)
				{
					case ',':
						if (!inQuotes && !inEncoded) {
							address.value = this.normalizeWhiteSpaces(address.value);
							addresses.push(address);
							address = { value : '', charset : '' };
							continue;
						}
						break;

					case '\\':
						inQuotedPair = true;
						break;

					case '"':
						inQuotes = !inQuotes;
						break;

					case '=':
						if (!inEncoded &&
							aAddresses.length &&
							aAddresses[0] == '?') {
							aAddresses.shift();
							encodedPart += '=?';
							inEncoded = true;
							inCharset = true;
							if (address.charset) address.charset = '';
							continue;
						}
						break;

					case '?':
						if (inEncoded) {
							if (inCharset) {
								inCharset = false;
								encodedPart += ('?' + aAddresses[0] + aAddresses[1]);
								aAddresses.shift();
								aAddresses.shift();
								continue;
							}
							else if (
								aAddresses.length &&
								aAddresses[0] == '='
								) {
								aAddresses.shift();
								encodedPart += '?=';
								address.value += this.decode(encodedPart);
								encodedPart = '';
								inEncoded = false;
								continue;
							}
						}
						break;
				}

				if (inCharset)
					address.charset += char;

				if (inEncoded)
					encodedPart += char;
				else
					address.value += char;
			}

			address.value = this.normalizeWhiteSpaces(address.value);
			addresses.push(address);

			return addresses;
		},
 
		wrapAddress : function(aAddress, aOnlyNamePart) 
		{
			aAddress = this.normalizeWhiteSpaces(aAddress).split('');
			var inQuotes = false;
			var inQuotedPair = false;
			var inComment = false;

			var buffer = '';
			var name = '';
			var address = '';
			while (aAddress.length)
			{
				char = aAddress.shift();
				if (inQuotes && inQuotedPair) {
					inQuotedPair = false;
					if (char == '"' || char == ' ' || char == '\\') {
						buffer += char;
						continue;
					}
				}
				switch (char)
				{
					// for [quoted-string]
					case '"':
						if (!inComment)
							inQuotes = !inQuotes;
						break;

					case '\\':
						if (inComment)
							inComment = false;
						if (inQuotes)
							inQuotedPair = true;
						break;

					// for [comment] in [CFWS]
					case '(':
						if (!inQuotes)
							inComment = true;
						else if (inComment)
							inComment = false;
						break;
					case ')':
						if (inComment)
							inComment = false;
						break;

					// for [angle-addr]
					case '<':
						if (!inQuotes && !inComment && !aOnlyNamePart) {
							name = buffer;
							buffer = '';
						}
						break;
					case '>':
						break;

//					case ' ':
//					case '.':
					case '@':
					case ',':
					case '[':
					case ']':
					case ':':
					case ';':
						break;

					default:
						if (!inQuotes && inComment &&
							(char.charCodeAt(0) < 0x33 || char.charCodeAt(0) > 0x126)) {
							inComment = false;
						}
				}
				buffer += char;
			}

			if (aOnlyNamePart) {
				name = buffer;
			}
			else {
				address = buffer;
			}

			name = this.normalizeWhiteSpaces(name);
			address = this.normalizeWhiteSpaces(address);
			if (address.charAt(0) == '<' && address.charAt(address.length-1) == '>')
				address = address.substring(1, address.length-1);

			if (name && aOnlyNamePart && !address)
				address = this.kTEMP_ADDRESS;
			var full = this.HeaderParser.makeFullAddressWString(name, address);
			if (name && aOnlyNamePart && address == this.kTEMP_ADDRESS)
				full = full.substring(0, full.length - ('<'+this.kTEMP_ADDRESS+'>').length);

			return this.normalizeWhiteSpaces(full);
		},
		kTEMP_ADDRESS : 'TEMP@TEMP',
  
		normalize : function(aAddresses) 
		{
			return (aAddresses)
					.replace(/(\u201c|\u201d)/g, '"')
					.replace(/\uff08/g, '(')
					.replace(/\uff09/g, ')');
		},
 
		normalizeWhiteSpaces : function(aString) 
		{
			return String(aString)
					.replace(/[\s]+/g, ' ')
					.replace(/^\s+|\s+$/g, '');
		},
 
		decode : function(aInput) { 
			var encodedParts = aInput.match(/=\?[-_a-z0-9]+\?.\?[^?]+\?=/gi);
			var self = this;
			encodedParts.sort().forEach(function(aPart) {
				if (!/[ \t]+/.test(aPart)) {
					aInput = aInput.replace(
						aPart,
						self.MIMEHeaderParam.getParameter(aPart, '', '', false, {})
					);
					return;
				}
				var prefix = aPart.match(/^=\?[^\?]+\?Q\?/);
				var parts = aPart.match(/[ \t]+|[^ \t]+/g);
				parts = parts.map(function(aSubPart, aIndex) {
					if (aIndex > 0 && !/[ \t]+/.test(aSubPart)) aSubPart = prefix + aSubPart;
					if (aIndex < parts.length-1 && !/[ \t]+/.test(aSubPart)) aSubPart += '?=';
					return aSubPart;
				}).join('');
				aInput = aInput.replace(aPart, self.decode(parts));
			});
			return aInput;
		},

 
		encode : function(aAddresses, aCharset) { 
			if (!aCharset) aCharset = 'ISO-2022-JP';
			var self = this;
			var addresses = {};
			var names     = {};
			var fullnames = {};
			var count     = {};
			self.HeaderParser.parseHeadersWithArray(aAddresses, addresses, names, fullnames, count);
			return addresses.value.map(function(aAddress, aIndex) {
				var name = names.value[aIndex];
				self.UnicodeConverter.charset = aCharset;
				name = self.wrapAddress(name, true);
				name = self.UnicodeConverter.ConvertFromUnicode(name);
				name = self.MIMEConverter.encodeMimePartIIStr(name, false, aCharset, 0, 65000);
				return self.HeaderParser.makeFullAddressWString(name, aAddress);
			}).join(', ');
		},
 
		HeaderParser : Components.classes['@mozilla.org/messenger/headerparser;1'] 
			.getService(Components.interfaces.nsIMsgHeaderParser),
		MIMEConverter : Components.classes['@mozilla.org/messenger/mimeconverter;1']
			.getService(Components.interfaces.nsIMimeConverter),
		MIMEHeaderParam : Components.classes['@mozilla.org/network/mime-hdrparam;1']
			.getService(Components.interfaces.nsIMIMEHeaderParam),
		UnicodeConverter : Components.classes['@mozilla.org/intl/scriptableunicodeconverter']
			.getService(Components.interfaces.nsIScriptableUnicodeConverter)
 
	}; 

  
	window.MessagesHeaderReader = { 
	
		get isAttachment() 
		{
			return 'arguments' in window &&
				window.arguments &&
				window.arguments.length &&
				window.arguments[0] instanceof Components.interfaces.nsIURI &&
				window.arguments[0] instanceof Components.interfaces.nsIMsgMailNewsUrl;
		},
	
		get messageURI() 
		{
			return this.isAttachment ? window.arguments[0] : null ;
		},
  
		get isLocalFile() 
		{
			return 'arguments' in window &&
				window.arguments &&
				window.arguments.length &&
				window.arguments[0] instanceof Components.interfaces.nsIURI &&
				window.arguments[0] instanceof Components.interfaces.nsIFileURL;
		},
	
		get messageFile() 
		{
			return this.isLocalFile ? window.arguments[0].file : null ;
		},
  
		getHeaderValueFrom : function(aHeader, aMessageURI) 
		{
			if (this.isAttachment) {
				return this.getHeaderValueFromAttachment(aHeader);
			}
			else if (this.isLocalFile) {
				return this.getHeaderValueFromFile(aHeader);
			}
			else {
				var hdr = this.getMsgDBHdrForMessage(aMessageURI);
				switch (aHeader.toLowerCase())
				{
					case 'from':
						return hdr.author;
					case 'to':
						return hdr.recipients;
					case 'cc':
						return hdr.ccList;
				}
			}
			return '';
		},
	
		getMsgDBHdrForMessage : function(aMessageURI) 
		{
			if (aMessageURI)
				return messenger.msgHdrFromURI(aMessageURI);

			var hdr;
			try {
				hdr = gDBView.hdrForFirstSelectedMessage;
			}
			catch(e) {
				var messageId = currentHeaderData['message-id'].headerValue;
				if (!messageId) {
					throw [
						'MessagesHeaderReader.getMsgDBHdrForMessage (normalizequotes@clear-code.com)',
						'Fatal Error: No Message ID'
						].join('\n');
				}
				if (messageId.charAt(0) == '<')
					messageId = messageId.substring(1, messageId.length-1);
				try {
					hdr = gDBView.db.getMsgHdrForMessageID(messageId);
				}
				catch(ex) {
					var headerResult = [];
					for (var i in currentHeaderData)
					{
						headerResult.push(i+' = '+currentHeaderData[i].headerValue);
					}
					throw [
						'MessagesHeaderReader.getMsgDBHdrForMessage (normalizequotes@clear-code.com)',
						'Fatal Error: Failed to get nsIMsgDBHdr.',
						'----\nParsed Header:\n'+headerResult.join('\n')+'\n----',
						'\n'+ex
						].join('\n');
				}
			}
			return hdr;
		},
 
		getHeaderValueFromAttachment : function(aHeader) 
		{
			var contents = this.cachedContents || this.readAttachment(this.messageURI);
			if (!contents) return null;
			this.cachedContents = contents;
			return this.getHeaderValueFromCache(aHeader);
		},
	
		readAttachment : function(aURI) 
		{
			try {
				var uri = aURI.spec;
				const IOService = Components.classes['@mozilla.org/network/io-service;1']
							.getService(Components.interfaces.nsIIOService);

				/[?&]number=([0-9]+)/.test(uri);
				var offset = parseInt(RegExp.$1);
				/[?&]part=1.([0-9]+)/.test(uri);
				var part = parseInt(RegExp.$1);

				uri = IOService.newURI(uri.replace(/^mailbox:/, 'file:'), null, null);

				var boundary = '';
				var content;

				if (!gDBView.db) { // for attachments of local files
					// Thunderbirdのバグのため、このセクションは実際には使われない
					// （ローカルに保存したメッセージの添付ファイルを開けないバグ）
					if (!this.cachedLocalContents)
						this.cachedLocalContents = this.readFile(uri.file);

					this.cachedLocalContents.split('\n').some(function(aLine) {
						if (aLine.indexOf('boundary=') < 0) return false;
						boundary = aLine.substring(aLine.indexOf('"')+1);
						boundary = '--' + boundary.substring(0, boundary.indexOf('"'));
						return true;
					});
					content = this.cachedLocalContents;
				}
				else {
					var hdr = gDBView.db.GetMsgHdrForKey(offset);

					var channel = IOService.newChannelFromURI(uri)
						.QueryInterface(Components.interfaces.nsIFileChannel);
					var stream  = channel.open()
						.QueryInterface(Components.interfaces.nsISeekableStream)
						.QueryInterface(Components.interfaces.nsILineInputStream);

					stream.seek(stream.NS_SEEK_SET, offset);

					// read header
					var line = {};
					content = [];
					while (stream.readLine(line))
					{
						content.push(line.value);
						if (!boundary && line.value.indexOf('boundary=') > -1) {
							boundary = line.value.substring(line.value.indexOf('"')+1);
							boundary = '--' + boundary.substring(0, boundary.indexOf('"'));
						}
						if (!line.value) break;
					}

					// read body
					var count  = hdr.lineCount;
					for (var i = 0; i < count; i++)
					{
						if (!stream.readLine(line)) break;
						content.push(line.value);
					}

					stream.close();

					content = content.join('\n');
				}

				return content
						.split(boundary)[part] // 当該添付ファイルを取得
						.replace(/^\s+|\s+$/g, '')
						.split('\n\n')[1]; // 添付ファイルとしてのヘッダと本文を削除
			}
			catch(e) {
			}
			return null;
		},
  
		getHeaderValueFromFile : function(aHeader) 
		{
			var contents = this.cachedContents || this.readFile(this.messageFile);
			if (!contents) return null;
			this.cachedContents = contents;
			return this.getHeaderValueFromCache(aHeader);
		},
	
		readFile : function(aFile) 
		{
			var stream = Components.classes['@mozilla.org/network/file-input-stream;1']
						.createInstance(Components.interfaces.nsIFileInputStream);
			try {
				stream.init(aFile, 1, 0, false); // open as "read only"

				var scriptableStream = Components.classes['@mozilla.org/scriptableinputstream;1']
						.createInstance(Components.interfaces.nsIScriptableInputStream);
				scriptableStream.init(stream);

				var fileSize = scriptableStream.available();
				var fileContents = scriptableStream.read(fileSize);

				scriptableStream.close();
				stream.close();

				return fileContents;
			}
			catch(e) {
				return null;
			}
		},
  
		getHeaderValueFromCache : function(aHeader) 
		{
			if (!this.cachedContents) return null;

			if (aHeader in this.cachedHeader)
				return this.cachedHeader[aHeader];

			aHeader = aHeader+':';

			var headerRegExp = /^[^\s:]+:/;

			var lines = this.cachedContents.split('\n');
			var inHeader = false;
			var result = [];
			lines.some(function(aLine) {
				if (!aLine) return true; // end of header

				if (aLine.toLowerCase().indexOf(aHeader) == 0)
					inHeader = true;
				else if (headerRegExp.test(aLine))
					inHeader = false;

				if (inHeader)
					result.push(aLine);
				else if (result.length)
					return true;

				return false;
			});

			this.cachedHeader[aHeader] = result.join('\n').replace(headerRegExp, '');
			return this.cachedHeader[aHeader];
		},
		cachedHeader : {},
		cachedContents : null
  
	}; 
   
	/* for reply */ 
	 
	/* 「全員に返信」時の処理の流れ： 
		MsgReplyToAllMessage()
			http://mxr.mozilla.org/mailnews/source/mail/base/content/mailWindowOverlay.js#1117
		ComposeMessage()
			http://mxr.mozilla.org/mailnews/source/mail/base/content/mailCommands.js#173
		nsMsgComposeService::OpenComposeWindow()
			http://mxr.mozilla.org/mailnews/source/mailnews/compose/src/nsMsgComposeService.cpp#417
		nsMsgComposeService::OpenWindow()
			http://mxr.mozilla.org/mailnews/source/mailnews/compose/src/nsMsgComposeService.cpp#248
		nsMsgComposeService::InitCompose()
			http://mxr.mozilla.org/mailnews/source/mailnews/compose/src/nsMsgComposeService.cpp#702
		nsMsgCompose::Initialize()
			http://mxr.mozilla.org/mailnews/source/mailnews/compose/src/nsMsgCompose.cpp#760
		nsMsgCompose::CreateMessage()
			http://mxr.mozilla.org/mailnews/source/mailnews/compose/src/nsMsgCompose.cpp#1517
			http://mxr.mozilla.org/mailnews/source/mailnews/compose/src/nsMsgCompose.cpp#1955
			このあたりでnsIMsgDBHdr.recipientsからTo:フィールドの内容を決定。
			DBHdrのrecipientsはOutputEmailAddressesですでにノーマライズ済みで、
			Thunderbirdが正常に処理できる内容になっている。
			しかし、CC:フィールドはここでは決定せず、
			QuotingOutputStreamListener::OnStopRequest()
				http://mxr.mozilla.org/mailnews/source/mailnews/compose/src/nsMsgCompose.cpp#2311
			こちらで別途決定している。ここはどうやら元データから直接アドレスを
			抽出しているらしい。
		以上のことから、正攻法でいくのは諦めて、「全員に返信」実行直前に対象メールの
		CCをキャッシュしておき、メール作成ウィンドウが開かれた後にそれを独自に流し込む、
		という方法で行くことにする。
	*/

	// 全員に返信：元メッセージ側
	if ('ComposeMessage' in window) {
		eval('window.ComposeMessage = '+
			window.ComposeMessage.toSource().replace(
				'{',
				<><![CDATA[$&
					ComposerRecipientsListGenerator.clear();
				]]></>
			).replace(
				'var hdr = messenger.msgHdrFromURI(messageUri);',
				<><![CDATA[$&
					ComposerRecipientsListGenerator.saveForReply(messageUri, type);
				]]></>
			)
		);
	}

	// 全員に返信：新規メッセージ側
	if ('CompFields2Recipients' in window) {
		eval('window.CompFields2Recipients = '+
			window.CompFields2Recipients.toSource().replace(
				/(msgCompFields.(to|cc|bcc))/g,
				'RFC2822AddressesParser.normalize($1)'
			).replace(
				'var msgBCC = ',
				<><![CDATA[
					msgTo = ComposerRecipientsListGenerator.loadForReply('recipients', msgTo);
					msgCC = ComposerRecipientsListGenerator.loadForReply('cc', msgCC, msgTo);
				$&]]></>
			)
		);
	}

	if ('gComposeRecyclingListener' in window) {
		eval('window.gComposeRecyclingListener.onReopen = '+
			window.gComposeRecyclingListener.onReopen.toSource().replace(
				'{',
				<><![CDATA[$&
					ComposerRecipientsListGenerator.recyclingOriginalMsgURI = params.originalMsgURI || null;
				]]></>
			)
		);
	}
 
	window.ComposerRecipientsListGenerator = { 
	 
		clear : function() 
		{
			this.info = {};
			this.prefs.setCharPref(this.key, '');
		},
 
		saveForReply : function(aMessageURI, aReplyType) 
		{
			var info = this.generateForReply(
					aReplyType,
					this.myAddress,
					MessagesHeaderReader.getHeaderValueFrom('from', aMessageURI),
					MessagesHeaderReader.getHeaderValueFrom('to', aMessageURI),
					MessagesHeaderReader.getHeaderValueFrom('cc', aMessageURI)
				);
			if (!info) return;

			this.info[aMessageURI] = info;
			this.prefs.setCharPref(
				this.key,
				unescape(encodeURIComponent(this.info.toSource()))
			);
		},
	 
		generateForReply : function(aReplyType, aMyAddress, aAuthor, aRecipients, aCc) 
		{
			const msgCompType = Components.interfaces.nsIMsgCompType;
			switch (aReplyType)
			{
//				case msgCompType.Reply:
				case msgCompType.ReplyAll:
				case msgCompType.ReplyToSender:
//				case msgCompType.ReplyToGroup:
//				case msgCompType.ReplyToSenderAndGroup:
//				case msgCompType.ReplyWithTemplate:
//				case msgCompType.ReplyToList:
					break;
				default:
					return null;
			}

			var author = this.removeDuplicateAddresses(
					aAuthor,
					aMyAddress
				);
			var recipients = this.removeDuplicateAddresses(
					aRecipients,
					author + ((author && aMyAddress) ? ', ' : '' ) + aMyAddress
				);
			var cc = this.removeDuplicateAddresses(
					aCc,
					recipients + ((recipients && aMyAddress) ? ', ' : '' ) + aMyAddress
				);

			return {
				recipients : (
					(aReplyType == msgCompType.ReplyAll) ?
						(author + ((author && recipients) ? ', ' : '' ) + recipients) :
						(author ? author : recipients )
				),
				cc : (
					(aReplyType == msgCompType.ReplyAll) ?
						(recipients + ((recipients && cc) ? ', ' : '' ) + cc) :
						''
				)
			};
		},
	 
		removeDuplicateAddresses : function(aBaseAddresses, aRemoveAddresses) 
		{
			var original = RFC2822AddressesParser.parseAddresses(aBaseAddresses);

			var removeAddresses = {};
			var removeNames     = {};
			var removeFullnames = {};
			var removeCount     = {};

			RFC2822AddressesParser.HeaderParser.parseHeadersWithArray(
				aRemoveAddresses,
				removeAddresses, removeNames, removeFullnames, removeCount
			);
			removeAddresses.value.forEach(function(aRemoveAddress) {
				aRemoveAddress = '<'+aRemoveAddress+'>';
				original.addresses = original.addresses.filter(function(aAddress, aIndex) {
					return ('<'+aAddress+'>').indexOf(aRemoveAddress) < 0;
				});
			});
			return original.addresses.join(', ');
		},
  	 
		loadForReply : function(aKey, aDefaultValue, aRemoveValue) 
		{
			var retVal = aDefaultValue;
			try {
				var uri = (window.arguments && window.arguments.length && window.arguments[0]) ?
						window.arguments[0].originalMsgURI :
						this.recyclingOriginalMsgURI ;
				if (uri) {
					var info;
					eval('info = '+decodeURIComponent(escape(this.prefs.getCharPref(this.key))));
					if (uri in info) {
						retVal = info[uri][aKey] || aDefaultValue;
					}
				}
			}
			catch(e) {
			}
			return aRemoveValue ? this.removeDuplicateAddresses(retVal, aRemoveValue) : retVal ;
		},
 
		get myAddress() 
		{
			var accountManager = Components.classes['@mozilla.org/messenger/account-manager;1']
				.getService(Components.interfaces.nsIMsgAccountManager);
			var identities = accountManager.defaultAccount.identities;
			if (identities.Count() == 0) identities = gAccountManager.allIdentities;
			identity = identities.QueryElementAt(0, Components.interfaces.nsIMsgIdentity);
			return identity.email;
		},
 
		info : {}, 
		key  : 'extensions.normalizequotes@clear-code.com.replyInfo',
 
		prefs : Components.classes['@mozilla.org/preferences;1'] 
			.getService(Components.interfaces.nsIPrefBranch)
 
	}; 
    
}, false); 
 
