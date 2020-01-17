Keeps my :atom: customs


### Set ups

fonts:
- [Fira-Code](https://github.com/tonsky/FiraCode)
- [Myrica M](https://myrica.estable.jp/)
- [Source Han Code JP](https://github.com/adobe-fonts/source-han-code-jp/releases/tag/2.011R)

packages:
```bash {cmd}
apm install --packages-file my-packages.txt
```

links:
```bash {cmd}
rm ~/.mume/style.less
link ~/.atom/mpe-styles/style.less ~/.mume/style.less
```

```bash {cmd}
rm ~/.julia/config/startup.jl ~/.julia/config/junostartup.jl
link ~/.atom/scripts/startup.jl ~/.julia/config/startup.jl
link ~/.atom/scripts/junostartup.jl ~/.julia/config/junostartup.jl
```
