// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: dumbbell;
let fm = FileManager.iCloud();

let data_path = fm.joinPath( fm.documentsDirectory(), "/Data/workouts.json" );
let workouts = JSON.parse( fm.readString( data_path ) ).workouts;

let table = new UITable();
table.showSeparators = true;
renderWorkouts();

await QuickLook.present( table );

function renderWorkouts() {
	table.removeAllRows();
	
	let header_row = new UITableRow();
	header_row.isHeader = true;
	header_row.addText( 'Workouts' ).leftAligned();
	table.addRow( header_row );

	let btn_add = header_row.addButton( '+' );
	btn_add.rightAligned();
	btn_add.onTap = async () => {
		let new_workout = await inputPrompt( 'Add Workout', 'name' );
		workouts.push( {
			name: new_workout,
			weight: 0
		} );
		renderWorkouts();
	};
	
	workouts.forEach( ( workout ) => {
		let workout_row = new UITableRow();
	
		workout_row.addText( workout.name );
		let button = workout_row.addButton( workout.weight.toString() );
		button.onTap = async () => {
			let new_val = await inputPrompt( 'Edit Weight', 'lbs', workout.weight.toString() );
			new_val = parseInt( new_val );
			if ( !isNaN( new_val ) ) {
				workout.weight = new_val;	
			}
			renderWorkouts();
		};
		button.rightAligned();
	
		table.addRow( workout_row );
	} );
	table.reload();
}

async function inputPrompt( title, placeholder, value ) {
	let alert = new Alert();
	alert.title = title;
	alert.addTextField( placeholder, value );
	alert.addAction( "Save" );
	await alert.presentAlert();
	
	return alert.textFieldValue( 0 );
}

let new_data = {
	workouts: workouts
};
fm.writeString( data_path, JSON.stringify( new_data ) );