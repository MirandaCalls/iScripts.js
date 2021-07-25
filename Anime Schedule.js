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
	
	if (config.runsInWidget) {
		await renderWidget(schedule);
		return;
	}
	
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
	var notifications = await Notification.allPending();
	notifications.filter((notify) => {
		return notify.threadIdentifier === NOTIFY_KEY;
	}).forEach((notify) => {
		notify.remove();
	});
}

function buildSchedule(entries) {
	var livechart = loadLivechartData();
	var schedule = [];
	var now = new Date();
	var end_date = new Date().setDate(now.getDate() + 6);
	var shows = entries.map((entry) => {
		return entry.anime;
	}).filter((anime) => {
		return livechart.hasOwnProperty(anime.id);
	}).map((anime) => {
		anime.nextAirdateMts = livechart[anime.id] * 1000;
		return anime;
	});
	
	for (let date = now; date <= end_date; date.setDate(date.getDate() + 1)) {
		let header = getWeekdayHeader(date);
		let shows_today = shows.filter((anime) => {
			var airdate = new Date(anime.nextAirdateMts);
			console.log(airdate)
			var airs_on_this_day = date.getDay() == airdate.getDay();
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

function loadLivechartData() {
	var fm = FileManager.iCloud();
	return JSON.parse(fm.readString(fm.bookmarkedPath("Shortcuts") + "/livechart_latest.txt"));
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

async function renderWidget(data) {
	var today_data = data[0];
	var widget = new ListWidget();
	var header_font = Font.boldSystemFont(20);
	var body_font = Font.lightSystemFont(18);
	var fm = FileManager.iCloud();

	var endColor = new Color("#1c1c1cb4");
	var gradient = new LinearGradient();
	gradient.colors = [endColor];
	gradient.locations = [1];
	widget.backgroundGradient = gradient;
	
	widget.addSpacer(null);
	var text = widget.addText("Anime Schedule");
	text.font = header_font;
	if (today_data.titles.length == 0) {
		widget.backgroundImage = Image.fromFile(fm.documentsDirectory() + "/Data/kitsu.PNG");
		text = widget.addText("No new episodes.");
		text.font = body_font;
		text = widget.addText("Go read some manga!");
		text.font = body_font;
	} else {
		let img_url = today_data.images[Math.floor(Math.random() * today_data.images.length)];
		let request = new Request(img_url);
		widget.backgroundImage = await request.loadImage();
		today_data.titles.forEach((title) => {
			text = widget.addText(title);
			text.font = body_font;
		});	
	}
	Script.setWidget(widget);
	widget.presentMedium();
}