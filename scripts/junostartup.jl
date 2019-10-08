#=
Juno startup code
=#

"""
    AviJuno

Sets up Juno environment without polluting the `Main` namespace.
"""
module AviJuno

# @XXX: needs `@info` to initialize `ARGS` ...
# @TODO: fix Juno's code loading order
@info "Juno: Start setups ..."

# doesn't work on Windows
if !Sys.iswindows()
    @info "Juno: Setting up OhMyREPL ..."

    # use Juno's syntax highlights within OhMyREPL.
    @eval begin
        using Crayons: Crayon
        using OhMyREPL: Passes.SyntaxHighlighter, colorscheme!
        using Juno: syntaxcolors

        cs = SyntaxHighlighter.ColorScheme()
        colors = syntaxcolors()

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

        SyntaxHighlighter.add!("AviJuno", cs)
        colorscheme!("AviJuno")
    end
end

# @HACK: overwriting these functions enables completions including local bindings while dubugging
if isdefined(Main, :Atom)
    @eval using Atom: JunoDebugger

    @eval JunoDebugger begin
        import REPL.REPLCompletions: get_value, filtered_mod_names
        using REPL.REPLCompletions: appendmacro!,
                                    completes_global,
                                    ModuleCompletion

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
        function filtered_mod_names(
            ffunc::Function,
            mod::Module,
            name::AbstractString,
            all::Bool = false,
            imported::Bool = false,
        )
            ssyms = names(mod, all = all, imported = imported)
            filter!(ffunc, ssyms)
            syms = String[string(s) for s in ssyms]

           # inject local names for `ModuleCompletion`s
            if isdebugging()
                @>> map(v -> string(v.name), locals(STATE.frame)) append!(syms)
            end

            macros = filter(x -> startswith(x, "@" * name), syms)
            appendmacro!(syms, macros, "_str", "\"")
            appendmacro!(syms, macros, "_cmd", "`")
            filter!(x -> completes_global(x, name), syms)
            return [ModuleCompletion(mod, sym) for sym in syms]
        end

        @info "Juno: Overwrote `REPL.REPLCompletions.filtered_mod_names(ffunc::Function, mod::Module, name::AbstractString, all::Bool = false, imported::Bool = false)`"
    end
end

end  # module AviJuno
