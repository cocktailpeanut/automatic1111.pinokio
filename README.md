# Automatic1111

One-click installer and automation API for [AUTOMATIC1111/stable-diffusion-webui](https://github.com/AUTOMATIC1111/stable-diffusion-webui)

## Install

First time launching? Install first: [install](install.json)

## Customize Environment

### Windows

[Update COMMANDLINE_ARGS](automatic1111/webui-user.bat#L6)

### Mac

[Update COMMANDLINE_ARGS](automatic1111/webui-macos-env.sh#L13)


## Examples

1. [Single image generator](examples/single.json): Click "run" and it will generate an image and open it in a new window.
2. [Infinite image generator](examples/infinite.json): Click "run", and it will start generating images forever. Try customizing the prompt inside the script to run your own infinite image generator.
3. [Receive prompt and generate images](examples/input.json): Click "run", and it will ask you for a prmopt. When you enter the prompt it will generate an image for the prompt.

## Write your own script

You can do way more than what the example scripts do. Pinokio script is a turing complete scripting language, so you can run anything on your machine. Learn more here: https://docs.pinokio.computer/
