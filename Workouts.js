// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: dumbbell;
let fm = FileManager.iCloud();

let data_path = fm.joinPath( fm.documentsDirectory(), "/Data/workouts.json" );
let workouts = JSON.parse( fm.readString( data_path ) ).workouts;

let table = new UITable();
table.showSeparators = true;

let header_row = new UITableRow();
header_row.isHeader = true;
let header_text = header_row.addText( "Workouts" ).centerAligned();
table.addRow( header_row );

for ( workout of workouts ) {
	let workout_row = new UITableRow();
	
	let workout_name = workout_row.addText( workout.name );
	let button = workout_row.addButton( workout.weight.toString() );
	button.rightAligned();
	
	table.addRow( workout_row );
}

QuickLook.present( table );

let value = await edit_weight( "9999" );
console.log( value );

let test_row = new UITableRow();
test_row.addText("Blah");
table.addRow( test_row );
table.reload();

async function edit_weight( weightAmount ) {
	let alert = new Alert();
	alert.title = "Edit Weight";
	alert.addTextField( "lbs", weightAmount );
	alert.addAction( "Save" );
	
	await alert.presentAlert();
	
	return alert.textFieldValue( 0 );
}
