  
  
  
# Atom customs - aviatesk
  
  
Let me show off my Atom customs a bit and explain how to restore them.
  
  
## TOC
  
  
  
  
  
* [Overview](#overview )
* [Main features](#main-features )
* [Set-ups](#set-ups )
	* [Get requirements](#get-requirements )
	* [Re-install packages](#re-install-packages )
	* [Modify paths](#modify-paths )
	* [Make Git globally ignore .atom/config.cson files](#make-git-globally-ignore-atomconfigcson-files )
	* [Set global MPE style](#set-global-mpe-style )
	* [Fix a bug within Atom-IDE-Debugger-Python](#fix-a-bug-within-atom-ide-debugger-python )
	* [Set-up Juno](#set-up-juno )
* [Author](#author )
  
  
  
  
  
## Overview
  
  
![overview](./assets/overview.png )
  
  
## Main features
  
  
- Fine-tuned UI design based on [Ariake Dark Syntax][Ariake], with the inspiration by [四季花鳥図屏風][Shiki], 雪舟
- Emacs-like keybindings (based on [emacs-plus][emacs-plus], but a lot more tuned according to my preferences)
- Interactive and integrated coding environment for Python & Julia powered by [Hydrogen], [Atom-IDE] and [Juno]
- Strong support for writing markdown document with [Markdown-Writer] and [Markdown-Preview-Enhanced]
- Combining the two of the above, even support for writing [R-markdown] & [pweave-document][pweave]
- (*Atomically*-naturally) Powerful Git support environments !
  
  
[Ariake]: https://atom.io/themes/ariake-dark-syntax
[Shiki]: https://artsandculture.google.com/asset/%E5%9B%9B%E5%AD%A3%E8%8A%B1%E9%B3%A5%E5%9B%B3%E5%B1%8F%E9%A2%A8/1gHXp2NQApzNHg?hl=en
[emacs-plus]: https://atom.io/packages/emacs-plus
[Hydrogen]: https://atom.io/packages/hydrogen
[Atom-IDE]: https://ide.atom.io/
[Juno]: http://junolab.org/
[Markdown-Writer]: https://atom.io/packages/markdown-writer
[Markdown-Preview-Enhanced]: https://shd101wyy.github.io/markdown-preview-enhanced/#/
[pweave]: http://mpastell.com/pweave/
[R-markdown]: https://rmarkdown.rstudio.com/
  
  
  
## Set-ups
  
  
*Note that the settings here are only configured to work on Windows10 for now.*
  
  
### Get requirements
  
  
Each link below leads to its installation instruction.
  
- Git
    * Windows: [Git-bash](https://sp18.datastructur.es/materials/lab/lab1setup/windows.html#b-everything-else )
- Python
    * Python 3
    * [Python-Language-Server]
    * At least either of [yapf] or [autopep8]
    * [pweave](http://mpastell.com/pweave/#install-and-quickstart )
- Julia
    * [Julia 1.0](https://julialang.org/downloads/ )
- R
    * [R](https://cran.r-project.org/bin/windows/base/ )
    * [formatR](https://yihui.name/formatr/#1-installation )
    * [R-markdown](https://rmarkdown.rstudio.com/lesson-1.html#installation )
- [Fira-Code font](https://github.com/tonsky/FiraCode )
  
[Python-Language-Server]: https://github.com/palantir/python-language-server#installation
[yapf]: https://github.com/google/yapf#installation
[autopep8]: https://github.com/hhatto/autopep8#installation
[R-Language-Server]: https://github.com/REditorSupport/languageserver
[formatR]: (https://yihui.name/formatr/#1-installation)
  
  
### Re-install packages
  
  
Restore my favorite packages that are written in [my-packages.txt](./my-pacakge.txt ):
  
```bash
apm install --packages-file my-packages.txt
```
  
  
### Modify paths
  
  
Files below contain absolute (Windows-format) paths to files that are used along with my settings. They should be modified according to your environment.
  
- [config.cson](./config.cson )
    * `*.ide-python.python`: Path to executable Python (with [Python-Language-Server] & [yapf] installed)
    * `*.termination`:
        + `core.shell`: Path to executable bash shell
        + `customTexts.customText1`: Path to ~/.atom/my-packages.txt
        + `customTexts.customText2`: Path to ~/.atom/scripts/process-md.sh
        + `customTexts.customText3`: Path to ~/.atom/scripts/process-md.bat
- [global-shell-commands.cson](./global-shell-commands.cson )
    * `zen-style`, `shiki-style`: Path to ~/.atom/
    * `create-project-config`: Path to ~/.atom/
    * `process-md`, `process-md-remain`: Path to ~/.atom/scripts/process-md.bat
        + (In macOS or Linux, replacing it with the path to ~/.atom/scripts/process-md.sh should work instead)
- [snippets.cson](./snippets.cson )
    * `'.text.md': 'MPE: Numbering sections from H1'`: Path to ~/.atom/mpe-styles/numbering-from-h1.less
    * `'.text.md': 'MPE: Numbering sections from H2'`: Path to ~/.atom/mpe-styles/numbering-from-h2.less
    * `'.text.md': 'MPE: 'Fancy One-Dark Theme'`: Path to ~/.atom/mpe-styles/fancy-one-dark.less
- styles.less (***on `shiki-style` branch***)
    * Path to ~/.atom/assets/shikikacho-zubyobu-v1.jpg
  
  
### Make Git globally ignore .atom/config.cson files
  
  
[Atomic-Management] enables us to use *per-project* config settings for Atom by creating .atom/config.cson files in each project's root directory. But usually we want such a kind of file to be ignored by Git.
  
You can make Git ignore .atom/config.cson files globally except ~/.atom/config.cson by following steps:
1. `git config --global core.excludesfile ~/.gitignore_global`
2. Open or create [~/.gitignore_global](../.gitignore_global )
3. Add the lines below
> .gitignore_global
```plain
# Ignore Atom per-project config settings except the root config setting
!~/.atom
!~/.atom/*
.atom/
.atom/*
```
  
  
[Atomic-Management]: https://github.com/harmsk/atomic-management
  
  
### Set global MPE style
  
  
I tuned [mpe-styles/style.less] sheet so that within Markdown-Preview-Enhanced, we can do:
- Preview markdown documents in GFM style
- Fancy (& robust) font rendering
- Render HTML with TOC's sidebar bottom on left-above
  
We can enable the settings above globally by linking mpe-styles/style.less to ~/.mume/style.less (gonna create an hard link):
  
> Command Prompt (Windows) - **At Home Directory**
```cmd
mklink /H .atom\mpe-styles\style.less .mume\style.less
```
  
> Bash (macOS, Linux)
```bash
link ~/.atom/mpe-styles/style.less ~/.mume/style.less
```
  
(Other .less style sheets in [mpe-styles directory](./mpe-styles ) can be accessed via snippets, thus we don't need to link them to somewhere else.)
  
[mpe-styles/style.less]: mpe-styles/style.less
  
  
### Fix a bug within Atom-IDE-Debugger-Python
  
  
[Atom-IDE-Debugger-Python], Python debugger working with Atom-IDE, contains the bug of sending annoying duplicated launch responses, just by default installation: [issue]
  
I modified the default released Main.js according to the commit [90629e] and saved it as [assets/Main.js][Main.js-modified]. The command below should get rid of the bug:
  
> Bash
```bash
cp ~/.atom/assets/Main.js ~/.atom/packages/atom-ide-debugger-python/node_modules/atom-ide-debugger-python/VendorLib/vs-py-debugger/out/client/debugger/Main.js
```
  
[Atom-IDE-Debugger-Python]: https://github.com/facebookarchive/atom-ide-debugger-python
[issue]: https://github.com/facebookarchive/atom-ide-debugger-python/issues/7
[Main.js-modified]: assets/Main.js
[90629e]: https://github.com/facebookarchive/nuclide/commit/90629ee9fded9fb1f8dc761b827bfddbb19aeeb1
  
  
### Set-up Juno
  
  
#### Install Juno pacakge
  
  
> Julia REPL
  
```julia
using Pkg
Pkg.add("Juno")
```
  
#### Juno starting up config
  
  
> Command Prompt (Windows) - **At Home Directory**
```cmd
mklink /H .atom\scripts\juno_startup.jl .julia\config\juno_startup.jl
```
  
> Bash (macOS, Linux)
```bash
link ~/.atom/scripts/juno_startup.jl ~/.julia/config/juno_startup.jl
```
  
  
  
## Author
  
  
- **KADOWAKI, Shuhei** - *Undergraduate@Kyoto Univ.* - [aviatesk]
  
[aviatesk]: https://github.com/aviatesk
  
  
  
  
  
  