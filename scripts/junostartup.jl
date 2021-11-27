#=
Juno startup code
=#

@eval Juno begin
    # use Juno's syntax highlights within OhMyREPL.
    function setup_juno()
        @static Sys.iswindows() && return # doesn't work on Windows
        @info "Tuning Juno terminal theme ..."
        @eval Module() begin
            using OhMyREPL: Passes.SyntaxHighlighter, colorscheme!, Crayons.Crayon
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

    setup_juno()
end
@eval Main import Juno: setup_juno
