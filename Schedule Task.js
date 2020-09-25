// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: calendar-check;
const TYPE_TODAY = "today";
const TYPE_WEEKEND = "weekend";

if (!args.shortcutParameter) {
	throw new Error("Script missing shortcut input.");
}

let input = args.shortcutParameter;
if (!input.label || input.label.length === 0) {
	throw new Error("No label provided.");
}

let due_date;
switch(args.shortcutParameter.type) {
	case TYPE_TODAY:
		due_date = new Date();
		break;
	case TYPE_WEEKEND:
		due_date = new Date();
		let dow = due_date.getDay();
		let difference = dow != 0 ? 7 - dow : 0;
		due_date.setDate(due_date.getDate() + difference);
		break;
	default:
		throw new Error("Invalid due date type");
}

due_date.setHours(17);
due_date.setMinutes(0);

let default_list = await Calendar.defaultForReminders();
let task = new Reminder();
task.calendar = default_list;
task.title = input.label;
task.dueDate = due_date;
task.dueDateIncludesTime = true;
task.save();

Script.complete();