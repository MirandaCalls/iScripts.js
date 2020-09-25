// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: calendar-alt;
var Handlebars = importModule( 'Modules/handlebars.js' );
var Kitsu = importModule('Modules/kitsu.js');

const NOTIFY_KEY = "anime_schedule";
const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

var api = new Kitsu();
api.setUserConfig({
	userId: "402618"
});

await main();
Script.complete();

async function main() {
	resetNotifications();
	var entries = await api.getLibraryEntries();
	var schedule = buildSchedule(entries);
	schedule.forEach((day) => {
		scheduleWeekday(day.titles, day.dayIndex);
	});
	
	var html = renderView({
		days: schedule
	});
	if (config.runsInApp) {
		WebView.loadHTML(html);
	} else {
		Script.setShortcutOutput(html);
	}
};

async function resetNotifications() {
	let notifications = await Notification.allPending();
	for (let notification of notifications) {
		if (notification.threadIdentifier === NOTIFY_KEY) {
			  notification.remove();
		}
	}
}

function buildSchedule(entries) {
	var schedule = [];
	var now = new Date();
	var end_date = new Date().setDate(now.getDate() + 6);
	var shows = entries.map((entry) => {
		return entry.anime;
	}).filter((anime) => {
		return !hasAnimeEnded(anime);
	});
	
	for (let date = now; date <= end_date; date.setDate(date.getDate() + 1)) {
		let header = getWeekdayHeader(date);
		let shows_today = shows.filter((anime) => {
			var start_date = new Date(anime.startDate);
			var airs_on_this_day = date.getDay() == start_date.getUTCDay();
			return airs_on_this_day;
		});
		
		let message = false;
		if (shows_today.length == 0) {
			message = 'No new episodes.';
		}
	
		let images = shows_today.map((anime) => {
			return anime.posterImage.medium;
		});
		
		let titles = shows_today.map((anime) => {
			return choosePreferredTitle(anime.titles);
		});
		
		schedule.push({
			dayIndex: date.getDay(),
			date: date.getDate(),
			header: header,
			message: message,
			titles: titles,
			images: images
		});
	}
	return schedule;
}

function getWeekdayHeader(date) {
	var day_index = date.getDay();
	var now = new Date();
	if (day_index === now.getDay()) {
		return "TODAY";
	} else {
		return DAYS[day_index];
	}
}

function hasAnimeEnded(anime) {
	var now = new Date();
	if (anime.endDate) {
		let end_date = new Date(anime.endDate);
		if (end_date < now) {
			return true;
		}
	}
	return false;
}

function choosePreferredTitle(titles) {
	if ("en" in titles) {
		return titles.en;
	} else if ("en_jp" in titles) {
		return titles.en_jp;
	} else {
		return titles.ja_jp;
	}
}

function scheduleWeekday(titles, dayIndex) {
	let notify = new Notification();
	notify.setWeeklyTrigger(dayIndex + 1, 8, 0, true);
	notify.title = "New Episode" + titles.length > 0 ? "s" : "";
	notify.body = titles.join("\n");
	notify.threadIdentifier = NOTIFY_KEY;
	notify.schedule();
}

function renderView(data) {
	var fm = FileManager.iCloud();
	var template = Handlebars.compile(fm.readString(fm.documentsDirectory() + "/Templates/AnimeSchedule.hbs"));
	return template(data);
}