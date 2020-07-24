Keeps my :atom: customs


### Set ups

fonts:
- [Fira-Code](https://github.com/tonsky/FiraCode)
- [Myrica M](https://myrica.estable.jp/)
- [Source Han Code JP](https://github.com/adobe-fonts/source-han-code-jp/releases/tag/2.011R)

packages:
```zsh {cmd}
apm install --packages-file my-packages.txt
```

update packages:
```zsh {cmd}
apm list --installed --bare --dev=false >! ~/.atom/my-packages.txt
```

links:
```zsh {cmd}
rm ~/.mume/style.less
link ~/.atom/mpe-styles/style.less ~/.mume/style.less
```

```zsh {cmd}
rm ~/.julia/config/startup.jl ~/.julia/config/junostartup.jl
link ~/.atom/scripts/startup.jl ~/.julia/config/startup.jl
link ~/.atom/scripts/junostartup.jl ~/.julia/config/junostartup.jl
```
