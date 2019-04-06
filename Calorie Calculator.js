// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: weight;
const SEDENTARY = 1.2;
const LIGHT = 1.375;
const MODERATE = 1.465;
const ACTIVE = 1.55;
const VERY_ACTIVE = 1.725;
const EXTRA_ACTIVE = 1.9;

const CALORIES_PER_POUND = 500;

let fm = FileManager.iCloud();

let data_path = fm.joinPath( fm.documentsDirectory(), "/Data/health.json" );
let health = JSON.parse( fm.readString( data_path ) );

let clipboard_content = Pasteboard.pasteString();
if ( is_json_string( clipboard_content ) ) {
    let new_data = JSON.parse( clipboard_content );
    if ( new_data.hasOwnProperty( "weight" ) ) {
        health.weight = new_data.weight;
    }
}

let bmr = ( bmr_calc( health.age, health.weight, health.height, health.gender ) * LIGHT ).toFixed( 0 );
let one_pound_cal = bmr - CALORIES_PER_POUND;
let two_pound_cal = bmr - ( CALORIES_PER_POUND * 2 );

let data = {
    maintainAmount: bmr,
    lossAmount: one_pound_cal,
    extremeLossAmount: two_pound_cal
};

render_template( 'CalorieSummary.html', data );

let new_data = JSON.stringify( health );
fm.write( data_path, Data.fromString( new_data ) );

function is_json_string( str ) {
	let object = false;
	
	if ( str === null ) {
		return false;
	}
	
    try {
        object = JSON.parse( str );
    } catch ( e ) {
        return false;
    }

	if ( typeof object !== "object" ) {
		return false;
	}

    return true;
}

function bmr_calc( age, weight, height, gender ) {
    let result = ( 10 * weight ) + ( 6.25 * height ) - ( 5 * age );
    if ( 'male' == gender ) {
        result += 5;
    } else {
        result -= 161;
    }
    return result;
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