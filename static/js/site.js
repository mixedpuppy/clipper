function parseUrl(url) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

function generateURL(URLTemplate, data) {
  // support for existing oexchange style endpoints by supporting their
  // querystring arguments. parse the query string template and do
  // replacements where necessary the query names may be different than ours,
  // so we could see u=%{url} or url=%{url}
  for (var k in data) {
    var r = new RegExp("%\{" + k + "\}", "g");
    console.log("replace %{" + k + "} with " + data[k]);
    URLTemplate = URLTemplate.replace(r, data[k]);
  }
  console.log(URLTemplate);
  return URLTemplate;
}

function getData(data) {
  var driver = getSiteDriver(data.siteName);
  if (!driver) {
    driver = getSiteDriver("default");
  }
  driver.getData(data);
}

/* this will eventually be an abstracton layer for site specific api use */
var drivers = {};

function getSiteDriver(site) {
  return drivers[site.toLocaleLowerCase()];
}

function getSiteData(data, callback) {
  var driver = getSiteDriver(data.siteName);
  if (driver) {
    driver.getItem(data, null, function(response) {
      if (response) {
        data.siteData = response;
        driver.getData(data);
      }
      callback(response);
    });
  } else {
    callback();
  }
}

function getPreviewsFromData(data) {
  var driver = getSiteDriver(data.siteName);
  if (!driver || !driver.getPreviewsFromData) {
    driver = getSiteDriver("default");
  }
  return driver.getPreviewsFromData(data);
}

drivers['ebay'] = {
  name: 'ebay',
  /* us-centric urls, need to figure out how to localize */
  cartURL: function(itemid) {
    return generateURL("https://cart.payments.ebay.com/sc/add?ssPageName=CART:ATC&item=iid:%{itemid},qty:1", { itemid: itemid });
  },
  buyURL: function(itemid) {
    return generateURL("https://checkout.payments.ebay.com/ws/eBayISAPI.dll?XOProcessor&TransactionId=-1&item=%{itemid}&quantity=1", { itemid: itemid });
  },
  makeOffer: function(itemid) {
    return generateURL("https://offer.ebay.com/ws/eBayISAPI.dll?MakeBestOffer&rev=1&itemId=%{itemid}", { itemid: itemid });
  },
  widget: function(itemid) {
    return generateURL('<object ><param name="movie" value="http://togo.ebay.com/togo/togo.swf?%{itemid}" /><param name="flashvars" value="base=http://togo.ebay.com/togo/&lang=en-us&mode=normal&itemid=%{itemid}&query=rx100" /><embed src="http://togo.ebay.com/togo/togo.swf?%{itemid}" type="application/x-shockwave-flash" width="100%" height="100%" flashvars="base=http://togo.ebay.com/togo/&lang=en-us&mode=normal&itemid=%{itemid}&query=rx100"></embed></object>', { itemid: itemid });
  },
  get __api() {
    delete this.__api;
    this.__api = new ebay({
      appId: 'ShaneCar-7869-45f2-8059-2a5872f07918',
      callback: function(response){
        console.info(response);   // callback function to receive responses of all calls made on this object
      }
    });
    return this.__api;
  },
  getItems: function(ids, props, callback) {
    console.log("getItems, "+ids);
    this.__api.getItems(ids, props, function(response) {
        callback(response);
    });
  },
  getItem: function(entry, props, callback) {
    var id = this.parseURL(entry.url);
    this.getItems([id], props, callback);
  },
  parseURL: function(productURL) {
    // get a product id from the url
    return productURL.split("/").pop();
  },
  getData: function(data) {
    if (data.siteData && data.siteData.Item) {
      var item = data.siteData.Item
      data.previews = item.PictureURL;
      data.image = item.PictureURL[0];
      data.name = item.Title;
      data.price = item.ConvertedCurrentPrice.Value + item.ConvertedCurrentPrice.CurrencyID;
      data.cartURL = this.cartURL(item.ItemID);
      data.buyURL = this.buyURL(item.ItemID);
      data.makeOffer = this.makeOffer(item.ItemID);
      data.widget = this.widget(item.ItemID);
    } else {
      drivers['default'].getData(data);
    }
  },
  getPreviewsFromData: function(shareData) {
    console.log("ebay preview data collector");
    var previews = {};
    if (shareData.siteData && shareData.siteData.Item) {
      for (var i in shareData.previews) {
        if (!shareData.previews[i])
          continue;
        var d = {
          name: shareData.title,
          url: shareData.url,
          price: shareData.price,
          image: shareData.previews[i],
        };
        previews[d.image] = d;
        console.log("image: "+d.image);
      }
      return previews;
    }
    return drivers['default'].getPreviewsFromData(shareData);
  }
};
drivers['www.ebay.com'] = drivers["ebay"];

drivers['default'] = {
  name: 'default',
  getData: function(data) {
    if (!data.microdata || !data.microdata.items.length)
      return;
    for (var i in data.microdata.items) {
      var item = data.microdata.items[i];
      var prop = item.properties;
      if (item.types.indexOf("http://schema.org/Product") >= 0) {
        if (prop.name) {
          data.name = prop.name;
        }
        if (prop.image) {
          data.image = prop.image;
        }
        if (prop.offers && prop.offers.length) {
          data.price = prop.offers[0].properties.price;
        }
      } else
      if (item.types.indexOf("http://data-vocabulary.org/Product") >= 0) {
        if (prop.name) {
          data.name = prop.name;
        }
        if (prop.image) {
          data.image = prop.image[0];
        }
        if (prop.offerDetails && prop.offerDetails.length) {
          data.price = prop.offerDetails[0].properties.price;
        }
      }
    }
  },
  _getMicrodataPreview: function(shareData) {
    var previews = {};
    if (!shareData.microdata || !shareData.microdata.items.length)
      return previews;
    for (var i in shareData.microdata.items) {
      var item = shareData.microdata.items[i];
      var properties = item.properties;
      var d = {
        url: shareData.url,
        data: item
      };
      if (item.types.indexOf("http://schema.org/Product") >= 0) {
        if (properties.name) {
          d.name = properties.name;
        }
        if (properties.image) {
          d.image = properties.image;
        }
        if (properties.offers && properties.offers.length) {
          d.price = properties.offers[0].properties.price;
        }
      } else
      if (item.types.indexOf("http://data-vocabulary.org/Product") >= 0) {
        if (properties.name) {
          d.name = properties.name;
        }
        if (properties.image) {
          d.image = properties.image;
        }
        if (properties.offerDetails && properties.offerDetails.length) {
          d.price = properties.offerDetails[0].properties.price;
        }
      }
      for (var img in properties.image) {
        d.image = properties.image[img]
        previews[d.image] = d;
        console.log("Microdata image: "+d.image);
      }
    }
    return previews;
  },
  _getTwitterPreview: function(shareData) {
    var previews = {};
    if (!shareData["twitter:image0"])
      return previews;
    for (var i = 0; i < 10; i++) {
      console.log(i);
      if (!shareData["twitter:image" + i])
        break;
      var d = {
        name: shareData["twitter:title"],
        description: shareData["twitter:description"],
        url: shareData.url,
        image: shareData["twitter:image" + i]
      };
      previews[d.image] = d;
      console.log("Twitter image: "+d.image);
    }
    return previews;
  },
  _getOpenGraphPreview: function(shareData) {
    var previews = {};
    if (shareData["og:image"]) {
      var d = {
        name: shareData.title,
        url: shareData.url,
        image: shareData["og:image"]
      };
      previews[d.image] = d;
      console.log("OG image: "+d.image);
    }
    return previews;
  },
  _getMetaPreview: function(shareData) {
    var previews = {};
    if (!shareData.previews || shareData.previews.length < 1)
      return previews;
    for (var i in shareData.previews) {
      if (!shareData.previews[i])
        continue;
      var d = {
        name: shareData.title,
        url: shareData.url,
        price: shareData.price,
        image: shareData.previews[i],
      };
      previews[d.image] = d;
      console.log("Meta tag image: "+d.image);
    }
    return previews;
  },
  getPreviewsFromData: function(shareData) {
    console.log("default preview data collector");
    var previews = {};
    $.extend(previews,
             this._getMicrodataPreview(shareData),
             this._getTwitterPreview(shareData),
             this._getOpenGraphPreview(shareData),
             this._getMetaPreview(shareData));
    return previews;
  }
}