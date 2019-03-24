atom.commands.add 'atom-text-editor',

  ## Git-Plus custom commands
  # For rebasing commits
  'git-plus:rebase-interactive': ->
    if gitPlus = atom.packages.getActivePackage('git-plus').mainModule.provideService()
      gitPlus.getRepo().then (repo) ->
        gitPlus.run repo, 'rebase -i HEAD~5'
  'git-plus:rebase-continue': ->
    if gitPlus = atom.packages.getActivePackage('git-plus').mainModule.provideService()
      gitPlus.getRepo().then (repo) ->
        gitPlus.run repo, 'rebase --continue'
  'git-plus:rebase-abort': ->
    if gitPlus = atom.packages.getActivePackage('git-plus').mainModule.provideService()
      gitPlus.getRepo().then (repo) ->
        gitPlus.run repo, 'rebase --abort'
