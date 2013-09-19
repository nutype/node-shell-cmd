# grunt-shell-cmd

> Cross-platform collection of command line utilities which can
> greatly simplify common administrative tasks.

## Status

Currently *unstable* and undergoing heavy initial development. Do *not* use this in an actual production environment at this point in time, but feel free to download and test.  The underlying command design structure is also undergoing constant refinement.

## Quickstart

If you want to simply use the command line utility:

1. [Install Node.js](http://nodejs.org/download/).  If you're using Linux, you should be able to install Node.js using a package manager like `yum` or `aptitude`, but just make sure it's at least version 0.8.0
2. Download a copy of the binary [here](https://github.com/nutype/node-shell-cmd/tree/master/bin/node-shell-cmd)
3. Place the binary in your `PATH`, such as `/usr/sbin`.  If you're using Windows, then you have two options:
    * Install [Cygwin](http://www.cygwin.com/install.html) and copy the binary into the appropriate Cygwin `/usr/sbin` directory
    * Make sure the `node` command is in your `PATH` environment variable (this should be handled for you automatically by the Node.js installer), navigate to the directory which contains the `node-shell-cmd` binary and do: `node node-shell-cmd`
4. If you're using Linux, you need to have the following binaries in your `PATH`:
    * ...todo...
        
If you want to use the Node.js module:

1. Details to come...

## Overview

`grunt-shell-cmd` is both a shell command which is executed from a commmand line environment (e.g, Bash, PowerShell, etc.) and a Node.js module library which you can directly interact with in your Node.js code in an asynchronous manner.  It consists of a number of common, cross-platform administritive commands which allows you to use the same set of commands across multiple platforms without having to know the underlying platform-specific details.

The primary design goals of the commands exposed by `grunt-shell-cmd` are:

* Simplicity
* Aggregation of useful data
* Straightforward piping of processed data

The only requirement in order to execute the `grunt-shell-cmd` command line utility is you *must* have Node.js already installed and in your _PATH_.  Also, you can string together a series of `grunt-shell-cmd` commands from the command line similar to how you would pipe multiple commands using the `|` symbol (you actually use `_` instead).  The final result of the commands is then displayed on the command line as a JSON-encoded string.

## The Basics

The commands are all indentified by a unique _dotted command name_, such as `disks.all.list`.  This name is the same for both the command line utility and the Node.js module, but they are accessed in different ways.  From the command line, you simply provide the name as an argument (more details to follow shortly), and from the Node.js module, you use the exported `callCmd` function which takes the following arguments: `cmdName, args, input, callback`.

## Using The Command Line Utility

### First Command

The *first* command specified in a string of commands follows this format:

```
grunt-shell-cmd cmd.name 'JSON-encoded arguments' 'JSON-encoded input'
```

Both the arguments and input to the command are _generally optional_, but may be required depending on the command, and the input, if specified, is _always_ the last parameter to the command.  Also, the input is akin to the `-` symbol and *must* be a single-quoted, JSON-encoded string.

The arguments, if specified, must also be a JSON-encoded string.

Both the arguments and input *must* conform to the expected types expected by the command, otherwise an error will be thrown.  Generally speaking, if a command expects a single argument, you will provide a JSON string like so: `grunt-shell-cmd cmd.name '"argument"' 'JSON-encoded input'`.

However, if the command expects multiple arguments, then you will provide a JSON object like so: `grunt-shell-cmd cmd.name '{"arg1": "arg1val", "arg2": [1,2,3], "arg3": true}' 'JSON-encoded input'`.

Use the `help` option for a given command to learn more about its arguments.  For example: `grunt-shell-cmd cmd.name help`.

### Addtional Commands

Additional commands follow this format:

```
cmd.name 'JSON-encoded arguments'
```

The input to the additional commands is _automatically_ derived based on the result of the previous command. Additionally, you *must* separate each additional command using the `_` symbol.

An example of where you would string together multiple commands is:

```
node-shell-cmd disks.all.list _ arr.first
```

### Stringing Together Commands

You can string together as many commands using the `_` symbol as you would like and you can also still use the `\` symbol to separate the commands on the command line, so the previous example could also be written as:

```
node-shell-cmd \
    disks.all.list _ \
    arr.first
```

### Getting Command Help

Every command can be supplied with the `help` argument which will then display information on what the command is and how it can be used.  For example, to learn more about the `disks.all.list` command, you would do: `node-shell-cmd disks.all.list help`.

## Development

### Basic Structure of Commands

All commands follow this basic format:

```javascript
// dot separated unique name
// commands are organized based on a tree structure
// with the root of the tree starting on the left
cmds['cmd.name'] = {
    // the following "desc" property is *required* and describes the command
    // at a high level
    desc: 'Description of the command',
    // the following "input" property is *optional*, but if specified, describes
    // the type of input and its description.  Also, by specifying this property,
    // you are *requiring* an input
    input: {
        // the "type" property is *required* and can either be:
        // * 'string'
        // * 'array'
        // * 'boolean'
        // * 'object'
        // * 'number'
        // * 'blockDev' (device which uses block-based storage)
        // * 'disk' (this does not include CD/DVD-ROM drives)
        // * 'opticalDrive' (CD/DVD-ROM drives)
        // * 'file' (regular file with optional absolute or relative path)
        // * 'dir' (absolute or relative path)
        type: 'array',
        // the "desc" property is *required* and describes the input data
        // at a high level
        desc: 'Description for input data'
    },
    // the following "arg" property is *optional*, but if specified, describes
    // a single accepted argument to the command and the "args" property is
    // ignored
    arg: {
        // the "type" property is *required* and can either be:
        // * 'string'
        // * 'array'
        // * 'boolean'
        // * 'number'
        // * 'blockDev' (device which uses block-based storage)
        // * 'disk' (this does not include CD/DVD-ROM drives)
        // * 'opticalDrive' (CD/DVD-ROM drives)
        // * 'file' (regular file with optional absolute or relative path)
        // * 'dir' (absolute or relative path)
        type: 'string',
        // the "desc" property is *required* and describes the single argument
        // at a high level
        desc: 'Description for single argument',
        // the "required" property is *optional* and if set to true means a single
        // argument *must* be specified for the command, otherwise it is not
        // required
        required: true|false
    },
    // the following "args" property is *optional*, but if specified, describes
    // multiple accepted arguments
    args: {
        arg1: {
            // the "type" property is *required* and can either be:
            // * 'string'
            // * 'array'
            // * 'boolean'
            // * 'number'
            // * 'blockDev' (device which uses block-based storage)
            // * 'disk' (this does not include CD/DVD-ROM drives)
            // * 'opticalDrive' (CD/DVD-ROM drives)
            // * 'file' (regular file with optional absolute or relative path)
            // * 'dir' (absolute or relative path)
            type: 'string',
            // the "desc" property is *required* and describes the argument
            // at a high level
            desc: 'Description for arg1',
            // the "required" property is *optional* and if set to true means this
            // argument *must* be specified for the command, otherwise it is not
            // required
            required: true|false
        },
        arg2: {
            type: 'boolean',
            desc: 'Description for arg2',
            required: true|false
        },
        arg3: {
            type: 'array',
            desc: 'Description for arg3',
            required: true|false
        }
    },
    // each property in this object is for a specific platform, which is
    // basically the type of OS grunt-shell-cmd is running inside of
    cmd: {
        // the "all" platform means you can execute the command regardless of
        // the platform and any additional platforms specified are ignored
        //
        // regardless of the platform, the provided anonymous function *always*
        // has the parameters: args, input, and callback
        //
        // the "args" parameter is an optional single argument value or collection
        // of arguments and their corresponding values specified as key/value
        // pairs inside a plain object
        //
        // the "input" parameter is a command-specific data input (i.e., the command
        // expects the input to come in a certain format).  Not all commands
        // require an input
        //
        // the "callback" parameter is a callback function which contains two
        // parameters: output, and hadError.  The format of the output is contingent
        // on the value of "hadError"; if it's null or false, then the commands
        // were able to execute safely and "output" contains its processed output,
        // whereas if it's true, then "output" contains the "err" object
        //
        // finally, in order to streamline the development of commands, a lot
        // the input type checking is done for you automatically, so you can
        // instead focus on figuring out how to design the per-platform
        // shell commands
        all: function(args, input, callback) {
            // if you need to execute an actual shell command, then you must
            // use the execCommand function
            //
            // if you do use this function, then try to avoid nesting any
            // further execCommand function calls by moving any nested
            // execCommand function calls into a new cmds['new.cmd'] command
            //
            // also, when working with windows, even if you are using grunt-shell-cmd
            // from within Cygwin, the shell commands will execute within the context
            // of a regular windows command prompt and not Cygwin
            //
            // regardless of the platform, *careful* consideration must be given
            // to how you can *safely* execute the shell commands with a provided
            // input and set of arguments.  Most of this headache is solved for
            // you automatically by virtue of requiring JSON-formatted strings
            // and doing a basic set of input and argument type checks.
            //
            // however, even with these checks, you still need to ensure the
            // inputs to the shell commands are carefully filtered and sanitized,
            // otherwise you run the risk of shell command injection
            execCommand('shell | command',
                function(stdout) {
                    // process the results of stdout here
                    // if this callback is called, then no errors executing the
                    // shell commands were encountered
                    
                    // if you want a simple way to convert the output to an
                    // array, then do (with optional regular expression filters)
                    // callback(stdoutToArray(stdout, [/regex1/, /regex2/]));
                    
                    // regardless, you have to call the "callback" function
                    // with the processed results just *once*
                    callback(<processed output>);
                }, function(err) {
                    // process the error object in the error callback function,
                    // which is only called if there were errors executing
                    // the shell commands
                    //
                    // the "err" object contains the following properties:
                    // {
                    //   err: <The Node.js Error object>,
                    //   code: <The exit code of the child process>,
                    //   signal: <The signal that terminated the child process>,
                    //   stderr: <The contents of standard error>
                    // }
                    //
                    // it is left up to each command to appropriately respond
                    // to errors, but ultimately, at some point, the "callback"
                    // function *must* be called with either processed output
                    // OR an appropriate error message string like so:
                    callback('There was error executing this command', true);
                });
            
            // otherwise, use regular JavaScript functions in order to execute
            // the "command" and then call the callback function with either
            // the processed results:
            callback(<processed output>);
            // or an appropriate error message string and true:
            callback('There was error executing this command', true);
        },
        // the "linux" platform encompasses all Linux-based OSs
        linux: function(args, input, callback) {
        },
        // the "windows" platform encompasses all Windows-based OSs
        windows: function(args, input, callback) {
        },
        // if you need to target a more specific linux or windows release/distribution
        // then you can also use the values automatically derived for "product"
        // and "dist". The general formats for these more targeted platforms are:
        // <platform>_<product> and <platform>_<product>_<dist>
        //
        // node-shell-cmd will always prefer a more specific platform over
        // a less specific one, but will fall back to a less specific platform
        // if the more specific platform didn't match
        //
        // this functionality allows to you target specific platforms but
        // automatically fall back to less specific platforms if needed.  As such,
        // when developing new commands, you should first start out with the
        // generic "linux" and "windows" platforms, but get more specific if needed
        //
        // for example, you could target "windows" first, but later find out the 
        // underlying shell commands are not supported on Windows Server 2003, so you
        // could then target "windows_server_2003" in order to support it
        //
        // this type of platform targeting can also be very useful when dealing
        // with all of the various Linux distributions and major releases.  For
        // example, you could start out by simply targeting "linux", but then find
        // out there are some major differences in how to execute the commands
        // between Debian-based and Red Hat -based distributions, so you could then
        // break it out between "linux_redhat" and "linux_debian"
        //
        // for linux, the product could be:
        // * redhat
        // * debian
        // ...and the dist could be:
        // * rhel6
        // * rhel5
        //
        // for windows, the product could be:
        // * 8
        // * 7
        // * vista
        // * server
        // ...and the dist could be:
        // * professional
        // * enterprise
        // * home
        // * 2012
        // * 2008
        // * 2003
        linux_redhat: function(args, input, callback) {},
        linux_redhat_rhel6: function(args, input, callback) {},
        windows_7: function(args, input, callback) {},
        windows_7_professional: function(args, input, callback) {}
    }
};
```
