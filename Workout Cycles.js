// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: dumbbell;
const Modals = importModule('Modules/Modals.js');
const ModalAction = Modals.ModalAction;
const renderTemplate = importModule('Modules/WebUI.js').renderTemplate;

const HEX_APPLE_BLUE = '#007AFF';

let fm = FileManager.iCloud();
let data_path = fm.joinPath(fm.documentsDirectory(), "/Data/workouts.json");
let workouts = JSON.parse(fm.readString(data_path)).workouts;

let table = new UITable();
table.showSeparators = true;
renderWorkouts();

await QuickLook.present(table);

function renderWorkouts() {
	table.removeAllRows();
	
	let header_row = new UITableRow();
	header_row.isHeader = true;
	header_row.height = 40;
	header_row.backgroundColor = Color.darkGray();
	header_row.addText('Workouts').leftAligned();
	table.addRow(header_row);

	let btn_add = header_row.addButton('✏️');
	btn_add.rightAligned();
	btn_add.onTap = async() => {
		let new_workout = await Modals.inputPrompt('Add Workout', 'name');
		workouts.push({
			name: new_workout,
			weight: 0
		});
		renderWorkouts();
	};
	
	workouts.forEach((workout, idx) => {
		let workout_row = new UITableRow();
	
		let name_cell = workout_row.addText(workout.name);
		name_cell.widthWeight = 90;

		let button = workout_row.addButton(workout.weight.toString());
		button.widthWeight = 10;
		button.onTap = async () => {
			let new_val = await Modals.inputPrompt('Edit Weight', 'lbs', workout.weight.toString());
			new_val = parseInt(new_val);
			if (!isNaN(new_val)) {
				workout.weight = new_val;	
			}
			renderWorkouts();
		};
		button.rightAligned();

		workout_row.dismissOnSelect = false;
		workout_row.onSelect = () => {
			let edit_action = new ModalAction('Edit name', () => { editName(idx, workout.name) });
			let delete_action = new ModalAction('Delete', () => { deleteWorkout(idx) });
			delete_action.setDestructive(true);

			let actions = [
				edit_action,
				delete_action
			];
			Modals.selectFromMenu(actions);
		};
	
		table.addRow(workout_row);
	});

	let preview_row = new UITableRow();
	let btn_prev_text = preview_row.addText('Preview Cycles');
	btn_prev_text.titleColor = appleBlue();
	preview_row.dismissOnSelect = false;
	preview_row.onSelect = () => {
		let data = {
			workout_cycles: calculateCyclesData(workouts)
		}
		renderTemplate('WorkoutRoutine.html', data);
	};
	table.addRow(preview_row);

	table.reload();
}

function calculateCyclesData(workouts) {
	cycles = [];
	for (workout of workouts) {
		cycles.push({
			name: workout.name,
			day_1_weight: workout.weight,
			day_2_weight: round5(workout.weight * .9),
			day_3_weight: round5(workout.weight * .8)
		});
	}
	return cycles;
}

function round5(x) {
    return Math.ceil(x / 5) * 5;
}

async function editName(index, currentName) {
	let new_name = await Modals.inputPrompt('Update name:', 'name', currentName);
	workouts[index].name = new_name;
	renderWorkouts();
}

function deleteWorkout(index) {
	workouts.splice(index, 1);
	renderWorkouts();
}

function appleBlue() {
	let color = new Color(HEX_APPLE_BLUE);
	return color;
}

let new_data = {
	workouts: workouts
};
fm.writeString(data_path, JSON.stringify(new_data));