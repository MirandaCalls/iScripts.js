// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: calendar-alt;
const Handlebars = importModule( 'Modules/handlebars.js' );

class Anime {
     constructor(title, image, startDate, endDate) {
          this.title = title;
          this.image = image;
          this.start_date = startDate;
          this.end_date = endDate;
     }
}

class LibraryEntry {
     constructor(type, resourceData) {
          this.type = type;
          this.resource = resourceData;
     }
}

class KitsuApi {
     constructor(userId) {
          this.url = 'https://kitsu.io/api/edge';
          this.user_id = userId;
     }

     async getLibraryEntries() {
          let self = this;
          let url = `${this.url}/library-entries?filter[status]=current&filter[userId]=${this.user_id}&filter[kind]=anime&page[limit]=20`;
          let req = new Request(url);
          let response = await req.loadJSON();
          return await Promise.all(response.data.map(async function(data) {
               let req = new Request(data.relationships.anime.links.related);
               let response = await req.loadJSON();
               return new LibraryEntry(
                    "anime",
                    self._buildAnimeEntity(response.data)
               );
          }));
     }

     _buildAnimeEntity(entity) {
          let titles = entity.attributes.titles;
          let title = "";
          if ( "en" in titles ) {
               title = titles.en;
          } else if ( "en_jp" in titles ) {
               title = titles.en_jp;
          } else {
               title = titles.ja_jp;
          }

          let img = entity.attributes.posterImage.medium;
          let start_date = entity.attributes.startDate;
          let end_date = entity.attributes.endDate;

          return new Anime(
               title,
               img,
               start_date,
               end_date
          );
     }
}

function scheduleWeekday(titles, dayNum) {
     let notify = new Notification();
     notify.setWeeklyTrigger(dayNum + 1, 8, 0, true);
     notify.title = "New Episode" + titles.length > 0 ? "s" : "";
     notify.body = titles.join("\n");
     notify.threadIdentifier = 'anime_schedule';
     notify.schedule();
}

async function resetNotifications() {
     let notifications = await Notification.allPending();
     for (let notification of notifications) {
          if (notification.threadIdentifier === 'anime_schedule') {
               notification.remove();
          }
     }
}

let api = new KitsuApi('402618');
let library_entries = await api.getLibraryEntries();
resetNotifications();

let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let view_data = {
     days: []
};
let now = new Date();
let end_date = new Date();
end_date.setDate(now.getDate() + 6);
for (let d = now; d <= end_date; d.setDate(d.getDate() + 1)) {
     let day_num = d.getDay();
     let titles = [];
     let images = [];
     library_entries.forEach((entry) => {
          if (null !== entry.resource.end_date) {
               let show_end_date = new Date(entry.resource.end_date);
               if (show_end_date < d) {
                    return;
               }
          }
          let show_start_date = new Date(entry.resource.start_date);
          if (day_num == show_start_date.getUTCDay()) {
               titles.push(entry.resource.title);
               images.push(entry.resource.image);
          }
     });

     let message = false;
     if (images.length == 0) {
          message = 'No new episodes.';
     } else {
          scheduleWeekday(titles, day_num);
     }
     view_data.days.push({
          date: d.getDate(),
          header: days[day_num],
          message: message,
          images: images
     });
}

let fm = FileManager.iCloud();
let template = Handlebars.compile(fm.readString(fm.documentsDirectory() + "/Templates/AnimeSchedule.hbs"));
let html = template(view_data);
Script.setShortcutOutput(html);
Script.complete();