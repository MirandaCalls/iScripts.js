// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: book;
var Handlebars = importModule('Modules/handlebars.js');
const ICloud = importModule("Modules/ICloud.js");

const WORKOUT_INTENSITIES = {
    1: "Heavy",
    2: "Medium",
    3: "Light"
};
const HEX_APPLE_BLUE = '#007AFF';
const HEX_SUB_COLOR = '#adadad';
let logs = ICloud.loadJSON("workout_logs.json");
let workouts = ICloud.loadJSON("workouts.json").workouts;

if ("new" in args.queryParameters)
{
    let log_data = JSON.parse(decodeURIComponent(args.queryParameters.new));
    let failed_indexes = log_data.failed.split(",");
    let new_log = {
        datetime: (new Date()).toISOString(),
        intensity: log_data.intensity,
        reps: log_data.reps,
        workouts: []
    };
    workouts.forEach((workout, idx) => {
        let weight = workout.weight;
        if (new_log.intensity == 2)
        {
            weight = round5(weight * .9);
        } else if (new_log.intensity == 3)
        {
            weight = round5(weight * .8);
        }

        let failed = failed_indexes.includes(idx.toString());
        new_log.workouts.push({
            name: workout.name,
            weight: weight,
            failed: failed
        });
    });
    logs.unshift(new_log);
    ICloud.saveJSON(logs, 'workout_logs.json');
} else if ("delete" in args.queryParameters) {
    logs.splice(args.queryParameters.delete, 1);
    ICloud.saveJSON(logs, 'workout_logs.json');
}

let table = new UITable();
table.showSeparators = true;
renderLogs();

await QuickLook.present(table);

function renderLogs()
{
    table.removeAllRows();

    let add_new_row = new UITableRow();
    add_new_row.dismissOnSelect = false;
    let add_text = add_new_row.addText('Add Log');
    add_text.titleColor = new Color(HEX_APPLE_BLUE);
    add_new_row.onSelect = submitWorkoutForm;
    table.addRow(add_new_row);

    for (log of logs)
    {
        let row = new UITableRow();
        row.dismissOnSelect = false;
        row.height = 60;
        let log_date = new Date(log.datetime);
        let date = log_date.toDateString();
        let details = WORKOUT_INTENSITIES[log.intensity] + " / " + log.reps + " reps";
        let details_text = row.addText(date, details);
        details_text.widthWeight = 70;
        details_text.subtitleColor = new Color(HEX_SUB_COLOR);

        let failed_count = 0;
        for (workout of log.workouts)
        {
            failed_count += (workout.failed ? 1 : 0);
        }
        let failed_text = row.addText(failed_count + " Failed");
        failed_text.rightAligned();
        failed_text.widthWeight = 30;

        row.onSelect = (selectionIdx) => {
            let log_entry = logs[selectionIdx-1];
            let date_added = new Date(log_entry.datetime);
            log_entry.log_index = selectionIdx-1;
            log_entry.date = date_added.toLocaleString();
            log_entry.intensity_name = WORKOUT_INTENSITIES[log_entry.intensity];
            log_entry.workouts.forEach((workout, idx) => {
                log_entry.workouts[idx].failedIcon = workout.failed ? '❌' : '✅';
            });
            WebView.loadHTML(renderView("ViewWorkoutLog.hbs", log_entry));
        };
        table.addRow(row);
    }
}

function submitWorkoutForm() {
    let data = {
        workoutList: []
    };
    workouts.forEach((workout, idx) => {
        data.workoutList.push({
            workout_id: idx,
            label: workout.name
        });
    });
    WebView.loadHTML(renderView("SubmitWorkoutLog.hbs", data));
}

function round5(x) {
    return Math.ceil(x / 5) * 5;
}

function renderView(viewFilename, data) {
	var fm = FileManager.iCloud();
	var template = Handlebars.compile(fm.readString(fm.documentsDirectory() + "/Templates/" + viewFilename));
	return template(data);
}