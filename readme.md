# grunt-shell-cmd

> Cross-platform collection of command line utilities which can
> greatly simplify common administrative tasks.

## Quickstart

1. [Install Node.js](http://nodejs.org/download/)
2. in-progress...

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
grunt-shell-cmd cmd.name [arg1 ... argN] [input]
```

Both the arguments and input to the command are _optional_ and the input,
if specified, is _always_ the last parameter to the command.  Also, the input
is akin to the `-` symbol and *must* be a single-quoted, JSON-encoded string.

Additional commands follow this format:

```
cmd.name [arg1 ... argN]
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

## Development

### Basic Structure of Commands

All commands follow this basic format:

```javascript
// dot separated unique name
// commands are organized based on a tree structure
// with the root of the tree starting on the left
cmds['cmd.name'] = {
    desc: 'Description of the command',
    // if the command requires input from either command line or a previous
    // command in order to operate correctly, then set this to true, otherwise
    // set to false
    requiresInput: true|false,
    // each property in this object is for a specific platform, which is
    // basically the type of OS grunt-shell-cmd is running inside of
    cmd: {
        // the "all" platform means you can execute the command regardless of
        // the platform and any additional platforms specified are ignored
        all: function(args, pipe, input, callback) {
            // if you need to execute an actual shell command, then you must
            // use the execCommand function
            execCommand('shell | command', function(stdout) {
                // process the results of stdout here
                
                // if you want a simple way to convert the output to an array
                // then do (with optional regular expression filters)
                nextCommand(pipe, stdoutToArray(stdout), callback);
                
                // regardless, you need to call the nextCommand function
                // and the input should be fully processed to allow the next
                // command to properly process the result, which typically
                // means converting it into either an array or object,
                // but you could also use booleans, strings, or numbers
                nextCommand(pipe, processedStdout, callback);
            });
            
            // otherwise, use regular JavaScript functions in order to execute
            // the "command" and then call the nextCommand function like so
            nextCommand(pipe, inputToNextCommand, callback);
        },
        // the "linux" platform encompasses all Linux-based OSs
        linux: function(args, pipe, input, callback) {
        },
        // the "windows" platform encompasses all Windows-based OSs
        windows: function(args, pipe, input, callback) {
        }
    }
};
```
