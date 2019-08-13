#=
Juno startup code
=#

@doc """
    AviJuno

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

using Juno


@info "Juno: Given arguments: $(ARGS)"

# # Doesn't work on Windows
# if "JUNO_OHMYREPL" ∈ ARGS
#     try
#         @info "Juno: Setting up OhMyREPL.jl ..."
#         include("junoohmyrepl")
#     catch err
#         @error err
#     end
# end

if "JUNO_OHMYREPL" ∈ ARGS
    try
        @info "Juno: Setting up Plots.jl ..."
        include("junoplots.jl")
    catch err
        @error err
    end
end

end  # module AviJuno


#=
Enters module main below
=#

if "JUNO_OHMYREPL" ∈ ARGS
    try
        @info "Importing Plots.jl ..."
        @eval using Plots
    catch err
        @error err
    end
end

if "WEAVE" ∈ ARGS
    try
        @info "Importing Weave.jl ..."
        @eval using Weave
    catch err
        @error err
    end
end
