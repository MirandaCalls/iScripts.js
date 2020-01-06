// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: newspaper;
// Shows latest news from MacStories in a table.
// The table shows an image from the article, if available, and the title of the article.
let url = "https://macstories.net/feed/json";
let req = new Request( url );
let json = await req.loadJSON();
let allItems = json.items;
// We only show a subset of the items when running with Siri
if ( config.runsWithSiri ) {
	items = json.items.slice( 0, 5 );
} else {
	items = json.items;
}
let table = new UITable();
for ( item of items ) {
	let row = new UITableRow();
	row.dismissOnSelect = false;
	row.onSelect = ( idx ) => {
		Safari.openInApp( items[ idx ].url );
	};

	let imageURL = extractImageURL( item );
	let title = decode( item.title );
	let imageCell = row.addImageAtURL( imageURL );
	let titleCell = row.addText( title );
	imageCell.widthWeight = 20;
	titleCell.widthWeight = 80;
	row.height = 60;
	row.cellSpacing = 10;
	table.addRow( row );
}
QuickLook.present( table );

function extractImageURL( item ) {
	let regex = /<img src="(.*)" alt="/;
	let html = item["content_html"];
	let matches = html.match( regex );
	if ( matches && matches.length >= 2 ) {
		return matches[1];
	} else {
		return null;
	}
}

function decode( str ) {
	let regex = /&#(\d+);/g;
	return str.replace( regex, ( match, dec ) => {
		return String.fromCharCode( dec );
	} );
}