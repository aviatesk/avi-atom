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

@static if occursin("atom-julia-client/script/boot_repl.jl", PROGRAM_FILE)
    setup_juno() = @err include(joinpath(@__DIR__, "junostartup.jl"))
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
        OhMyREPL.input_prompt!("jυλια> ")
    end

    # load Juno specific scripts if appropriate
    @isdefined(Juno) && setup_juno()

    # HACK: use actual source file for method location information when using julia built from source
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
