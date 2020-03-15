/** @babel */

import { Point, Range, CompositeDisposable } from 'atom'


// focus utlities
const workspaceCenter = atom.workspace.getCenter()
let lastCenterItem = workspaceCenter.getActivePaneItem()
let lastDock = atom.workspace.getRightDock()
let lastDockItem = lastDock.getActivePaneItem()
atom.workspace.onDidStopChangingActivePaneItem((item) => {
  const paneContainer = atom.workspace.paneContainerForItem(item)
  if (!paneContainer) return
  const location = paneContainer.getLocation()
  if (location === 'center') {
    lastCenterItem = item
  } else {
    lastDockItem = item
    lastDock = paneContainer
  }
})

atom.commands.add('atom-dock', 'avi-atom:focus-last-workspace-center-item', () => {
  const pane = workspaceCenter.paneForItem(lastCenterItem)
  if (pane) {
    pane.activate()
    pane.activateItem(lastCenterItem)
  }
})
atom.commands.add('atom-workspace', 'avi-atom:focus-last-dock-item', () => {
  const pane = lastDock.paneForItem(lastDockItem)
  if (pane) {
    pane.activate()
    pane.activateItem(lastDockItem)
  }
})


// edit utilities
function insertCommentAtEOL(character = '#') {
  const editor = atom.workspace.getActiveTextEditor()
  if (!editor) return
  // TODO: maybe handle multiple line selection ?
  editor.moveToEndOfLine()
  editor.insertText(` ${character} `)
}
atom.commands.add(
  "atom-text-editor[data-grammar='source julia'].emacs-plus:not([mini])",
  'avi-atom:insert-comment-at-EOL',
  () => {
    insertCommentAtEOL()
  }
)
atom.keymaps.add(
  'init.js',
  {
    "atom-text-editor[data-grammar='source julia'].emacs-plus:not([mini]),atom-text-editor[data-grammar='source weave md'].emacs-plus:not([mini])": {
      'alt-/': 'avi-atom:insert-comment-at-EOL'
    }
  },
  1,
)


// Hydrogen
const hydrogenKeybinds = {
  'ctrl-c ctrl-c': 'hydrogen:run',
  'ctrl-c ctrl-n': 'hydrogen:run-and-move-down',
  'ctrl-c ctrl-d': 'hydrogen:run-cell',
  'ctrl-c ctrl-b': 'hydrogen:run-cell-and-move-down',
  'ctrl-c ctrl-r': 'hydrogen:run-all',
  'ctrl-enter': 'hydrogen:run',
  'shift-enter': 'hydrogen:run-and-move-down',
  'alt-ctrl-enter': 'hydrogen:run-cell',
  'alt-shift-enter': 'hydrogen:run-cell-and-move-down',
  'ctrl-alt-shift-enter': 'hydrogen:run-all',
  'alt-i': 'hydrogen:toggle-inspector',
  'alt-k ctrl-s': 'hydrogen:start-local-kernel',
  'alt-k ctrl-c': 'hydrogen:interrupt-kernel',
  'alt-k ctrl-k': 'hydrogen:shutdown-kernel',
  'alt-k ctrl-r': 'hydrogen:restart-kernel',
  'ctrl-c space': 'hydrogen:clear-result',
  'ctrl-c ctrl-space': 'hydrogen:clear-results',
}
const hydrogenMarkKeybinds = {
  'ctrl-c ctrl-d': 'hydrogen:run',
  'ctrl-c ctrl-b': 'hydrogen:run-and-move-down',
  'alt-ctrl-enter': 'hydrogen:run',
  'alt-shift-enter': 'hydrogen:run-and-move-down',
}

// attatch Hydrogen keybinds to the current editor's scope
function attachHydrogenCommands() {
  const editor = atom.workspace.getActiveTextEditor()
  const cursor = editor.getLastCursor()
  const { scopes } = cursor.getScopeDescriptor()
  const scope = scopes[0] // should be like `source.js
  if (scope) {
    atom.keymaps.add('init.js', {
      [`atom-text-editor[data-grammar='${scope.replace('.', ' ')}'].emacs-plus:not([mini])`]: hydrogenKeybinds,
      [`atom-text-editor[data-grammar='${scope.replace('.', ' ')}'].emacs-plus.mark-mode:not([mini])`]: hydrogenMarkKeybinds,
    })
  } else {
    atom.notifications.add('Hydrogen', {
      descrition: 'Can\'t find any scope',
    })
  }
}
atom.commands.add('atom-text-editor', 'hydrogen:attach-commands-to-current-scope', () => {
  attachHydrogenCommands()
})


// Juno
atom.commands.add('atom-workspace', {
  // restart Julia Process
  'julia-client:restart-julia': () => {
    const element = atom.workspace.getElement()
    if (!element) return
    atom.commands.dispatch(element, 'julia-client:kill-julia')
    setTimeout(() => {
      atom.commands.dispatch(element, 'julia-client:start-julia')
    }, 1000)
  },
})


import InputView from './input-view'

// git-plus
atom.packages.onDidActivateInitialPackages(() => {
  const gitPlus = atom.packages.getActivePackage('git-plus')
  const inputView = new InputView()
  if (gitPlus) {
    const gp = gitPlus.mainModule.provideService()

    gp.registerCommand('atom-workspace', 'git-plus:set-upstream', () => {
      gp.getRepo()
        .then((repo) => {
          inputView.open(
            (urlText) => {
              gp.run(repo, `remote add -f -m upstream/master upstream ${urlText}`)
                .then(() => {
                  atom.notifications.addInfo('Git-Plus: Set-Upstream', {
                    description: `Setting up 'upstream' branch tracking ${urlText} ...`,
                  })
                })
            },
            'Enter the URL of the remote repository to be tracked as the upstream',
            'E.g.: https://github.com/aviatesk/avi-atom.git',
          )
        })
    })

    gp.registerCommand('atom-workspace', 'git-plus:set-branch-upstream', () => {
      gp.getRepo()
        .then((repo) => {
          const branch = repo.branch.replace('refs/heads/', '')
          inputView.open(
            (branchNameText) => {
              gp.run(repo, `branch --set-upstream-to upstream/${branchNameText}`)
                .then(() => {
                  atom.notifications.addInfo('Git-Plus: Set-Branch-Upstream', {
                    description: `Setting up local branch '${branch}' to track remeote branch 'upstream/${branchNameText}' ...`,
                  })
                })
            },
            `Enter the name of branch from 'upstream' to be tracked by local branch '${branch}'`,
            'E.g.: master',
            'master',
          )
        })
    })

    gp.registerCommand('atom-workspace', 'git-plus:push-to-origin', () => {
      gp.getRepo()
        .then((repo) => {
          const branch = repo.branch.replace('refs/heads/', '')
          gp.run(repo, `push origin ${branch}`)
            .then(() => {
              atom.notifications.addInfo('Git-Plus: Push-To-Origin', {
                description: `Pushing to remote branch origin/'${branch}' ...`,
              })
            })
        })
    })

    gp.registerCommand('atom-workspace', 'git-plus:force-push-to-origin', () => {
      gp.getRepo()
        .then((repo) => {
          const branch = repo.branch.replace('refs/heads/', '')
          gp.run(repo, `push --force origin ${branch}`)
            .then(() => {
              atom.notifications.addInfo('Git-Plus: Force-Push-To-Origin', {
                description: `Force-pushing to remote branch origin/'${branch}' ...`,
              })
            })
        })
    })

    gp.registerCommand('atom-workspace', 'git-plus:rebase-interactive', () => {
      gp.getRepo()
        .then((repo) => {
          inputView.open(
            (numberText) => {
              gp.run(repo, `rebase -i HEAD~${numberText}`)
                .then(() => {
                  atom.notifications.addInfo('Git-Plus: Rebase-Interactive', {
                    description: `Rebasing HEAD for previouse ${numberText} commits ...`,
                  })
                })
            },
            'Enter the number of commits to be rebased',
            'E.g.: 3',
          )
        })
    })

    gp.registerCommand('atom-workspace', 'git-plus:rebase-continue', () => {
      gp.getRepo()
        .then((repo) => {
          gp.run(repo, 'rebase --continue')
        })
    })

    gp.registerCommand('atom-workspace', 'git-plus:rebase-abort', () => {
      gp.getRepo()
        .then((repo) => {
          gp.run(repo, 'rebase --abort')
        })
    })
  }
})
