const parser = new DOMParser();

const httpRequest = new XMLHttpRequest();

var lastURL = "";

var relativePosition = "";

var currentElement = null;
var container = null;

var type = 0;

const regex = {
  match_item_url: /stats\/[^\/\d]*\/[^\/]*\/[^\/\d]*\/[^\/\d]*[\/]?\d*/i
}


httpRequest.onreadystatechange = (event) => {
  if (httpRequest.readyState == 4){
    let response = event.currentTarget.response;
    let parsedResponse = parser.parseFromString(response, 'text/html');

    let orders = parsedResponse.querySelectorAll('.media-list');
    let sellOrders = orders[0];
    let buyOrders = orders[1];
    container = document.createElement('div');

    let text = "";

    if (buyOrders){
      text=getFlashOrders(buyOrders);
    }
    else {
      text = "<i>No Buy Orders...</i>";
    }
    if (type==0){
      container.innerHTML = text;

      container.style = "position: fixed; z-index:9999; background: #FFFFFF; color: #222; border: 1px solid #DFDFDF; border-radius: 5px; top:"+relativePosition.y+"px; left:"+relativePosition.x+"px";
      document.body.appendChild(container);
      console.log(container)
    }
    else if (type==1) {
      //container.innerHTML = "<dt>Buy Orders</dt><dd>"+text+"</dt>";
      $(currentElement.parentNode.parentNode).find('dl')[0].innerHTML += "<dt>Buy Orders</dt><dd>"+text+"</dt>";
    }
  }
}

const getFlashOrders = (orderPanel) => {

  orders = [...orderPanel.querySelectorAll('.media.listing.deal')];
  
  let ret = "";

  orders.filter((order) => {
    return !!order.querySelector('.fa-flash');
  }).forEach((order) => (ret += retrieveOrderData(order)));

  return ret;
}

const retrieveOrderData = (order) => {
  let price = order.querySelector('span .item').getAttribute('data-listing_price'); // Get the price
  let name = order.querySelector('div .user-handle > a').getAttribute('data-name'); // Get the user
  return (`<div>${price} | <i>${name}</i></div>\n`);
}

$(document).bind('DOMSubtreeModified',()=>{
  $('ul.dropdown-menu.site-search-dropdown a').mouseenter(function() {
      if (regex.match_item_url.test(this.href)) {
        if (this.href != lastURL) {
          lastURL = this.href;
          type = 0;
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
          }
          
          let rect = this.getBoundingClientRect();

          relativePosition = {x:rect.x+rect.width,y:rect.y+rect.height};
          currentElement = this;

          httpRequest.open('GET', 'https://backpack.tf/' + regex.match_item_url.exec(this.href)[0]);
          httpRequest.send();
        }
      }
  });

  let popup = $('.popover.in #popover-additional-links a')[0];

  if (popup) {
      if (regex.match_item_url.test(popup.href)) {
        if (popup.href != lastURL) {
          lastURL = popup.href;
          type=1;
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
          }
          
          let rect = popup.getBoundingClientRect();

          relativePosition = {x:rect.x+rect.width,y:rect.y+rect.height};
          currentElement = popup;

          httpRequest.open('GET', 'https://backpack.tf/' + regex.match_item_url.exec(popup.href)[0]);
          httpRequest.send();
        }
      }
  }
}).click(() => {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
})