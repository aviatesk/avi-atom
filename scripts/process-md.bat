@echo off
set FILE=%1
set EXT=%~x1

if %EXT%==.pmd (
    echo [pweave]: Generating Markdown output ...
    pweave -f markdown %FILE%
) else if %EXT%==.Pmd (
    echo [pweave]: Generating Markdown output ...
    pweave -f markdown %FILE%
) else if %EXT%==.Rmd (
    echo [R-markdown]: Generating HTML output ...
    R -e "rmarkdown::render('%FILE:\=/%', encoding='UTF-8')"
) else if %EXT%==.rmd (
    echo [R-markdown]: Generating HTML output ...
    R -e "rmarkdown::render('%FILE:\=/%', encoding='UTF-8')"
) else (
    echo Invalid file type: %EXT%
    echo Execute with .pmd or .Rmd file.
)
