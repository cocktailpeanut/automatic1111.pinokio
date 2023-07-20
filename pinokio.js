const os = require('os')
const fs = require('fs')
const path = require("path")
const exists = (filepath) => {
  return new Promise(r=>fs.access(filepath, fs.constants.F_OK, e => r(!e)))
}
module.exports = {
  update: async (kernel) => {
    return "update.json"
  },
  start: async (kernel) => {
    let installed = await exists(path.resolve(__dirname, "automatic1111", "venv"))
    if (installed) {
      return "start.json"
    }
  },
  menu: async (kernel) => {
    let installed = await exists(path.resolve(__dirname, "automatic1111", "venv"))
    if (installed) {
      return [{
        html: "Installed",
        type: "label",
      }, {
        html: "<i class='fa-solid fa-plug'></i> Reinstall",
        type: "link",
        href: "install.json"
      }, {
        html: "<i class='fa-solid fa-terminal'></i> Terminal",
        href: "start.json",
      }, {
        html: "<i class='fa-solid fa-rocket'></i> Open Automatic1111",
        type: "link",
        href: "http://127.0.0.1:7860",
        target: "_blank"
      }, {
        html: '<i class="fa-solid fa-gear"></i> Configure',
        type: "link",
        href: (os.platform() === 'win32' ? "automatic1111/webui-user.bat#L6" : "automatic1111/webui-user.sh#L13")
      }]
    } else {
      return [{
        html: '<i class="fa-solid fa-plug"></i> Install',
        type: "link",
        href: "install.json"
      }]
    }
  }
}
