// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: green; icon-glyph: search-plus;
class AlgoliaSearch {
	constructor(appId, apiKey, index) {
		this.app_id = appId;
		this.api_key = apiKey;
		this.index = index;
		this.query_string = null;
		this.data_set = null;
		this.limit = 25;
	}
	
	setQueryString(str) {
		if (typeof str !== 'string') {
			throw new Error('Search value must be text.');
		}
		this.query_string = str;	
	}
	
	setLimit(limit) {
		if (typeof limit !== 'number') {
			throw new Error('Limit must be a number.');
		}
		this.limit = Math.round(limit);
	}
	
	async loadRecordSet() {
		let q_params = [];
		q_params.push(`hitsPerPage=${this.limit}`);
		if (this.query_string !== null) {
			q_params.push(`query=${encodeURI(this.query_string)}`);
		}
		q_params = q_params.join('&');
		
		let url = `https://${this.app_id}-dsn.algolia.net/1/indexes/${this.index}?${q_params}`;
		let http_rq = new Request(url);
		http_rq.headers = {
			'X-Algolia-Application-Id': this.app_id,
			'X-Algolia-API-Key': this.api_key
		};

		this.data_set = await http_rq.loadJSON();
		return this.data_set.hits;
	}
}

class AniPlaylistAlbum {
	constructor(id, link, title, artist, animeTitle, imgUrl) {
		this.id = id;
		this.link = link;
		this.title = title;
		this.artist = artist;
		this.anime_title = animeTitle;
		this.img_url = imgUrl;
	}
}

let input = args.shortcutParameter;
input = input == null ? '' : input;
let aniplaylist = new AlgoliaSearch('P4B7HT5P18', 'eacf3bb4eb1e59a0891c767d7b2765de', 'songs_prod');
aniplaylist.setQueryString(input);
let records = await aniplaylist.loadRecordSet();
let albums = [];
for (let hit of records) {
	let title = hit.titles[hit.titles.length-1];
	let artist = hit.artists[0].names[0];
	let anime = hit.anime_titles[0];
	let img_url = `https://anipl.sfo2.cdn.digitaloceanspaces.com/${hit.thumbnail}`;
	albums.push(new AniPlaylistAlbum(
		hit.id,
		hit.spotify_url,
		title,
		artist,
		anime,
		img_url
	));
}

if (config.runsInApp) {
	QuickLook.present(albums);	
}
Script.setShortcutOutput(albums);
Script.complete();