const os = require('os')
const fs = require('fs')
const path = require('path')
class Automatic1111 {
  async init(kernel) {
    let graphics = await kernel.system.graphics()
    this.platform = os.platform()
    this.vendor = graphics.controllers[0].vendor
  }
  async run(req, ondata, kernel) {
    let params = req.params
    ondata({ raw: `\n\rMaking a request...\r\n${JSON.stringify(params)}\n\r` })
    let url = "http://127.0.0.1:7860/sdapi/v1/txt2img"
    if (params.url) {
      url = params.url
      delete params.url
    }
    let response = await fetch(url, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    }).then((res) => {
      return res.json()
    })
    ondata({ raw: `Success!\n\r\n\r` })
    return response
  }
  async install(req, ondata, kernel) {
    await this.init(kernel)
    let script = this.installscript(req, kernel)
    let launched;
    for(let step of script.run) {
      await kernel.shell.run(step, { cwd: __dirname }, (stream) => {
        ondata(stream)
      })
    }
    if (this.platform === 'darwin') {
      let defaultArgs = "--skip-torch-cuda-test --upcast-sampling --no-half-vae --use-cpu interrogate --api"
      let text = await fs.promises.readFile(path.resolve(__dirname, "automatic1111", "webui-user.sh"), "utf8")
      let re = /^(#?)(export COMMANDLINE_ARGS=)(.+)$/m
      let newtext = text.replace(re, `$2"${defaultArgs}"`)
      await fs.promises.writeFile(path.resolve(__dirname, "automatic1111", "webui-user.sh"), newtext)
    } else if (this.platform === 'win32') {
      let defaultArgs = "--api"
      let text = await fs.promises.readFile(path.resolve(__dirname, "automatic1111", "webui-user.bat"), "utf8")
      let re = /^(set COMMANDLINE_ARGS=)(.*)$/m
      let newtext = text.replace(re, `$1"${defaultArgs}"`)
      await fs.promises.writeFile(path.resolve(__dirname, "automatic1111", "webui-user.bat"), newtext)
    } else {
      // linux
      let defaultArgs
      if (/amd/i.test(this.vendor)) {
        // lshqqytiger
        defaultArgs = "--precision full --no-half --api"
      } else {
        defaultArgs = "--api"
      }
      let text = await fs.promises.readFile(path.resolve(__dirname, "automatic1111", "webui-user.sh"), "utf8")
      let re = /^(#?)(export COMMANDLINE_ARGS=)(.+)$/m
      let newtext = text.replace(re, `$2"${defaultArgs}"`)
      await fs.promises.writeFile(path.resolve(__dirname, "automatic1111", "webui-user.sh"), newtext)
    }
    let r = await this.start(req, ondata, kernel)
    return r.response
  }
  async start(req, ondata, kernel) {
    await this.init(kernel)
    try {
      let runscript = await this.runscript(req, kernel)
      let r = await kernel.shell.run(runscript, { cwd: __dirname }, (stream) => {
        let test = /(http:\/\/127.0.0.1:[0-9]+)/.exec(stream.cleaned)
        if (test && test.length > 0) {
          kernel.shell.resolve(stream.id, test[1])
        }
        ondata(stream)
      })
      return r
    } catch(e) {
      console.log("E", e)
    }
  }
  async runscript (req, kernel) {
    let cmd = (this.platform === "win32" ?  "webui-user.bat" : "bash webui.sh -f")
    const instruction = {
      message: cmd,
      path: path.resolve(__dirname, "automatic1111"),
      env: {
        HF_HOME: "../huggingface"
      }
    }
    return instruction
  }
  installscript (req, kernel) {
    if (this.platform === "darwin") {
      return {
        run: [
          { message: "brew install cmake protobuf rust python@3.10 git wget", },
          { message: "git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui automatic1111", path: path.resolve(__dirname) },
        ]
      }
    } else {
      if (/amd/i.test(this.vendor)) {
        // amd processor
        if (this.platform === 'win32') {
          run: [
            { message: "git clone https://github.com/lshqqytiger/stable-diffusion-webui-directml.git automatic1111", path: __dirname }
          ]
        } else {
          run: [
            { message: "git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui automatic1111", path: __dirname },
          ]
        }
      } else {
        // normal
        return {
          run: [
            { message: "git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui automatic1111", path: __dirname },
          ]
        }
      }
    }
  }
}
module.exports = Automatic1111
