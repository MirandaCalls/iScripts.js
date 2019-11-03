function loadJSONFromICloud(fileName)
{
    let fm = FileManager.iCloud();
    let data_path = fm.joinPath(fm.documentsDirectory(), "/Data/" + fileName);
    return JSON.parse(fm.readString(data_path));
}

function saveJSONToICloud(data, fileName)
{
    let fm = FileManager.iCloud();
    let data_path = fm.joinPath(fm.documentsDirectory(), "/Data/" + fileName);
    fm.writeString(data_path, JSON.stringify(data));
}

module.exports = {
    loadJSON: loadJSONFromICloud,
    saveJSON: saveJSONToICloud
};