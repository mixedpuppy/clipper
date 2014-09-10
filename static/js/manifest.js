var loc = location.href;
var baseurl = loc.substring(0,loc.lastIndexOf('/'));

function getManifest() {
  return {
    // currently required
    "name": "Clipper",
    "origin": baseurl,
    // icons from http://findicons.com/icon/158311/firefox?id=356182 by ipapun
    "iconURL": baseurl+"/images/clipper.png",
    "icon32URL": baseurl+"/images/clipper.png",
    "icon64URL": baseurl+"/images/clipper.png",
  
    // at least one of these must be defined
    "markURL": baseurl+"/status.htm",
    "markedIcon": baseurl+"/images/checked32.png",
    "unmarkedIcon": baseurl+"/images/unchecked32.png",
  
    // should be available for display purposes
    "description": "Clip rich data from the web and save it in your browser",
    "author": "Shane Caraveo, Mozilla",
    "homepageURL": "https://mixedpuppy.github.com/clipper/",
  
    // optional
    "version": 1
  }
}
