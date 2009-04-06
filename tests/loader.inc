var namespace = {};
var init = function(aListener) { aListener(namespace); };
var source = utils.readFrom(baseURL+'../content/normalizequotes/globalOverlay.js');
source = source.split('\n');
source.shift();
source.shift();
source.unshift('init(function(window) {');
source = source.join('\n');
eval(source);

var MessagesHeaderFixer = namespace.MessagesHeaderFixer;
var RFC2822AddressesParser = namespace.RFC2822AddressesParser;
var MessagesHeaderReader = namespace.MessagesHeaderReader;
var ComposerRecipientsListGenerator = namespace.ComposerRecipientsListGenerator;
