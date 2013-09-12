# grunt-shell-cmd

> Cross-platform collection of command line utilities which can
> greatly simplify common administrative tasks.

## Overview

`grunt-shell-cmd` is a shell command which is executed from a commmand line
environment (e.g, Bash, PowerShell, etc.) and consists of a number of common
administritive commands.  This allows you to use the same set of commands across
multiple platforms without having to know the underlying platform-specific
details.  The only requirement in order to execute `grunt-shell-cmd` is you
*must* have Node.js already installed.

Also, you can string together a series of `grunt-shell-cmd` commands similar
to how you would pipe multiple commands using the `|` symbol.  The final result
of the commands is then displayed on the command line as a JSON-encoded string.

## The Basics

The *first* command specified in a string of commands follows this format:

```
grunt-shell-cmd cmd.name [arg1, ..., argN] [input]
```

Both the arguments and input to the command are _optional_ and the input,
if specified, is _always_ the last parameter to the command.  Also, the input
is akin to the `-` symbol and *must* be a single-quoted, JSON-encoded string.

Additional commands follow this format:

```
cmd.name [arg1, ..., argN]
```

The input to the additional commands is _automatically_ dervied based on the
results of the previous command.

Additionally, you *must* separate each additional command using the `_` symbol.
An example of where you would string together multiple commands is:

```
node-shell-cmd disks.all.list _ arr.first
```

You can string together as many commands using the `_` symbol as you would like
and you can also still use the `\` symbol to separate the commands on the
command line, so the previous example could also be written as:

```
node-shell-cmd \
    disks.all.list _ \
    arr.first
```

## Getting Command Help

Every command can be supplied with the `help` argument which will then display
information on what the command is and how it can be used.  For example, to
learn more about the `disks.all.list` command, you would do:
`node-shell-cmd disks.all.list help`.