#=
Juno startup code
=#

"""
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

import Atom
using Juno: syntaxcolors


# @XXX: needs `@info` to initialize `ARGS` ...
# @TODO: fix Juno's code loading order
@info "Juno: Start setups ..."

# doesn't work on Windows
if !Sys.iswindows() && "JUNO_OHMYREPL" ∈ ARGS
    @info "Juno: Setting up OhMyREPL ..."
    include("junoohmyrepl.jl")
end

if "JUNO_PLOTS" ∈ ARGS
    @info "Juno: Setting up Plots ..."
    include("junoplots.jl")
end

# @HACK: overwriting these functions enables completions including local bindings while dubugging
isdefined(Main, :Atom) && @eval Atom.JunoDebugger begin
    import REPL.REPLCompletions: get_value, filtered_mod_names
    using REPL.REPLCompletions: appendmacro!, completes_global, ModuleCompletion

    # adapted from https://github.com/JuliaLang/julia/blob/master/stdlib/REPL/src/REPLCompletions.jl#L348
    # enables `MethodCompletion`, `PropertyCompletion`, `FieldCompletion` including local bindings
    function get_value(sym::Symbol, fn)
        # first look up local bindings
        isdebugging() && for var in locals(STATE.frame)
            sym === var.name && return var.value, true
        end
        return isdefined(fn, sym) ? (getfield(fn, sym), true) : (nothing, false)
    end

    @info "Juno: Overwrote `REPL.REPLCompletions.get_value(sym::Symbol, fn)`"

    # adapted from https://github.com/JuliaLang/julia/blob/master/stdlib/REPL/src/REPLCompletions.jl#L86-L95
    # enables `ModuleCompletion` for local bindings
    function filtered_mod_names(ffunc::Function, mod::Module, name::AbstractString, all::Bool = false, imported::Bool = false)
        ssyms = names(mod, all = all, imported = imported)
        filter!(ffunc, ssyms)
        syms = String[string(s) for s in ssyms]

        # inject local names for `ModuleCompletion`s
        if isdebugging()
            @>> map(v -> string(v.name), locals(STATE.frame)) append!(syms)
        end

        macros =  filter(x -> startswith(x, "@" * name), syms)
        appendmacro!(syms, macros, "_str", "\"")
        appendmacro!(syms, macros, "_cmd", "`")
        filter!(x->completes_global(x, name), syms)
        return [ModuleCompletion(mod, sym) for sym in syms]
    end

    @info "Juno: Overwrote `REPL.REPLCompletions.filtered_mod_names(ffunc::Function, mod::Module, name::AbstractString, all::Bool = false, imported::Bool = false)`"
end

end  # module AviJuno
