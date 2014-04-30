var loc = location.href;
var baseurl = loc.substring(0,loc.lastIndexOf('/'));

function getManifest() {
  return {
    // currently required
    "name": "Clipper",
    "origin": baseurl,
    // icons from http://findicons.com/icon/158311/firefox?id=356182 by ipapun
    "iconURL": baseurl+"/clipper.png",
    "icon32URL": baseurl+"/clipper.png",
    "icon64URL": baseurl+"/clipper.png",
  
    // at least one of these must be defined
    "markURL": baseurl+"/status.htm",
    "markedIcon": baseurl+"/checked32.png",
    "unmarkedIcon": baseurl+"/unchecked32.png",
  
    // should be available for display purposes
    "description": "Clip rich data from the web and save it in your browser",
    "author": "Shane Caraveo, Mozilla",
    "homepageURL": "https://github.com/mixedpuppy/clipper/",
  
    // optional
    "version": 1
  }
}
