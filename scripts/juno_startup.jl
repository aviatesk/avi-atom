#=
Juno startup code
=#

@doc """
    AviJuno

Sets up Juno environment **without polluting the `Main` namespace**.
Each setting is *conditionally* activated by `ARGS`, which would be passed as the values of `"julia-client".juliaOptions.arguments` defined in [~/.atom/config.cson](~/.atom/config.cson).
This setting can be set per-project with the Atom package [atomic-management](https://atom.io/packages/atomic-management).

Possible value of an argument in `ARGS`:
- `"JUNO_OHMYREPL"`: Creates and sets up the new [OhMyREPL.jl](https://github.com/KristofferC/OhMyREPL.jl) style that matches Juno syntax highlights.
- `"JUNO_PLOTS"`:
    * Create and sets up the [PlotThemes.jl](https://github.com/JuliaPlots/PlotThemes.jl) style that matches Atom UI and Juno syntax highlights.
    * Sets backend and default plot attributions for [Plots.jl](https://github.com/JuliaPlots/Plots.jl)
"""
module AviJuno

using Juno


# These conditional activation will be triggered by the values of
# `julia-client.juliaOptions.arguments`, defined in .atom/config.cson files
for arg in ARGS
    # # Doesn't work on Windows
    # if arg === "JUNO_OHMYREPL"
    #     @time begin
    #         @info "Juno: Setting up OhMyREPL.jl ..."
    #         include("juno_ohmyrepl.jl")
    #     end
    # end

    if arg === "JUNO_PLOTS"
        @time begin
            @info "Juno: Setting up Plots.jl ..."
            include("juno_plots.jl")
        end
    end
end

end  # module AviJuno



#=
Enters module main below
=#

@info "Juno: Importing Juno.jl and Weave.jl ..."
using Juno
using Weave
