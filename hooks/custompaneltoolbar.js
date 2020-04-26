/*
 * Custom toolbar for Web panels
 * Written by Tam710562
 */

window.gnoh = Object.assign(window.gnoh || {}, {
  generateUUID: function (ids) {
    let d = Date.now() + performance.now();
    let r;
    const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      }
    );

    if (Array.isArray(ids) && ids.includes(id)) {
      return this.generateUUID(ids);
    }
    return id;
  },
  createElement: function (tagName, attribute, parent, inner, options) {
    if (typeof tagName === "undefined") {
      return;
    }
    if (typeof options === "undefined") {
      options = {};
    }
    if (typeof options.isPrepend === "undefined") {
      options.isPrepend = false;
    }
    const el = document.createElement(tagName);
    if (!!attribute && typeof attribute === "object") {
      for (let key in attribute) {
        if (key === "text") {
          el.textContent = attribute[key];
        } else if (key === "html") {
          el.innerHTML = attribute[key];
        } else if (key === "style" && typeof attribute[key] === "object") {
          for (let css in attribute.style) {
            el.style[css] = attribute.style[css];
          }
        } else if (key === "events" && typeof attribute[key] === "object") {
          for (let event in attribute.events) {
            if (typeof attribute.events[event] === "function") {
              el.addEventListener(event, attribute.events[event]);
            }
          }
        } else if (typeof el[key] !== "undefined") {
          el[key] = attribute[key];
        } else {
          if (typeof attribute[key] === "object") {
            attribute[key] = JSON.stringify(attribute[key]);
          }
          el.setAttribute(key, attribute[key]);
        }
      }
    }
    if (!!inner) {
      if (!Array.isArray(inner)) {
        inner = [inner];
      }
      for (let i = 0; i < inner.length; i++) {
        if (inner[i].nodeName) {
          el.append(inner[i]);
        } else {
          el.append(this.createElementFromHTML(inner[i]));
        }
      }
    }
    if (typeof parent === "string") {
      parent = document.querySelector(parent);
    }
    if (!!parent) {
      if (options.isPrepend) {
        parent.prepend(el);
      } else {
        parent.append(el);
      }
    }
    return el;
  },
  timeOut: function (callback, conditon, timeout) {
    setTimeout(function wait() {
      let result;
      if (!conditon) {
        result = document.getElementById("browser");
      } else if (typeof conditon === "string") {
        result = document.querySelector(conditon);
      } else if (typeof conditon === "function") {
        result = conditon();
      } else {
        return;
      }
      if (result) {
        callback(result);
      } else {
        setTimeout(wait, timeout || 300);
      }
    }, timeout || 300);
  },
  getReactEventHandlersKey: function (element) {
    if (!this.reactEventHandlersKey) {
      if (!element) {
        element = document.getElementById("browser");
      } else if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element || element.ownerDocument !== document) {
        return;
      }
      this.reactEventHandlersKey = Object.keys(element).find(function (key) {
        return key.startsWith("__reactEventHandlers");
      });
    }
    return this.reactEventHandlersKey;
  },
  override: function (obj, functionName, callback, conditon, runbefore) {
    this._overrides = this._overrides || {};
    let subKey = "";
    try {
      if (obj.ownerDocument === document) {
        this._overrides._elements = this._overrides._elements || [];
        const element = this._overrides._elements.find(function (item) {
          return item.element === obj;
        });
        let id;
        if (element) {
          id = element.id;
        } else {
          id = this.generateUUID(
            this._overrides._elements.map(function (item) {
              return item.id;
            })
          );
          this._overrides._elements.push({
            element: obj,
            id: id,
          });
        }
        subKey = "_" + id;
      }
    } catch (e) {}
    const key = functionName + "_" + obj.constructor.name + subKey;
    if (!this._overrides[key]) {
      this._overrides[key] = [];
      obj[functionName] = (function (_super) {
        return function () {
          let result;
          let conditon = true;
          for (let i = 0; i < gnoh._overrides[key].length; i++) {
            conditon =
              conditon &&
              ((typeof gnoh._overrides[key][i].conditon !== "function" &&
                gnoh._overrides[key][i].conditon !== false) ||
                (typeof gnoh._overrides[key][i].conditon === "function" &&
                  !!gnoh._overrides[key][i].conditon.apply(this, arguments)));
            if (conditon === false) {
              break;
            }
            if (gnoh._overrides[key][i].runbefore === true) {
              gnoh._overrides[key][i].callback.apply(this, arguments);
            }
          }
          if (conditon) {
            result = _super.apply(this, arguments);
          }
          for (let i = 0; i < gnoh._overrides[key].length; i++) {
            if (gnoh._overrides[key][i].runbefore !== true) {
              gnoh._overrides[key][i].callback.apply(this, arguments);
            }
          }
          return result;
        };
      })(obj[functionName]);
    }

    this._overrides[key].push({
      callback: callback,
      conditon: conditon,
      runbefore: runbefore,
    });
    return key;
  },
});

(function () {
  "use strict";

  const langs = {
    newTab: chrome.i18n.getMessage("_79_pen_32_in_32__78_ew_32__84_ab0"),
    close: chrome.i18n.getMessage("_67_lose0"),
  };
  let key;
  let buttonDefaults = [];

  const buttons = [
    "reload",
    "back",
    "home",
    "forward",
    {
      name: langs.newTab,
      icon:
        '<svg viewBox="0 0 24 24" style="width: 18px; height: 18px; flex: 0 0 18px;"><path fill="currentColor" d="M14,3V5H17.59L7.76,14.83L9.17,16.24L19,6.41V10H21V3M19,19H5V5H12V3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V12H19V19Z" /></svg>',
      click: (webPanel, buttonActice) => {
        chrome.tabs.create({ url: webPanel.src });
      },
    },
    {
      name: langs.close,
      icon:
        '<svg viewBox="0 0 24 24" style="width: 18px; height: 18px; flex: 0 0 18px;"><path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg>',
      click: (webPanel, buttonActice) => {
        if (buttonActice) {
          buttonActice.click();
        }
      },
    },
  ];

  function getButtonDefaults(toolbar) {
    return Array.from(toolbar.querySelectorAll("button.button-toolbar")).map(
      (element) => {
        return {
          name: element[key].className.replace("button-toolbar ", ""),
          element: element.parentElement,
        };
      }
    );
  }

  function addButtonCustom(toolbar) {
    if (!toolbar.dataset.toolbarWebpanel) {
      toolbar.dataset.toolbarWebpanel = true;
      const ids = buttons.filter((b) => !!b.id).map((b) => b.id);

      buttons.forEach(function (button) {
        if (typeof button === "string") {
          const buttonDefault = buttonDefaults.find((b) => b.name === button);
          if (buttonDefault) {
            toolbar.append(buttonDefault.element);
          }
        } else {
          button.id = gnoh.generateUUID(ids);
          const buttonToolbarEl = gnoh.createElement(
            "div",
            {
              class: "button-toolbar",
            },
            toolbar
          );
          const buttonEl = gnoh.createElement(
            "button",
            {
              class: "button-toolbar custom",
              "data-id": button.id,
              title: button.name,
              html: button.icon,
              events: {
                click: function () {
                  const buttonActice = document.querySelector(
                    "button.panelbtn.active"
                  );
                  const webPanel = document.querySelector(
                    '.webpanel.visible webview[name="vivaldi-webpanel"]'
                  );
                  button.click(webPanel, buttonActice);
                },
              },
            },
            buttonToolbarEl
          );
        }
      });

      buttonDefaults = [];
    }
  }

  gnoh.timeOut(function (browser) {
    key = gnoh.getReactEventHandlersKey(browser);
    const toolbar = document.querySelector(
      ".webpanel-header .toolbar.toolbar-group"
    );
    if (toolbar) {
      buttonDefaults = getButtonDefaults(toolbar);
      addButtonCustom(toolbar);
    }
    gnoh.override(
      HTMLElement.prototype,
      "appendChild",
      function (element) {
        if (
          this[key] &&
          this[key].className &&
          element[key] &&
          element[key].className
        ) {
          if (
            this[key].className === "button-toolbar" &&
            element[key].className.indexOf("button-toolbar") > -1
          ) {
            buttonDefaults.push({
              name: element[key].className.replace("button-toolbar ", ""),
              element: this,
            });
          } else if (
            this[key].className === "webpanel-header" &&
            element[key].className.indexOf("toolbar toolbar-group") > -1
          ) {
            addButtonCustom(element);
          }
        }
      },
      function (element) {
        return !buttonDefaults.find((b) => b.element === element);
      }
    );
  });
})();
