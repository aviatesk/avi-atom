ENV["JULIA_PKG_DEVDIR"] = joinpath(homedir(), "julia", "packages")

macro err(ex)
    return quote
        try
            Core.eval($(__module__), $(ex))
        catch err
            @error err
        end
    end |> esc
end

atreplinit() do repl
    @err begin
        @eval using REPL
        isdefined(repl, :interface) || (repl.interface = REPL.setup_interface(repl))
    end

    @info "Loading OhMyREPL ..."
    @err @eval begin
        using OhMyREPL
        enable_autocomplete_brackets(true)
        OhMyREPL.input_prompt!("jυλια>")
    end

    # load Juno specific scripts if appropriate
    isdefined(Main, :Juno) && @err include(joinpath(@__DIR__, "junostartup.jl"))

    # HACK:use actual source file as method location information when developing julia
    if occursin("DEV", string(VERSION))
        @info "Overwriting `Base.DATAROOTDIR` and `Base.MethodList` ..."

        @err begin
            @eval Base DATAROOTDIR = joinpath("..", "..", "..")
        end

        @err begin
            @eval Base begin
                mutable struct MethodList
                    ms::Array{Method,1}
                    mt::Core.MethodTable
                    function MethodList(ms::Array{Method,1}, mt::Core.MethodTable)
                        map(ms) do m
                            originalpath = string(m.file)
                            m.file = try
                                realpath(originalpath)
                            catch err
                                originalpath
                            end |> Symbol
                        end
                        new(ms, mt)
                    end
                end
            end
        end
    end
end
