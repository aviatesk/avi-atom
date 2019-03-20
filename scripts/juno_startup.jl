###
# Juno startup code
###

### Set Juno-tuned color theme for Plots ###
module setmyjuno

using Juno
import Plots
import PlotThemes
import Statistics

function settheme()
    colors = Juno.syntaxcolors()
    colors = Dict(k => parse(Plots.Colorant, "#"*Plots.hex(colors[k], 6, false)) for (k, v) in colors)
    # add my customizes
    colors["orange"] = parse(Plots.Colorant, "#e9a285")
    colors["yellow"] = parse(Plots.Colorant, "#f0fb1c")
    colors["lime"] = parse(Plots.Colorant, "#92ec42")
    juno_palette = unique([color for (k, color) in colors if k ∉ ["background", "variable", "operator"]])

    colvec = sort(Plots.HSV.(juno_palette), lt=(a,b) -> a.h < b.h)
    filter!(c -> c.s > 0.5 * Statistics.mean(c -> c.s, colvec), colvec)
    grad = Vector{eltype(colvec)}(undef, 0)
    for i = 1:length(colvec)-1
        append!(grad, range(colvec[i], stop=colvec[i+1]))
    end

    myjuno = PlotThemes.PlotTheme(
        bg = colors["background"],
        bginside = colors["background"],
        fg = colors["variable"],
        fgtext = colors["variable"],
        fgguide = colors["variable"],
        fglegend = colors["variable"],
        palette = PlotThemes.expand_palette(colors["background"], juno_palette; lchoices = [57], cchoices = [100]),
        gradient = grad)

    PlotThemes.add_theme(:myjuno, myjuno)
    Plots.gr()
    Plots.theme(:myjuno)

end # settheme

end # module

setmyjuno.settheme()

