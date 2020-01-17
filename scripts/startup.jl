#=
@TODO: tree-view logging
=#


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
    try
        @eval using REPL
        if !isdefined(repl, :interface)
            repl.interface = REPL.setup_interface(repl)
        end
    catch err
        @error err
    end

    @info "Importing OhMyREPL ..."
    @err @eval begin
        using OhMyREPL
        enable_autocomplete_brackets(true)
    end

    # # I don't like Revise in Juno
    # isdefined(Main, :Juno) || begin
    #     @info "Importing Revise ..."
    #     @err begin
    #         @eval using Revise
    #         @async Revise.wait_steal_repl_backend()
    #     end
    # end

    # load Juno specific scripts if appropriate
    isdefined(Main, :Juno) && begin
        @err @eval OhMyREPL.input_prompt!("jυλια>") # unicodes are beautifully rendered within xterm
        @err include(joinpath(@__DIR__, "junostartup.jl"))
    end

    if "PLOTS" in Base.ARGS
        @info "Importing Plots ..."
        @err @eval using Plots
    end

    if "WEAVE" in Base.ARGS
        @info "Importing Weave ..."
        @err @eval using Weave
    end

    # when in developing Julia itself
    if "JULIA_DEV" in Base.ARGS
        @err begin
            @eval using Suppressor
            @eval @suppress @eval Base DATAROOTDIR = "..\\..\\.."
            @info "Overwrote `Base.DATAROOTDIR`"
        end

        @err begin
            @eval Base begin
                mutable struct MethodList
                    ms::Array{Method,1}
                    mt::Core.MethodTable
                    MethodList(ms::Array{Method,1}, mt::Core.MethodTable) = begin
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
            @info "Overwrote `Base.MethodList`"
        end
    end
end
