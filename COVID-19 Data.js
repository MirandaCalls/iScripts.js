// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: flask;
function CSVToArray(strData, strDelimiter) {
    const objPattern = new RegExp(("(\\,|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\\,\\r\\n]*))"),"gi");
    let arrMatches = null, arrData = [[]];
    while (arrMatches = objPattern.exec(strData)) {
        if (arrMatches[1].length && arrMatches[1] !== ",")arrData.push([]);
        arrData[arrData.length - 1].push(arrMatches[2] ? 
            arrMatches[2].replace(new RegExp( "\"\"", "g" ), "\"") :
            arrMatches[3]);
    }
    return arrData;
}

function emptyDataPointArray(size) {
	let arr = [];
	for (let i = 0; i < size; i++) {
		arr.push(0);
	}
	return arr;
}

async function fetchCovidCsv(type) {
	let covid_deaths_url = `https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_${type}_global.csv`;
	let request = new Request(covid_deaths_url);
	let raw = await request.load();
	let data = CSVToArray(raw.toRawString());
	data = data.splice(0, data.length - 1);
	return data;
}

function buildCountryList(csvData) {
	let countries = {};
	let dp_count = csvData[0].length - 4;
	for (let iCountry = 1; iCountry < csvData.length; iCountry++) {
		let vals = extractTimeSeriesVals(csvData, iCountry);
		let name = csvData[iCountry][1];
		if (!countries[name]) {
			countries[name] = {
				name: name,
				count: 0,
				dataPoints: emptyDataPointArray(dp_count)
			}
		}

		for (let iData = 4; iData < vals.length; iData++) {
			countries[name].dataPoints[iData] += parseInt(vals[iData]);
		}

		let iLastSeriesVal = vals.length-1;
		countries[name].count += parseInt(vals[iLastSeriesVal]);
	}
	
	return countries;
}

function getSortedCountries(cList) {
	let sort_list = Object.values(cList);
	sort_list.sort((a, b) => {
		if (a.count < b.count) {
			return 1;
		} else if (a.count > b.count) {
			return -1;
		} else {
			return 0;
		}
	});
	return sort_list;
}

function extractTimeSeriesVals(csvData, row) {
	let vals = [];
	let columns = csvData[row];
	for (let iCol = 4; iCol < columns.length; iCol++) {
		vals.push(columns[iCol]);
	}
	return vals;
}

let time_series = await fetchCovidCsv(args.shortcutParameter);
let countries = buildCountryList(time_series);
let result = {
	countries: countries,
	dates: extractTimeSeriesVals(time_series, 0)
};
Script.setShortcutOutput(JSON.stringify(result));
Script.complete();


