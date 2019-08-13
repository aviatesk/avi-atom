#=
@TODO: tree-view logging
=#


ENV["JULIA_PKG_DEVDIR"] = joinpath(homedir(), "julia", "packages")


atreplinit() do repl
    try
        @info "Importing OhMyREPL ..."
        @eval using REPL

        if !isdefined(repl, :interface)
            repl.interface = REPL.setup_interface(repl)
        end

        # @TODO: This insert new lines every time the REPL has change.
        #        Seemingly needs change in julia/stdlib/REPL
        # repl.interface.modes[1].prompt = "$(pwd())\njulia> "

        @eval using OhMyREPL
    catch err
        @error err
    end

    # Don't use Revise within Juno
    isdefined(Main, :Juno) || begin
        @info "Importing Revise ..."
        try
            @eval using Revise
            @async Revise.wait_steal_repl_backend()
        catch err
            @error err
        end
    end

    # Load Juno specific scripts when in Juno
    isdefined(Main, :Juno) && begin
        joinpath(@__DIR__, "junostartup.jl") |> include
    end

    if "PLOTS" ∈ ARGS
        try
            @info "Importing Plots ..."
            @eval using Plots
        catch err
            @error err
        end
    end

    if "WEAVE" ∈ ARGS
        try
            @info "Importing Weave ..."
            @eval using Weave
        catch err
            @error err
        end
    end
end
