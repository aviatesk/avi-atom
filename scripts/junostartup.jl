#=
Juno startup code
=#

@doc """
Sets up Juno environment **without polluting the `Main` namespace**.
Each setting is *conditionally* activated by `ARGS`, which would be passed as
the values of `"julia-client".juliaOptions.arguments` defined in
[~/.atom/config.cson](~/.atom/config.cson).
This setting can be set per-project with the Atom package
[atomic-management](https://atom.io/packages/atomic-management).

Possible value of an argument in `ARGS`:
- `"JUNO_OHMYREPL"`: Creates and sets up the new
  [OhMyREPL.jl](https://github.com/KristofferC/OhMyREPL.jl) style that matches
  Juno syntax highlights.
- `"JUNO_PLOTS"`:
    * Create and sets up the
      [PlotThemes.jl](https://github.com/JuliaPlots/PlotThemes.jl) style that
      matches Atom UI and Juno syntax highlights.
    * Sets backend and default plot attributions for
      [Plots.jl](https://github.com/JuliaPlots/Plots.jl)
"""
module AviJuno

import Juno: syntaxcolors


# @XXX: Needs `@info` to initialize `ARGS` ...
# @TODO: Fix Juno's code loading order
@info "Juno: Start setups ..."

# Doesn't work on Windows
if !Sys.iswindows() && "JUNO_OHMYREPL" ∈ ARGS
    @info "Juno: Setting up OhMyREPL ..."
    include("junoohmyrepl.jl")
end

if "JUNO_PLOTS" ∈ ARGS
    @info "Juno: Setting up Plots ..."
    include("junoplots.jl")
end

end  # module AviJuno
