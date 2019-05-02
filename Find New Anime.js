// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: tv;
const SEASONS = ["Winter", "Spring", "Summer", "Fall"];

let current_date = new Date();
let month = current_date.getMonth();
let year = current_date.getFullYear();
let season = SEASONS[ Math.floor( month / 3 ) ];

/* Build the initial table with the current season + year. */
let table = new UITable();
table.showSeparators = true;
await display_season( season, year );

/* Display the "app", execution ends when the table is closed. */
QuickLook.present( table );

async function display_season( season, year ) {
	table.removeAllRows();
	
	let url = "https://kitsu.io/api/edge/anime?sort=popularityRank&filter[season]="
		+ season.toLowerCase() + "&filter[year]="
		+ year
		+ "&page[limit]=20";
	let req = new Request( url );
	let json = await req.loadJSON();
	
	let shows = json.data;
	
	let title_row = new UITableRow();
	title_row.isHeader = true;
	
	let season_header = season + ' ' + year;
	title_row.addText( season_header ).leftAligned();
	
	let season_btn = title_row.addButton( "Season 🗓" );
	season_btn.rightAligned();
	season_btn.onTap = async function() {
		let new_season = await pick_season();
		if ( null !== new_season ) {
			display_season( SEASONS[ new_season ], year );
		}
	}
	
	table.addRow( title_row );
	
	for ( show of shows ) {
		let row = new UITableRow();
		row.dismissOnSelect = false;
	
		let details = await getShowDetails( show );

		let imageCell = row.addImageAtURL( details.imageUrl );
		let summary_text = details.showType + "\nStarts " + details.startDate;
		let detailsCell = row.addText( details.title, summary_text );
	
		imageCell.widthWeight = 20;
		detailsCell.widthWeight = 80;
	
		row.height = 100;
		row.cellSpacing = 10;
	
		row.onSelect = async ( idx ) => {
			let data = await getShowDetails( shows[ idx - 1 ], true );
			render_template( 'AnimeDetails.html', data );
		}
	
		table.addRow( row );
	}
	
	table.reload();
}

function render_template( fileName, data ) {
	let fm = FileManager.iCloud();
	let templatePath = fm.joinPath( fm.documentsDirectory(), "Templates/" + fileName );
	let html = fm.readString( templatePath );

	for ( key in data ) {
		html = html.replace( '{' + key + '}', data[ key ] );
	}

	WebView.loadHTML( html );
}

async function pick_season() {
	let alert = new Alert();
	alert.title = "Which season to find shows for?";
	for ( season of SEASONS ) { 
		alert.addAction( season );
	}
	alert.addCancelAction( "Cancel" );
	let idx = await alert.presentAlert();
	if ( idx == -1 ) {
		return null;
	} else {
		return idx;
	}
}

async function getShowDetails( kitsuShow, loadCategories = false ) {
	let result = {};

	let titles = kitsuShow.attributes.titles;
	result.title = "";
	if ( "en" in titles ) {
		result.title = titles.en;
	} else if ( "en_jp" in titles ) {
		result.title = titles.en_jp;
	} else {
		result.title = titles.ja_jp;
	}

	result.imageUrl = kitsuShow.attributes.posterImage.medium;

	let subtype = kitsuShow.attributes.subtype;
	result.showType = subtype.charAt( 0 ).toUpperCase() + subtype.substring( 1 );
	result.synopsis = kitsuShow.attributes.synopsis;
	result.startDate = kitsuShow.attributes.startDate;
	result.videoUrl = "https://www.youtube.com/embed/" + kitsuShow.attributes.youtubeVideoId;

	if ( loadCategories ) {
		let categoryNames = await getCategories( kitsuShow.relationships.categories.links.related );
		result.categories = categoryNames.join( ", " );
	}

	return result;
}

async function getCategories( categoriesUrl ) {
	let req = new Request( categoriesUrl );
	let json = await req.loadJSON();

	let names = [];
	for ( category of json.data ) {
		names.push( category.attributes.title );
	}

	return names;
}
