#!/bin/bash

FILE="$1"
EXT="${FILE##*.}"

if [ "$EXT" == "pmd" ]; then
    echo [pweave]: Generating Markdown output ...
    pweave -f markdown $FILE
elif [ "$EXT" == "Pmd" ]; then
    echo [pweave]: Generating Markdown output ...
    pweave -f markdown $FILE
elif [ "$EXT" == "Rmd" ]; then
    echo [R-markdown]: Generating HTML output ...
    R -e "rmarkdown::render('$FILE', encoding='UTF-8')"
elif [ "$EXT" == "rmd" ]; then
    echo [R-markdown]: Generating HTML output ...
    R -e "rmarkdown::render('$FILE', encoding='UTF-8')"
else
    echo Invalid file type: %EXT%
    echo Execute with .pmd or .Rmd file.
fi
