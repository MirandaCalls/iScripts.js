// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: teal; icon-glyph: code;
let fm = FileManager.iCloud();
let dir = fm.documentsDirectory();

// Fetch all current scripts
let filePaths = allScripts(dir);

// Pick the folder that contains your repository
let dst_dir = fm.bookmarkedPath("iScripts.js");

// Remove all scripts in the repository. We'll replace them with the current ones.
removeScripts(dst_dir);
// Copy all current scripts into the repository.
for (filePath of filePaths) {
  copyFile(filePath, dst_dir);
}

function copyFile(srcFilePath, dstDir) {
  let fm = FileManager.iCloud();
  let filename = getFilename(filePath);
  let dstFilePath = fm.joinPath(dstDir, filename);
  fm.copy(srcFilePath, dstFilePath);
}

function removeScripts(dstDir) {
  let fm = FileManager.iCloud();
  let filePaths = allScripts(dstDir);
  for (filePath of filePaths) {
    fm.remove(filePath);
  }
}

function allScripts(dir) {
  let fm = FileManager.iCloud();
  let files = fm.listContents(dir);
  let filePaths = files.map(file => {
    return fm.joinPath(dir, file);
  });
  return filePaths.filter(isScript);
}

function isScript(filePath) {
  let fm = FileManager.iCloud();
  let uti = fm.getUTI(filePath);
  return uti == "com.netscape.javascript-source";
}

function getFilename(filePath) {
  let idx = filePath.lastIndexOf("/");
  return filePath.substring(idx + 1);
}