#=
Juno startup code
=#

module MyJuno

using Juno
using OhMyREPL, Crayons
using OhMyREPL: Passes.SyntaxHighlighter
using Plots: Colorant, hex, HSV, gr, theme, default
using PlotThemes: PlotTheme, expand_palette, add_theme
using Statistics: mean


"""
    setomrtheme()

Uses Juno's syntax highlights within OhMyREPL.
"""
function setomrtheme()
    cs = SyntaxHighlighter.ColorScheme()
    colors = Juno.syntaxcolors()

    SyntaxHighlighter.symbol!(cs, Crayon(foreground = colors["symbol"]))
    SyntaxHighlighter.comment!(cs, Crayon(foreground = colors["comment"]))
    SyntaxHighlighter.string!(cs, Crayon(foreground = colors["string"]))
    SyntaxHighlighter.call!(cs, Crayon(foreground = colors["funccall"]))
    SyntaxHighlighter.op!(cs, Crayon(foreground = colors["operator"]))
    SyntaxHighlighter.keyword!(cs, Crayon(foreground = colors["keyword"]))
    SyntaxHighlighter.text!(cs, Crayon(foreground = colors["variable"]))
    SyntaxHighlighter.macro!(cs, Crayon(foreground = colors["macro"]))
    SyntaxHighlighter.function_def!(cs, Crayon(foreground = colors["funcdef"]))
    SyntaxHighlighter.argdef!(cs, Crayon(foreground = colors["type"]))
    SyntaxHighlighter.number!(cs, Crayon(foreground = colors["number"]))

    SyntaxHighlighter.add!("Juno", cs)
    OhMyREPL.colorscheme!("Juno")
end  # function setomrtheme


"""
    setplottheme()

Creates a PlotTheme.jl's theme that matches UI of
[Ariake Dark Syntax](https://atom.io/themes/ariake-dark-syntax) and sets it to
Plots.jl's color theme.
"""
function setplottheme()
    colors = Juno.syntaxcolors()
    colors = Dict(k => parse(Colorant, "#"*hex(colors[k], 6, false)) for (k, v) in colors)
    # add my customizes
    colors["orange"] = parse(Colorant, "#e9a285")
    colors["yellow"] = parse(Colorant, "#f0fb1c")
    colors["lime"] = parse(Colorant, "#92ec42")
    juno_palette = unique([color for (k, color) in colors if k ∉ ["background", "variable", "operator"]])

    colvec = sort(HSV.(juno_palette), lt=(a,b) -> a.h < b.h)
    filter!(c -> c.s > 0.5 * mean(c -> c.s, colvec), colvec)
    grad = Vector{eltype(colvec)}(undef, 0)
    for i = 1:length(colvec)-1
        append!(grad, range(colvec[i], stop=colvec[i+1]))
    end

    myjuno = PlotTheme(
        bg = colors["background"],
        bginside = colors["background"],
        fg = colors["variable"],
        fgtext = colors["variable"],
        fgguide = colors["variable"],
        fglegend = colors["variable"],
        palette = expand_palette(colors["background"], juno_palette; lchoices = [57], cchoices = [100]),
        gradient = grad)

    add_theme(:myjuno, myjuno)
    gr()
    theme(:myjuno)
end  # function setplottheme


"""
    setplotdefault()

Sets Plots.jl's default options.
"""
function setplotdefault()
    default(:fmt, :svg)
    default(:size, (800, 500))
end  # function setplotdefault

end  # module SetMyJuno



#=
Enters module main below
=#

using Juno
using Weave


# MyJuno.setomrtheme()
MyJuno.setplottheme()
MyJuno.setplotdefault()
