var config = {
  "file": null,
  "data": null,
  "option": null,
  "reader": null,
  "input": {
    "element": {}
  },
  "select": {
    "element": null
  },
  "output": {
    "element": null
  },
  "resize": {
    "timeout": null
  },
  "preview": {
    "element": null
  },
  "console": {
    "element": null
  },
  "download": {
    "element": null
  },
  "vectorize": {
    "element": null
  },
  "fileio": {
    "element": null, 
    "parent": {
      "element": null
    }
  },
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "nohandler": function (e) {
    if (e.target.type !== "file") {
      e.preventDefault();
    }
  },
  "loadend": function (e) {
    config.data = e.target.result;
    config.fileio.parent.element.querySelector("span").setAttribute("class", "image");
    config.fileio.parent.element.querySelector("span").textContent = config.file.name;
    config.fileio.parent.element.style.backgroundImage = "url(" + config.data + ")";
    /*  */
    if (config.preview.element.checked) {
      window.setTimeout(function () {
        config.vectorize.element.click();
      }, 300);
    }
  },
  "handle": {
    "file": function (file) {
      if (file && file.type) {
        if (file.type.indexOf("image/") === -1) return;
        /*  */
        config.file = file;
        config.output.element.textContent = '';
        config.fileio.parent.element.removeAttribute("empty");
        config.download.element.removeAttribute("href");
        config.download.element.removeAttribute("title");
        config.download.element.removeAttribute("download");
        config.fileio.parent.element.querySelector("span").removeAttribute("class");
        config.reader.readAsDataURL(config.file);
      }
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          const current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      const context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?win") {
              config.port.name = "win";
            }
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp, function () {});
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id, function () {});
        }
      }
    }
  },
  "load": function () {
    const reload = document.getElementById("reload");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    /*  */
    config.reader = new FileReader();
    config.preview.element = document.getElementById("preview");
    config.console.element = document.getElementById("console");
    config.input.element.ltres = document.getElementById("ltres");
    config.input.element.qtres = document.getElementById("qtres");
    config.input.element.scale = document.getElementById("scale");
    config.download.element = document.getElementById("download");
    config.vectorize.element = document.getElementById("vectorize");
    config.fileio.parent.element = document.getElementById("fileio");
    config.fileio.element = document.querySelector("input[type='file']");
    config.output.element = document.getElementById("output").children[0];
    config.input.element.strokewidth = document.getElementById("strokewidth");
    config.select.element = document.getElementById("options").querySelector("select");
    /*  */
    config.output.element.textContent = "Preview";
    config.fileio.parent.element.setAttribute("empty", '');
    config.select.element.addEventListener("change", config.app.store, false);
    config.preview.element.addEventListener("change", config.app.store, false);
    config.vectorize.element.addEventListener("click", config.app.render, false);
    config.input.element.ltres.addEventListener("change", config.app.store, false);
    config.input.element.qtres.addEventListener("change", config.app.store, false);
    config.input.element.scale.addEventListener("change", config.app.store, false);
    config.input.element.strokewidth.addEventListener("change", config.app.store, false);
    config.fileio.element.addEventListener("change", function (e) {config.handle.file(e.target.files[0])}, false);
    config.reader.addEventListener ? config.reader.addEventListener("loadend", config.loadend, false) : config.reader.loadend = config.loadend;
    config.console.element.textContent = '>> Image Vectorizer is ready. \n>> Please drop an image in the above area (left side) to start rasterizing.';
    /*  */
    support.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        const url = config.addon.homepage();
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      if (config.port.name !== "webapp") {
        const url = config.addon.homepage() + "?reason=support";
        chrome.tabs.create({"url": url, "active": true});
      }
    }, false);
    /*  */
    config.storage.load(config.app.update);
    document.removeEventListener("load", config.load, false);
    reload.addEventListener("click", function () {document.location.reload()}, false);
  },
  "app": {
    "prefs": {
      set index (val) {config.storage.write("index", val)},
      set option (val) {config.storage.write("option", val)},
      set custom (val) {config.storage.write("custom", val)},
      set preview (val) {config.storage.write("preview", val)},
      get index () {return config.storage.read("index") !== undefined ? config.storage.read("index") : 0},
      get custom () {return config.storage.read("custom") !== undefined ? config.storage.read("custom") : {}},
      get preview () {return config.storage.read("preview") !== undefined ? config.storage.read("preview") : false},
      get option () {return config.storage.read("option") !== undefined ? config.storage.read("option") : "default"}
    },
    "update": function () {
      config.preview.element.checked = config.app.prefs.preview;
      config.select.element.selectedIndex = config.app.prefs.index;
      config.input.element.scale.value = "scale" in config.app.prefs.custom ? config.app.prefs.custom.scale : 30;
      config.input.element.ltres.value = "ltres" in config.app.prefs.custom ? config.app.prefs.custom.ltres : 0.1;
      config.input.element.qtres.value = "qtres" in config.app.prefs.custom ? config.app.prefs.custom.qtres : 1.0;
      config.input.element.strokewidth.value = "strokewidth" in config.app.prefs.custom ? config.app.prefs.custom.strokewidth : 5;
      /*  */
      config.input.element.ltres.disabled = config.app.prefs.index !== 1;
      config.input.element.qtres.disabled = config.app.prefs.index !== 1;
      config.input.element.scale.disabled = config.app.prefs.index !== 1;
      config.input.element.strokewidth.disabled = config.app.prefs.index !== 1;
      config.option = config.app.prefs.option === "custom" ? config.app.prefs.custom : config.app.prefs.option;
      /*  */
      const custom = document.querySelector(".custom");
      [...custom.querySelectorAll("label")].forEach(function (e) {
        e.style.opacity = config.app.prefs.index !== 1 ? "0.7" : "1.0";
        e.style.pointerEvents = config.app.prefs.index !== 1 ? "none" : "unset";
      });
    },
    "store": function () {
      const preview = config.preview.element.checked;
      const index = config.select.element.selectedIndex;
      const option = config.select.element[index].value;
      const custom = {
        "ltres": config.input.element.ltres.value,
        "qtres": config.input.element.qtres.value,
        "scale": config.input.element.scale.value,
        "strokewidth": config.input.element.strokewidth.value
      };
      /*  */
      config.option = option === "custom" ? custom : option;
      /*  */
      config.app.prefs.index = index;
      config.app.prefs.custom = custom;
      config.app.prefs.option = option;
      config.app.prefs.preview = preview;
      /*  */
      config.app.update();
      /*  */
      if (config.preview.element.checked) {
        config.vectorize.element.click();
      }
    },
    "render": function () {
      config.app.update();
      /*  */
      if (config.data && config.option) {
        config.output.element.textContent = '';
        config.console.element.textContent = ">> Image rasterizing in progress, please wait...";
        config.output.element.style.background = 'transparent url("resources/loader.gif") no-repeat center center';
        config.output.element.style.backgroundSize = "128px";
        /*  */
        if (ImageTracer) {
          ImageTracer.imageToSVG(config.data,	function (svg) {
            config.output.element.style.background = "none";
            config.console.element.textContent = ">> Image rasterizing is done! \n>> Please click on the download button to save the SVG file.";
            /*  */
            const img = document.createElement("img");
            img.src = "data:image/svg+xml;charset=utf-8," + svg;
            config.output.element.appendChild(img);
            /*  */
            const source = '<?xml version="1.0" encoding="UTF-8" standalone="no"?' + '>' + '\r\n' + svg;
            const href = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            /*  */
            config.download.element.href = href;
            config.download.element.download = "result.svg";
            config.download.element.title = "Click to download SVG file";
          }, config.option);
        } else {
          config.console.element.textContent = ">> Error! image-tracer API is not loaded!";
        }
      } else {
        config.console.element.textContent = ">> Please drop an image in the above field and then try again...";
      }
    }
  }
};

config.port.connect();

window.addEventListener("load", config.load, false);
window.addEventListener("drop", config.nohandler, false);
window.addEventListener("resize", config.resize.method, false);
window.addEventListener("dragover", function (e) {e.preventDefault()});
