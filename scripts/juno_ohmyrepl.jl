using OhMyREPL, Crayons
import OhMyREPL: Passes.SyntaxHighlighter


"""
    setohmyrepl()

Uses Juno's syntax highlights within OhMyREPL.
"""
function setohmyrepl()

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
end


setohmyrepl()
