// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: cyan; icon-glyph: book;
const { renderTemplate } = importModule('Modules/WebUI.js');
const ICloud = importModule("Modules/ICloud.js");

const HEX_APPLE_BLUE = '#007AFF';
let logs = ICloud.loadJSON("workout_logs.json");
let workouts = ICloud.loadJSON("workouts.json").workouts;

if ("new" in args.queryParameters)
{
    let log_data = JSON.parse(decodeURIComponent(args.queryParameters.new));
    let failed_indexes = log_data.failed.split(",");
    let new_log = {
        datetime: (new Date()).toISOString(),
        day: log_data.day,
        reps: log_data.reps,
        workouts: []
    };
    workouts.forEach((workout, idx) => {
        let weight = workout.weight;
        if (new_log.day == 2)
        {
            weight = round5(weight * .9);
        } else if (new_log.day == 3)
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
    add_text.titleColor = appleBlue();
    add_new_row.onSelect = submitWorkoutForm;
    table.addRow(add_new_row);

    for (log of logs)
    {
        let row = new UITableRow();
        row.dismissOnSelect = false;
        let log_date = new Date(log.datetime);
        let log_text = "Day " + log.day + " - " + log_date.toDateString();
        row.addText(log_text).widthWeight = 70;

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
            log_entry.date = date_added.toLocaleString();
            log_entry.workouts.forEach((workout, idx) => {
                log_entry.workouts[idx].failedIcon = workout.failed ? '❌' : '✅';
            });
            renderTemplate("WorkoutLog.html", log_entry);
        };
        table.addRow(row);
    }
}

function submitWorkoutForm()
{
    let data = {
        workoutList: []
    };
    workouts.forEach((workout, idx) => {
        data.workoutList.push({
            workout_id: idx,
            label: workout.name
        });
    });
    renderTemplate("WorkoutLogForm.html", data);
}

function round5(x)
{
    return Math.ceil(x / 5) * 5;
}

function appleBlue()
{
	let color = new Color( HEX_APPLE_BLUE );
	return color;
}