// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-gray; icon-glyph: reply;
// share-sheet-inputs: file-url, url, plain-text, image;
// Run from a share sheet to see which
// arguments are shared. Arguments are
// passed to a script when it is run
// from a share sheet.
// Configure the types of arguments
// a script supports from the script
// setttings. This script accepts all
// types of arguments and shows an alert
// with a summary of what ia being shared.
// This is useful to examine which
// values an app shares using the 
// share sheet.
let summary = args.plainTexts.length
  + " texts\n"
  + args.images.length
  + " images\n"
  + args.urls.length
  + " URLs\n"
  + args.fileURLs.length
  + " file URLs";
let alert = new Alert();
alert.title = "Shared";
alert.message = summary;
alert.addCancelAction("OK");
await alert.presentAlert();