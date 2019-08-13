import Plots: Colorant, hex, theme, backend, default
import PlotThemes: HSV, PlotTheme, expand_palette, add_theme
import Statistics: mean


@doc """
    setplottheme()

Creates a PlotTheme.jl's theme that matches well with [Ariake Dark Syntax](https://atom.io/themes/ariake-dark-syntax) and uses it as the default color theme
"""
function setplottheme()
    # Create Juno specific color theme
    colors = syntaxcolors()
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

    # Register the created color theme
    add_theme(:myjuno, myjuno)
    theme(:myjuno)
end

function setplotdefault()
    backend(:gr)
    default(
        fmt = :svg,
        size = (800, 500),
    )
end


setplottheme()
setplotdefault()
