// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: calendar-alt;
let days = [
     "Sunday",
     "Monday",
     "Tuesday",
     "Wednesday",
     "Thursday",
     "Friday",
     "Saturday"
];

let library_url = "https://kitsu.io/api/edge/library-entries?filter[status]=current&filter[userId]=402618";
let req = new Request( library_url );
let json = await req.loadJSON();

let anime_urls = [];
for ( entry of json.data ) {
     anime_urls.push( entry.relationships.anime.links.related );
}

let shows = await Promise.all( anime_urls.map( async function( url ) {
     let req = new Request( url );
     return await req.loadJSON();
} ) );

let notify_enabled, fm, data_path;
if ( config.runsInApp ) {
	fm = FileManager.iCloud();
	data_path = fm.joinPath( fm.documentsDirectory(), "/Data/anime_schedule.json" );
     notify_enabled = JSON.parse( fm.readString( data_path ) ).notify_enabled;
}
let schedule = [[],[],[],[],[],[],[]];

for ( show of shows ) {
     if ( null === show.data ) {
          continue;
     }

     if ( null !== show.data.attributes.endDate ) {
          let current_date = new Date();
          let end_date = new Date( show.data.attributes.endDate );
          if ( end_date < current_date ) {
               continue;
          }
     }

     let titles = show.data.attributes.titles;
     let title = "";
     if ( "en" in titles ) {
          title = titles.en;
     } else if ( "en_jp" in titles ) {
          title = titles.en_jp;
     } else {
          title = titles.ja_jp;
     }

     let show_date = new Date( show.data.attributes.startDate );
     let day = show_date.getUTCDay();
     schedule[ day ].push( title );
}

let table = new UITable();
table.showSeparators = true;

render_table();
await QuickLook.present( table );

if ( config.runsInApp ) {
	let schedule_data = {
	     notify_enabled: notify_enabled
	};
	fm.writeString( data_path, JSON.stringify( schedule_data ) );
}

function render_table() {
     table.removeAllRows();

     if ( config.runsInApp ) {
          let notify_toggle_row = new UITableRow();
          notify_toggle_row.height = 40;
          notify_toggle_row.addText( "Notifications" );
          notify_toggle_row.backgroundColor = Color.darkGray();

          let btn_text = notify_enabled ? "Disable 🗑" : "Enable ⏰";
          let enable_btn = notify_toggle_row.addButton( btn_text );
          enable_btn.rightAligned();
          enable_btn.onTap = toggle_notifications;
     
          table.addRow( notify_toggle_row );
     }

     for ( let i in schedule ) {
          if ( schedule[ i ].length == 0 ) {
               continue;
          }

          let header_row = new UITableRow();
          header_row.isHeader = true;
          header_row.height = 60;
          header_row.addText( days[ i ] );

          table.addRow( header_row );

          for ( title of schedule[ i ] ) {
               let row = new UITableRow();
               row.addText( title );
               row.height = 40;
               table.addRow( row );
          }
     }

     table.reload();
}

function toggle_notifications() {
     notify_enabled = !notify_enabled;

     if ( notify_enabled ) {
          for ( let i in schedule ) {
               if ( schedule[ i ].length > 0 ) {
                    schedule_weekday( schedule[ i ], parseInt( i ) + 1 );
               }
          }   
     } else {
          unschedule_notifications();
     }

     render_table();
}

function schedule_weekday( titles, weekday ) {
     let notify = new Notification();
     notify.setWeeklyTrigger( weekday, 8, 0, true );
     notify.title = "New Episode" + titles.length > 0 ? "s" : "";
     notify.body = titles.join( "\n" );
     notify.threadIdentifier = 'anime_schedule';
     notify.schedule();
}

async function unschedule_notifications() {
     let notifications = await Notification.allPending();
     for ( let notification of notifications ) {
          if ( notification.threadIdentifier === 'anime_schedule' ) {
               notification.remove();
          }
     }
}