class Kitsu {
	constructor() {
		this.baseUrl = 'https://kitsu.io/api/edge';
		this.userId = null;
	}
	
	setUserConfig(config) {
		this.userId = config.userId;
	}
	
	async doApiRequest(url, method="GET") {
		var endpoint = `${this.baseUrl}${url}`;
		var request = new Request(endpoint);
		request.method = method;
		return await request.loadJSON();
	}
	
	async getLibraryEntries() {
		if (!this.userId) {
			throw new Error("No user ID configured.");
		}
		
		var url = `/library-entries?filter[status]=current&filter[userId]=${this.userId}&filter[kind]=anime&include=anime&page[limit]=20`;
		var result = await this.doApiRequest(url);
		var entries = result.data;
		var anime = result.included;
		
		return entries.map((data) => {
			var library_entry = data.attributes;
			var filtered = anime.filter((show) => {
				return show.id == data.relationships.anime.data.id;
			});
			library_entry.anime = filtered[0].attributes;
			return library_entry;
		});
	}
}

module.exports = Kitsu;