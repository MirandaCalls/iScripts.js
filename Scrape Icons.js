// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: file-image;
class Icon {
	constructor(type, url) {
		this.type = type;
		this.url = url;
	}	
}

let url = args.shortcutParameter;
if (!url) {
	throw new Error("No shortcut parameter provided.");
}

let url_parts = url.split("/");
let protocol = url_parts[0];
let host = url_parts[2];
let base_url = protocol + '//' + host;

let request = new Request(url);
let html = await request.loadString();

let results = [];
let parser = new XMLParser(html);
parser.didStartElement = (eleName, attributes) => {
	if (attributes.rel && attributes.rel == "shortcut icon") {
		results.push(new Icon("favicon", base_url + attributes.href));
	}
}
parser.parse();
Script.setShortcutOutput(results);