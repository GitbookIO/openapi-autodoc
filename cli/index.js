#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/commander/lib/error.js
var require_error = __commonJS({
  "node_modules/commander/lib/error.js"(exports) {
    var CommanderError = class extends Error {
      constructor(exitCode, code, message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.code = code;
        this.exitCode = exitCode;
        this.nestedError = void 0;
      }
    };
    var InvalidArgumentError = class extends CommanderError {
      constructor(message) {
        super(1, "commander.invalidArgument", message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
      }
    };
    exports.CommanderError = CommanderError;
    exports.InvalidArgumentError = InvalidArgumentError;
  }
});

// node_modules/commander/lib/argument.js
var require_argument = __commonJS({
  "node_modules/commander/lib/argument.js"(exports) {
    var { InvalidArgumentError } = require_error();
    var Argument = class {
      constructor(name, description) {
        this.description = description || "";
        this.variadic = false;
        this.parseArg = void 0;
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.argChoices = void 0;
        switch (name[0]) {
          case "<":
            this.required = true;
            this._name = name.slice(1, -1);
            break;
          case "[":
            this.required = false;
            this._name = name.slice(1, -1);
            break;
          default:
            this.required = true;
            this._name = name;
            break;
        }
        if (this._name.length > 3 && this._name.slice(-3) === "...") {
          this.variadic = true;
          this._name = this._name.slice(0, -3);
        }
      }
      name() {
        return this._name;
      }
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      choices(values) {
        this.argChoices = values;
        this.parseArg = (arg, previous) => {
          if (!values.includes(arg)) {
            throw new InvalidArgumentError(`Allowed choices are ${values.join(", ")}.`);
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      argRequired() {
        this.required = true;
        return this;
      }
      argOptional() {
        this.required = false;
        return this;
      }
    };
    function humanReadableArgName(arg) {
      const nameOutput = arg.name() + (arg.variadic === true ? "..." : "");
      return arg.required ? "<" + nameOutput + ">" : "[" + nameOutput + "]";
    }
    exports.Argument = Argument;
    exports.humanReadableArgName = humanReadableArgName;
  }
});

// node_modules/commander/lib/help.js
var require_help = __commonJS({
  "node_modules/commander/lib/help.js"(exports) {
    var { humanReadableArgName } = require_argument();
    var Help = class {
      constructor() {
        this.helpWidth = void 0;
        this.sortSubcommands = false;
        this.sortOptions = false;
      }
      visibleCommands(cmd) {
        const visibleCommands = cmd.commands.filter((cmd2) => !cmd2._hidden);
        if (cmd._hasImplicitHelpCommand()) {
          const [, helpName, helpArgs] = cmd._helpCommandnameAndArgs.match(/([^ ]+) *(.*)/);
          const helpCommand = cmd.createCommand(helpName).helpOption(false);
          helpCommand.description(cmd._helpCommandDescription);
          if (helpArgs)
            helpCommand.arguments(helpArgs);
          visibleCommands.push(helpCommand);
        }
        if (this.sortSubcommands) {
          visibleCommands.sort((a, b) => {
            return a.name().localeCompare(b.name());
          });
        }
        return visibleCommands;
      }
      visibleOptions(cmd) {
        const visibleOptions = cmd.options.filter((option) => !option.hidden);
        const showShortHelpFlag = cmd._hasHelpOption && cmd._helpShortFlag && !cmd._findOption(cmd._helpShortFlag);
        const showLongHelpFlag = cmd._hasHelpOption && !cmd._findOption(cmd._helpLongFlag);
        if (showShortHelpFlag || showLongHelpFlag) {
          let helpOption;
          if (!showShortHelpFlag) {
            helpOption = cmd.createOption(cmd._helpLongFlag, cmd._helpDescription);
          } else if (!showLongHelpFlag) {
            helpOption = cmd.createOption(cmd._helpShortFlag, cmd._helpDescription);
          } else {
            helpOption = cmd.createOption(cmd._helpFlags, cmd._helpDescription);
          }
          visibleOptions.push(helpOption);
        }
        if (this.sortOptions) {
          const getSortKey = (option) => {
            return option.short ? option.short.replace(/^-/, "") : option.long.replace(/^--/, "");
          };
          visibleOptions.sort((a, b) => {
            return getSortKey(a).localeCompare(getSortKey(b));
          });
        }
        return visibleOptions;
      }
      visibleArguments(cmd) {
        if (cmd._argsDescription) {
          cmd._args.forEach((argument) => {
            argument.description = argument.description || cmd._argsDescription[argument.name()] || "";
          });
        }
        if (cmd._args.find((argument) => argument.description)) {
          return cmd._args;
        }
        ;
        return [];
      }
      subcommandTerm(cmd) {
        const args = cmd._args.map((arg) => humanReadableArgName(arg)).join(" ");
        return cmd._name + (cmd._aliases[0] ? "|" + cmd._aliases[0] : "") + (cmd.options.length ? " [options]" : "") + (args ? " " + args : "");
      }
      optionTerm(option) {
        return option.flags;
      }
      argumentTerm(argument) {
        return argument.name();
      }
      longestSubcommandTermLength(cmd, helper) {
        return helper.visibleCommands(cmd).reduce((max, command) => {
          return Math.max(max, helper.subcommandTerm(command).length);
        }, 0);
      }
      longestOptionTermLength(cmd, helper) {
        return helper.visibleOptions(cmd).reduce((max, option) => {
          return Math.max(max, helper.optionTerm(option).length);
        }, 0);
      }
      longestArgumentTermLength(cmd, helper) {
        return helper.visibleArguments(cmd).reduce((max, argument) => {
          return Math.max(max, helper.argumentTerm(argument).length);
        }, 0);
      }
      commandUsage(cmd) {
        let cmdName = cmd._name;
        if (cmd._aliases[0]) {
          cmdName = cmdName + "|" + cmd._aliases[0];
        }
        let parentCmdNames = "";
        for (let parentCmd = cmd.parent; parentCmd; parentCmd = parentCmd.parent) {
          parentCmdNames = parentCmd.name() + " " + parentCmdNames;
        }
        return parentCmdNames + cmdName + " " + cmd.usage();
      }
      commandDescription(cmd) {
        return cmd.description();
      }
      subcommandDescription(cmd) {
        return cmd.description();
      }
      optionDescription(option) {
        const extraInfo = [];
        if (option.argChoices && !option.negate) {
          extraInfo.push(`choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
        }
        if (option.defaultValue !== void 0 && !option.negate) {
          extraInfo.push(`default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`);
        }
        if (option.envVar !== void 0) {
          extraInfo.push(`env: ${option.envVar}`);
        }
        if (extraInfo.length > 0) {
          return `${option.description} (${extraInfo.join(", ")})`;
        }
        return option.description;
      }
      argumentDescription(argument) {
        const extraInfo = [];
        if (argument.argChoices) {
          extraInfo.push(`choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(", ")}`);
        }
        if (argument.defaultValue !== void 0) {
          extraInfo.push(`default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`);
        }
        if (extraInfo.length > 0) {
          const extraDescripton = `(${extraInfo.join(", ")})`;
          if (argument.description) {
            return `${argument.description} ${extraDescripton}`;
          }
          return extraDescripton;
        }
        return argument.description;
      }
      formatHelp(cmd, helper) {
        const termWidth = helper.padWidth(cmd, helper);
        const helpWidth = helper.helpWidth || 80;
        const itemIndentWidth = 2;
        const itemSeparatorWidth = 2;
        function formatItem(term, description) {
          if (description) {
            const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
            return helper.wrap(fullText, helpWidth - itemIndentWidth, termWidth + itemSeparatorWidth);
          }
          return term;
        }
        ;
        function formatList(textArray) {
          return textArray.join("\n").replace(/^/gm, " ".repeat(itemIndentWidth));
        }
        let output = [`Usage: ${helper.commandUsage(cmd)}`, ""];
        const commandDescription = helper.commandDescription(cmd);
        if (commandDescription.length > 0) {
          output = output.concat([commandDescription, ""]);
        }
        const argumentList = helper.visibleArguments(cmd).map((argument) => {
          return formatItem(helper.argumentTerm(argument), helper.argumentDescription(argument));
        });
        if (argumentList.length > 0) {
          output = output.concat(["Arguments:", formatList(argumentList), ""]);
        }
        const optionList = helper.visibleOptions(cmd).map((option) => {
          return formatItem(helper.optionTerm(option), helper.optionDescription(option));
        });
        if (optionList.length > 0) {
          output = output.concat(["Options:", formatList(optionList), ""]);
        }
        const commandList = helper.visibleCommands(cmd).map((cmd2) => {
          return formatItem(helper.subcommandTerm(cmd2), helper.subcommandDescription(cmd2));
        });
        if (commandList.length > 0) {
          output = output.concat(["Commands:", formatList(commandList), ""]);
        }
        return output.join("\n");
      }
      padWidth(cmd, helper) {
        return Math.max(helper.longestOptionTermLength(cmd, helper), helper.longestSubcommandTermLength(cmd, helper), helper.longestArgumentTermLength(cmd, helper));
      }
      wrap(str, width, indent, minColumnWidth = 40) {
        if (str.match(/[\n]\s+/))
          return str;
        const columnWidth = width - indent;
        if (columnWidth < minColumnWidth)
          return str;
        const leadingStr = str.substr(0, indent);
        const columnText = str.substr(indent);
        const indentString = " ".repeat(indent);
        const regex = new RegExp(".{1," + (columnWidth - 1) + "}([\\s\u200B]|$)|[^\\s\u200B]+?([\\s\u200B]|$)", "g");
        const lines = columnText.match(regex) || [];
        return leadingStr + lines.map((line, i) => {
          if (line.slice(-1) === "\n") {
            line = line.slice(0, line.length - 1);
          }
          return (i > 0 ? indentString : "") + line.trimRight();
        }).join("\n");
      }
    };
    exports.Help = Help;
  }
});

// node_modules/commander/lib/option.js
var require_option = __commonJS({
  "node_modules/commander/lib/option.js"(exports) {
    var { InvalidArgumentError } = require_error();
    var Option = class {
      constructor(flags, description) {
        this.flags = flags;
        this.description = description || "";
        this.required = flags.includes("<");
        this.optional = flags.includes("[");
        this.variadic = /\w\.\.\.[>\]]$/.test(flags);
        this.mandatory = false;
        const optionFlags = splitOptionFlags(flags);
        this.short = optionFlags.shortFlag;
        this.long = optionFlags.longFlag;
        this.negate = false;
        if (this.long) {
          this.negate = this.long.startsWith("--no-");
        }
        this.defaultValue = void 0;
        this.defaultValueDescription = void 0;
        this.envVar = void 0;
        this.parseArg = void 0;
        this.hidden = false;
        this.argChoices = void 0;
      }
      default(value, description) {
        this.defaultValue = value;
        this.defaultValueDescription = description;
        return this;
      }
      env(name) {
        this.envVar = name;
        return this;
      }
      argParser(fn) {
        this.parseArg = fn;
        return this;
      }
      makeOptionMandatory(mandatory = true) {
        this.mandatory = !!mandatory;
        return this;
      }
      hideHelp(hide = true) {
        this.hidden = !!hide;
        return this;
      }
      _concatValue(value, previous) {
        if (previous === this.defaultValue || !Array.isArray(previous)) {
          return [value];
        }
        return previous.concat(value);
      }
      choices(values) {
        this.argChoices = values;
        this.parseArg = (arg, previous) => {
          if (!values.includes(arg)) {
            throw new InvalidArgumentError(`Allowed choices are ${values.join(", ")}.`);
          }
          if (this.variadic) {
            return this._concatValue(arg, previous);
          }
          return arg;
        };
        return this;
      }
      name() {
        if (this.long) {
          return this.long.replace(/^--/, "");
        }
        return this.short.replace(/^-/, "");
      }
      attributeName() {
        return camelcase(this.name().replace(/^no-/, ""));
      }
      is(arg) {
        return this.short === arg || this.long === arg;
      }
    };
    function camelcase(str) {
      return str.split("-").reduce((str2, word) => {
        return str2 + word[0].toUpperCase() + word.slice(1);
      });
    }
    function splitOptionFlags(flags) {
      let shortFlag;
      let longFlag;
      const flagParts = flags.split(/[ |,]+/);
      if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
        shortFlag = flagParts.shift();
      longFlag = flagParts.shift();
      if (!shortFlag && /^-[^-]$/.test(longFlag)) {
        shortFlag = longFlag;
        longFlag = void 0;
      }
      return { shortFlag, longFlag };
    }
    exports.Option = Option;
    exports.splitOptionFlags = splitOptionFlags;
  }
});

// node_modules/commander/lib/suggestSimilar.js
var require_suggestSimilar = __commonJS({
  "node_modules/commander/lib/suggestSimilar.js"(exports) {
    var maxDistance = 3;
    function editDistance(a, b) {
      if (Math.abs(a.length - b.length) > maxDistance)
        return Math.max(a.length, b.length);
      const d = [];
      for (let i = 0; i <= a.length; i++) {
        d[i] = [i];
      }
      for (let j = 0; j <= b.length; j++) {
        d[0][j] = j;
      }
      for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
          let cost = 1;
          if (a[i - 1] === b[j - 1]) {
            cost = 0;
          } else {
            cost = 1;
          }
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
          if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
            d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
          }
        }
      }
      return d[a.length][b.length];
    }
    function suggestSimilar(word, candidates) {
      if (!candidates || candidates.length === 0)
        return "";
      candidates = Array.from(new Set(candidates));
      const searchingOptions = word.startsWith("--");
      if (searchingOptions) {
        word = word.slice(2);
        candidates = candidates.map((candidate) => candidate.slice(2));
      }
      let similar = [];
      let bestDistance = maxDistance;
      const minSimilarity = 0.4;
      candidates.forEach((candidate) => {
        if (candidate.length <= 1)
          return;
        const distance = editDistance(word, candidate);
        const length = Math.max(word.length, candidate.length);
        const similarity = (length - distance) / length;
        if (similarity > minSimilarity) {
          if (distance < bestDistance) {
            bestDistance = distance;
            similar = [candidate];
          } else if (distance === bestDistance) {
            similar.push(candidate);
          }
        }
      });
      similar.sort((a, b) => a.localeCompare(b));
      if (searchingOptions) {
        similar = similar.map((candidate) => `--${candidate}`);
      }
      if (similar.length > 1) {
        return `
(Did you mean one of ${similar.join(", ")}?)`;
      }
      if (similar.length === 1) {
        return `
(Did you mean ${similar[0]}?)`;
      }
      return "";
    }
    exports.suggestSimilar = suggestSimilar;
  }
});

// node_modules/commander/lib/command.js
var require_command = __commonJS({
  "node_modules/commander/lib/command.js"(exports) {
    var EventEmitter = require("events").EventEmitter;
    var childProcess = require("child_process");
    var path2 = require("path");
    var fs2 = require("fs");
    var { Argument, humanReadableArgName } = require_argument();
    var { CommanderError } = require_error();
    var { Help } = require_help();
    var { Option, splitOptionFlags } = require_option();
    var { suggestSimilar } = require_suggestSimilar();
    var Command2 = class extends EventEmitter {
      constructor(name) {
        super();
        this.commands = [];
        this.options = [];
        this.parent = null;
        this._allowUnknownOption = false;
        this._allowExcessArguments = true;
        this._args = [];
        this.args = [];
        this.rawArgs = [];
        this.processedArgs = [];
        this._scriptPath = null;
        this._name = name || "";
        this._optionValues = {};
        this._optionValueSources = {};
        this._storeOptionsAsProperties = false;
        this._actionHandler = null;
        this._executableHandler = false;
        this._executableFile = null;
        this._defaultCommandName = null;
        this._exitCallback = null;
        this._aliases = [];
        this._combineFlagAndOptionalValue = true;
        this._description = "";
        this._argsDescription = void 0;
        this._enablePositionalOptions = false;
        this._passThroughOptions = false;
        this._lifeCycleHooks = {};
        this._showHelpAfterError = false;
        this._showSuggestionAfterError = false;
        this._outputConfiguration = {
          writeOut: (str) => process.stdout.write(str),
          writeErr: (str) => process.stderr.write(str),
          getOutHelpWidth: () => process.stdout.isTTY ? process.stdout.columns : void 0,
          getErrHelpWidth: () => process.stderr.isTTY ? process.stderr.columns : void 0,
          outputError: (str, write) => write(str)
        };
        this._hidden = false;
        this._hasHelpOption = true;
        this._helpFlags = "-h, --help";
        this._helpDescription = "display help for command";
        this._helpShortFlag = "-h";
        this._helpLongFlag = "--help";
        this._addImplicitHelpCommand = void 0;
        this._helpCommandName = "help";
        this._helpCommandnameAndArgs = "help [command]";
        this._helpCommandDescription = "display help for command";
        this._helpConfiguration = {};
      }
      copyInheritedSettings(sourceCommand) {
        this._outputConfiguration = sourceCommand._outputConfiguration;
        this._hasHelpOption = sourceCommand._hasHelpOption;
        this._helpFlags = sourceCommand._helpFlags;
        this._helpDescription = sourceCommand._helpDescription;
        this._helpShortFlag = sourceCommand._helpShortFlag;
        this._helpLongFlag = sourceCommand._helpLongFlag;
        this._helpCommandName = sourceCommand._helpCommandName;
        this._helpCommandnameAndArgs = sourceCommand._helpCommandnameAndArgs;
        this._helpCommandDescription = sourceCommand._helpCommandDescription;
        this._helpConfiguration = sourceCommand._helpConfiguration;
        this._exitCallback = sourceCommand._exitCallback;
        this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
        this._combineFlagAndOptionalValue = sourceCommand._combineFlagAndOptionalValue;
        this._allowExcessArguments = sourceCommand._allowExcessArguments;
        this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
        this._showHelpAfterError = sourceCommand._showHelpAfterError;
        this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;
        return this;
      }
      command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
        let desc = actionOptsOrExecDesc;
        let opts = execOpts;
        if (typeof desc === "object" && desc !== null) {
          opts = desc;
          desc = null;
        }
        opts = opts || {};
        const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);
        const cmd = this.createCommand(name);
        if (desc) {
          cmd.description(desc);
          cmd._executableHandler = true;
        }
        if (opts.isDefault)
          this._defaultCommandName = cmd._name;
        cmd._hidden = !!(opts.noHelp || opts.hidden);
        cmd._executableFile = opts.executableFile || null;
        if (args)
          cmd.arguments(args);
        this.commands.push(cmd);
        cmd.parent = this;
        cmd.copyInheritedSettings(this);
        if (desc)
          return this;
        return cmd;
      }
      createCommand(name) {
        return new Command2(name);
      }
      createHelp() {
        return Object.assign(new Help(), this.configureHelp());
      }
      configureHelp(configuration) {
        if (configuration === void 0)
          return this._helpConfiguration;
        this._helpConfiguration = configuration;
        return this;
      }
      configureOutput(configuration) {
        if (configuration === void 0)
          return this._outputConfiguration;
        Object.assign(this._outputConfiguration, configuration);
        return this;
      }
      showHelpAfterError(displayHelp = true) {
        if (typeof displayHelp !== "string")
          displayHelp = !!displayHelp;
        this._showHelpAfterError = displayHelp;
        return this;
      }
      showSuggestionAfterError(displaySuggestion = true) {
        this._showSuggestionAfterError = !!displaySuggestion;
        return this;
      }
      addCommand(cmd, opts) {
        if (!cmd._name)
          throw new Error("Command passed to .addCommand() must have a name");
        function checkExplicitNames(commandArray) {
          commandArray.forEach((cmd2) => {
            if (cmd2._executableHandler && !cmd2._executableFile) {
              throw new Error(`Must specify executableFile for deeply nested executable: ${cmd2.name()}`);
            }
            checkExplicitNames(cmd2.commands);
          });
        }
        checkExplicitNames(cmd.commands);
        opts = opts || {};
        if (opts.isDefault)
          this._defaultCommandName = cmd._name;
        if (opts.noHelp || opts.hidden)
          cmd._hidden = true;
        this.commands.push(cmd);
        cmd.parent = this;
        return this;
      }
      createArgument(name, description) {
        return new Argument(name, description);
      }
      argument(name, description, fn, defaultValue) {
        const argument = this.createArgument(name, description);
        if (typeof fn === "function") {
          argument.default(defaultValue).argParser(fn);
        } else {
          argument.default(fn);
        }
        this.addArgument(argument);
        return this;
      }
      arguments(names) {
        names.split(/ +/).forEach((detail) => {
          this.argument(detail);
        });
        return this;
      }
      addArgument(argument) {
        const previousArgument = this._args.slice(-1)[0];
        if (previousArgument && previousArgument.variadic) {
          throw new Error(`only the last argument can be variadic '${previousArgument.name()}'`);
        }
        if (argument.required && argument.defaultValue !== void 0 && argument.parseArg === void 0) {
          throw new Error(`a default value for a required argument is never used: '${argument.name()}'`);
        }
        this._args.push(argument);
        return this;
      }
      addHelpCommand(enableOrNameAndArgs, description) {
        if (enableOrNameAndArgs === false) {
          this._addImplicitHelpCommand = false;
        } else {
          this._addImplicitHelpCommand = true;
          if (typeof enableOrNameAndArgs === "string") {
            this._helpCommandName = enableOrNameAndArgs.split(" ")[0];
            this._helpCommandnameAndArgs = enableOrNameAndArgs;
          }
          this._helpCommandDescription = description || this._helpCommandDescription;
        }
        return this;
      }
      _hasImplicitHelpCommand() {
        if (this._addImplicitHelpCommand === void 0) {
          return this.commands.length && !this._actionHandler && !this._findCommand("help");
        }
        return this._addImplicitHelpCommand;
      }
      hook(event, listener) {
        const allowedValues = ["preAction", "postAction"];
        if (!allowedValues.includes(event)) {
          throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        if (this._lifeCycleHooks[event]) {
          this._lifeCycleHooks[event].push(listener);
        } else {
          this._lifeCycleHooks[event] = [listener];
        }
        return this;
      }
      exitOverride(fn) {
        if (fn) {
          this._exitCallback = fn;
        } else {
          this._exitCallback = (err) => {
            if (err.code !== "commander.executeSubCommandAsync") {
              throw err;
            } else {
            }
          };
        }
        return this;
      }
      _exit(exitCode, code, message) {
        if (this._exitCallback) {
          this._exitCallback(new CommanderError(exitCode, code, message));
        }
        process.exit(exitCode);
      }
      action(fn) {
        const listener = (args) => {
          const expectedArgsCount = this._args.length;
          const actionArgs = args.slice(0, expectedArgsCount);
          if (this._storeOptionsAsProperties) {
            actionArgs[expectedArgsCount] = this;
          } else {
            actionArgs[expectedArgsCount] = this.opts();
          }
          actionArgs.push(this);
          return fn.apply(this, actionArgs);
        };
        this._actionHandler = listener;
        return this;
      }
      createOption(flags, description) {
        return new Option(flags, description);
      }
      addOption(option) {
        const oname = option.name();
        const name = option.attributeName();
        let defaultValue = option.defaultValue;
        if (option.negate || option.optional || option.required || typeof defaultValue === "boolean") {
          if (option.negate) {
            const positiveLongFlag = option.long.replace(/^--no-/, "--");
            defaultValue = this._findOption(positiveLongFlag) ? this.getOptionValue(name) : true;
          }
          if (defaultValue !== void 0) {
            this.setOptionValueWithSource(name, defaultValue, "default");
          }
        }
        this.options.push(option);
        const handleOptionValue = (val, invalidValueMessage, valueSource) => {
          const oldValue = this.getOptionValue(name);
          if (val !== null && option.parseArg) {
            try {
              val = option.parseArg(val, oldValue === void 0 ? defaultValue : oldValue);
            } catch (err) {
              if (err.code === "commander.invalidArgument") {
                const message = `${invalidValueMessage} ${err.message}`;
                this._displayError(err.exitCode, err.code, message);
              }
              throw err;
            }
          } else if (val !== null && option.variadic) {
            val = option._concatValue(val, oldValue);
          }
          if (typeof oldValue === "boolean" || typeof oldValue === "undefined") {
            if (val == null) {
              this.setOptionValueWithSource(name, option.negate ? false : defaultValue || true, valueSource);
            } else {
              this.setOptionValueWithSource(name, val, valueSource);
            }
          } else if (val !== null) {
            this.setOptionValueWithSource(name, option.negate ? false : val, valueSource);
          }
        };
        this.on("option:" + oname, (val) => {
          const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
          handleOptionValue(val, invalidValueMessage, "cli");
        });
        if (option.envVar) {
          this.on("optionEnv:" + oname, (val) => {
            const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
            handleOptionValue(val, invalidValueMessage, "env");
          });
        }
        return this;
      }
      _optionEx(config, flags, description, fn, defaultValue) {
        const option = this.createOption(flags, description);
        option.makeOptionMandatory(!!config.mandatory);
        if (typeof fn === "function") {
          option.default(defaultValue).argParser(fn);
        } else if (fn instanceof RegExp) {
          const regex = fn;
          fn = (val, def) => {
            const m = regex.exec(val);
            return m ? m[0] : def;
          };
          option.default(defaultValue).argParser(fn);
        } else {
          option.default(fn);
        }
        return this.addOption(option);
      }
      option(flags, description, fn, defaultValue) {
        return this._optionEx({}, flags, description, fn, defaultValue);
      }
      requiredOption(flags, description, fn, defaultValue) {
        return this._optionEx({ mandatory: true }, flags, description, fn, defaultValue);
      }
      combineFlagAndOptionalValue(combine = true) {
        this._combineFlagAndOptionalValue = !!combine;
        return this;
      }
      allowUnknownOption(allowUnknown = true) {
        this._allowUnknownOption = !!allowUnknown;
        return this;
      }
      allowExcessArguments(allowExcess = true) {
        this._allowExcessArguments = !!allowExcess;
        return this;
      }
      enablePositionalOptions(positional = true) {
        this._enablePositionalOptions = !!positional;
        return this;
      }
      passThroughOptions(passThrough = true) {
        this._passThroughOptions = !!passThrough;
        if (!!this.parent && passThrough && !this.parent._enablePositionalOptions) {
          throw new Error("passThroughOptions can not be used without turning on enablePositionalOptions for parent command(s)");
        }
        return this;
      }
      storeOptionsAsProperties(storeAsProperties = true) {
        this._storeOptionsAsProperties = !!storeAsProperties;
        if (this.options.length) {
          throw new Error("call .storeOptionsAsProperties() before adding options");
        }
        return this;
      }
      getOptionValue(key) {
        if (this._storeOptionsAsProperties) {
          return this[key];
        }
        return this._optionValues[key];
      }
      setOptionValue(key, value) {
        if (this._storeOptionsAsProperties) {
          this[key] = value;
        } else {
          this._optionValues[key] = value;
        }
        return this;
      }
      setOptionValueWithSource(key, value, source) {
        this.setOptionValue(key, value);
        this._optionValueSources[key] = source;
        return this;
      }
      getOptionValueSource(key) {
        return this._optionValueSources[key];
      }
      _prepareUserArgs(argv, parseOptions) {
        if (argv !== void 0 && !Array.isArray(argv)) {
          throw new Error("first parameter to parse must be array or undefined");
        }
        parseOptions = parseOptions || {};
        if (argv === void 0) {
          argv = process.argv;
          if (process.versions && process.versions.electron) {
            parseOptions.from = "electron";
          }
        }
        this.rawArgs = argv.slice();
        let userArgs;
        switch (parseOptions.from) {
          case void 0:
          case "node":
            this._scriptPath = argv[1];
            userArgs = argv.slice(2);
            break;
          case "electron":
            if (process.defaultApp) {
              this._scriptPath = argv[1];
              userArgs = argv.slice(2);
            } else {
              userArgs = argv.slice(1);
            }
            break;
          case "user":
            userArgs = argv.slice(0);
            break;
          default:
            throw new Error(`unexpected parse option { from: '${parseOptions.from}' }`);
        }
        if (!this._scriptPath && require.main) {
          this._scriptPath = require.main.filename;
        }
        this._name = this._name || this._scriptPath && path2.basename(this._scriptPath, path2.extname(this._scriptPath));
        return userArgs;
      }
      parse(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        this._parseCommand([], userArgs);
        return this;
      }
      async parseAsync(argv, parseOptions) {
        const userArgs = this._prepareUserArgs(argv, parseOptions);
        await this._parseCommand([], userArgs);
        return this;
      }
      _executeSubCommand(subcommand, args) {
        args = args.slice();
        let launchWithNode = false;
        const sourceExt = [".js", ".ts", ".tsx", ".mjs", ".cjs"];
        this._checkForMissingMandatoryOptions();
        let scriptPath = this._scriptPath;
        if (!scriptPath && require.main) {
          scriptPath = require.main.filename;
        }
        let baseDir;
        try {
          const resolvedLink = fs2.realpathSync(scriptPath);
          baseDir = path2.dirname(resolvedLink);
        } catch (e) {
          baseDir = ".";
        }
        let bin = path2.basename(scriptPath, path2.extname(scriptPath)) + "-" + subcommand._name;
        if (subcommand._executableFile) {
          bin = subcommand._executableFile;
        }
        const localBin = path2.join(baseDir, bin);
        if (fs2.existsSync(localBin)) {
          bin = localBin;
        } else {
          sourceExt.forEach((ext) => {
            if (fs2.existsSync(`${localBin}${ext}`)) {
              bin = `${localBin}${ext}`;
            }
          });
        }
        launchWithNode = sourceExt.includes(path2.extname(bin));
        let proc;
        if (process.platform !== "win32") {
          if (launchWithNode) {
            args.unshift(bin);
            args = incrementNodeInspectorPort(process.execArgv).concat(args);
            proc = childProcess.spawn(process.argv[0], args, { stdio: "inherit" });
          } else {
            proc = childProcess.spawn(bin, args, { stdio: "inherit" });
          }
        } else {
          args.unshift(bin);
          args = incrementNodeInspectorPort(process.execArgv).concat(args);
          proc = childProcess.spawn(process.execPath, args, { stdio: "inherit" });
        }
        const signals = ["SIGUSR1", "SIGUSR2", "SIGTERM", "SIGINT", "SIGHUP"];
        signals.forEach((signal) => {
          process.on(signal, () => {
            if (proc.killed === false && proc.exitCode === null) {
              proc.kill(signal);
            }
          });
        });
        const exitCallback = this._exitCallback;
        if (!exitCallback) {
          proc.on("close", process.exit.bind(process));
        } else {
          proc.on("close", () => {
            exitCallback(new CommanderError(process.exitCode || 0, "commander.executeSubCommandAsync", "(close)"));
          });
        }
        proc.on("error", (err) => {
          if (err.code === "ENOENT") {
            const executableMissing = `'${bin}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name`;
            throw new Error(executableMissing);
          } else if (err.code === "EACCES") {
            throw new Error(`'${bin}' not executable`);
          }
          if (!exitCallback) {
            process.exit(1);
          } else {
            const wrappedError = new CommanderError(1, "commander.executeSubCommandAsync", "(error)");
            wrappedError.nestedError = err;
            exitCallback(wrappedError);
          }
        });
        this.runningCommand = proc;
      }
      _dispatchSubcommand(commandName, operands, unknown) {
        const subCommand = this._findCommand(commandName);
        if (!subCommand)
          this.help({ error: true });
        if (subCommand._executableHandler) {
          this._executeSubCommand(subCommand, operands.concat(unknown));
        } else {
          return subCommand._parseCommand(operands, unknown);
        }
      }
      _checkNumberOfArguments() {
        this._args.forEach((arg, i) => {
          if (arg.required && this.args[i] == null) {
            this.missingArgument(arg.name());
          }
        });
        if (this._args.length > 0 && this._args[this._args.length - 1].variadic) {
          return;
        }
        if (this.args.length > this._args.length) {
          this._excessArguments(this.args);
        }
      }
      _processArguments() {
        const myParseArg = (argument, value, previous) => {
          let parsedValue = value;
          if (value !== null && argument.parseArg) {
            try {
              parsedValue = argument.parseArg(value, previous);
            } catch (err) {
              if (err.code === "commander.invalidArgument") {
                const message = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'. ${err.message}`;
                this._displayError(err.exitCode, err.code, message);
              }
              throw err;
            }
          }
          return parsedValue;
        };
        this._checkNumberOfArguments();
        const processedArgs = [];
        this._args.forEach((declaredArg, index) => {
          let value = declaredArg.defaultValue;
          if (declaredArg.variadic) {
            if (index < this.args.length) {
              value = this.args.slice(index);
              if (declaredArg.parseArg) {
                value = value.reduce((processed, v) => {
                  return myParseArg(declaredArg, v, processed);
                }, declaredArg.defaultValue);
              }
            } else if (value === void 0) {
              value = [];
            }
          } else if (index < this.args.length) {
            value = this.args[index];
            if (declaredArg.parseArg) {
              value = myParseArg(declaredArg, value, declaredArg.defaultValue);
            }
          }
          processedArgs[index] = value;
        });
        this.processedArgs = processedArgs;
      }
      _chainOrCall(promise, fn) {
        if (promise && promise.then && typeof promise.then === "function") {
          return promise.then(() => fn());
        }
        return fn();
      }
      _chainOrCallHooks(promise, event) {
        let result = promise;
        const hooks = [];
        getCommandAndParents(this).reverse().filter((cmd) => cmd._lifeCycleHooks[event] !== void 0).forEach((hookedCommand) => {
          hookedCommand._lifeCycleHooks[event].forEach((callback) => {
            hooks.push({ hookedCommand, callback });
          });
        });
        if (event === "postAction") {
          hooks.reverse();
        }
        hooks.forEach((hookDetail) => {
          result = this._chainOrCall(result, () => {
            return hookDetail.callback(hookDetail.hookedCommand, this);
          });
        });
        return result;
      }
      _parseCommand(operands, unknown) {
        const parsed = this.parseOptions(unknown);
        this._parseOptionsEnv();
        operands = operands.concat(parsed.operands);
        unknown = parsed.unknown;
        this.args = operands.concat(unknown);
        if (operands && this._findCommand(operands[0])) {
          return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
        }
        if (this._hasImplicitHelpCommand() && operands[0] === this._helpCommandName) {
          if (operands.length === 1) {
            this.help();
          }
          return this._dispatchSubcommand(operands[1], [], [this._helpLongFlag]);
        }
        if (this._defaultCommandName) {
          outputHelpIfRequested(this, unknown);
          return this._dispatchSubcommand(this._defaultCommandName, operands, unknown);
        }
        if (this.commands.length && this.args.length === 0 && !this._actionHandler && !this._defaultCommandName) {
          this.help({ error: true });
        }
        outputHelpIfRequested(this, parsed.unknown);
        this._checkForMissingMandatoryOptions();
        const checkForUnknownOptions = () => {
          if (parsed.unknown.length > 0) {
            this.unknownOption(parsed.unknown[0]);
          }
        };
        const commandEvent = `command:${this.name()}`;
        if (this._actionHandler) {
          checkForUnknownOptions();
          this._processArguments();
          let actionResult;
          actionResult = this._chainOrCallHooks(actionResult, "preAction");
          actionResult = this._chainOrCall(actionResult, () => this._actionHandler(this.processedArgs));
          if (this.parent)
            this.parent.emit(commandEvent, operands, unknown);
          actionResult = this._chainOrCallHooks(actionResult, "postAction");
          return actionResult;
        }
        if (this.parent && this.parent.listenerCount(commandEvent)) {
          checkForUnknownOptions();
          this._processArguments();
          this.parent.emit(commandEvent, operands, unknown);
        } else if (operands.length) {
          if (this._findCommand("*")) {
            return this._dispatchSubcommand("*", operands, unknown);
          }
          if (this.listenerCount("command:*")) {
            this.emit("command:*", operands, unknown);
          } else if (this.commands.length) {
            this.unknownCommand();
          } else {
            checkForUnknownOptions();
            this._processArguments();
          }
        } else if (this.commands.length) {
          checkForUnknownOptions();
          this.help({ error: true });
        } else {
          checkForUnknownOptions();
          this._processArguments();
        }
      }
      _findCommand(name) {
        if (!name)
          return void 0;
        return this.commands.find((cmd) => cmd._name === name || cmd._aliases.includes(name));
      }
      _findOption(arg) {
        return this.options.find((option) => option.is(arg));
      }
      _checkForMissingMandatoryOptions() {
        for (let cmd = this; cmd; cmd = cmd.parent) {
          cmd.options.forEach((anOption) => {
            if (anOption.mandatory && cmd.getOptionValue(anOption.attributeName()) === void 0) {
              cmd.missingMandatoryOptionValue(anOption);
            }
          });
        }
      }
      parseOptions(argv) {
        const operands = [];
        const unknown = [];
        let dest = operands;
        const args = argv.slice();
        function maybeOption(arg) {
          return arg.length > 1 && arg[0] === "-";
        }
        let activeVariadicOption = null;
        while (args.length) {
          const arg = args.shift();
          if (arg === "--") {
            if (dest === unknown)
              dest.push(arg);
            dest.push(...args);
            break;
          }
          if (activeVariadicOption && !maybeOption(arg)) {
            this.emit(`option:${activeVariadicOption.name()}`, arg);
            continue;
          }
          activeVariadicOption = null;
          if (maybeOption(arg)) {
            const option = this._findOption(arg);
            if (option) {
              if (option.required) {
                const value = args.shift();
                if (value === void 0)
                  this.optionMissingArgument(option);
                this.emit(`option:${option.name()}`, value);
              } else if (option.optional) {
                let value = null;
                if (args.length > 0 && !maybeOption(args[0])) {
                  value = args.shift();
                }
                this.emit(`option:${option.name()}`, value);
              } else {
                this.emit(`option:${option.name()}`);
              }
              activeVariadicOption = option.variadic ? option : null;
              continue;
            }
          }
          if (arg.length > 2 && arg[0] === "-" && arg[1] !== "-") {
            const option = this._findOption(`-${arg[1]}`);
            if (option) {
              if (option.required || option.optional && this._combineFlagAndOptionalValue) {
                this.emit(`option:${option.name()}`, arg.slice(2));
              } else {
                this.emit(`option:${option.name()}`);
                args.unshift(`-${arg.slice(2)}`);
              }
              continue;
            }
          }
          if (/^--[^=]+=/.test(arg)) {
            const index = arg.indexOf("=");
            const option = this._findOption(arg.slice(0, index));
            if (option && (option.required || option.optional)) {
              this.emit(`option:${option.name()}`, arg.slice(index + 1));
              continue;
            }
          }
          if (maybeOption(arg)) {
            dest = unknown;
          }
          if ((this._enablePositionalOptions || this._passThroughOptions) && operands.length === 0 && unknown.length === 0) {
            if (this._findCommand(arg)) {
              operands.push(arg);
              if (args.length > 0)
                unknown.push(...args);
              break;
            } else if (arg === this._helpCommandName && this._hasImplicitHelpCommand()) {
              operands.push(arg);
              if (args.length > 0)
                operands.push(...args);
              break;
            } else if (this._defaultCommandName) {
              unknown.push(arg);
              if (args.length > 0)
                unknown.push(...args);
              break;
            }
          }
          if (this._passThroughOptions) {
            dest.push(arg);
            if (args.length > 0)
              dest.push(...args);
            break;
          }
          dest.push(arg);
        }
        return { operands, unknown };
      }
      opts() {
        if (this._storeOptionsAsProperties) {
          const result = {};
          const len = this.options.length;
          for (let i = 0; i < len; i++) {
            const key = this.options[i].attributeName();
            result[key] = key === this._versionOptionName ? this._version : this[key];
          }
          return result;
        }
        return this._optionValues;
      }
      _displayError(exitCode, code, message) {
        this._outputConfiguration.outputError(`${message}
`, this._outputConfiguration.writeErr);
        if (typeof this._showHelpAfterError === "string") {
          this._outputConfiguration.writeErr(`${this._showHelpAfterError}
`);
        } else if (this._showHelpAfterError) {
          this._outputConfiguration.writeErr("\n");
          this.outputHelp({ error: true });
        }
        this._exit(exitCode, code, message);
      }
      _parseOptionsEnv() {
        this.options.forEach((option) => {
          if (option.envVar && option.envVar in process.env) {
            const optionKey = option.attributeName();
            if (this.getOptionValue(optionKey) === void 0 || ["default", "config", "env"].includes(this.getOptionValueSource(optionKey))) {
              if (option.required || option.optional) {
                this.emit(`optionEnv:${option.name()}`, process.env[option.envVar]);
              } else {
                this.emit(`optionEnv:${option.name()}`);
              }
            }
          }
        });
      }
      missingArgument(name) {
        const message = `error: missing required argument '${name}'`;
        this._displayError(1, "commander.missingArgument", message);
      }
      optionMissingArgument(option) {
        const message = `error: option '${option.flags}' argument missing`;
        this._displayError(1, "commander.optionMissingArgument", message);
      }
      missingMandatoryOptionValue(option) {
        const message = `error: required option '${option.flags}' not specified`;
        this._displayError(1, "commander.missingMandatoryOptionValue", message);
      }
      unknownOption(flag) {
        if (this._allowUnknownOption)
          return;
        let suggestion = "";
        if (flag.startsWith("--") && this._showSuggestionAfterError) {
          let candidateFlags = [];
          let command = this;
          do {
            const moreFlags = command.createHelp().visibleOptions(command).filter((option) => option.long).map((option) => option.long);
            candidateFlags = candidateFlags.concat(moreFlags);
            command = command.parent;
          } while (command && !command._enablePositionalOptions);
          suggestion = suggestSimilar(flag, candidateFlags);
        }
        const message = `error: unknown option '${flag}'${suggestion}`;
        this._displayError(1, "commander.unknownOption", message);
      }
      _excessArguments(receivedArgs) {
        if (this._allowExcessArguments)
          return;
        const expected = this._args.length;
        const s = expected === 1 ? "" : "s";
        const forSubcommand = this.parent ? ` for '${this.name()}'` : "";
        const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
        this._displayError(1, "commander.excessArguments", message);
      }
      unknownCommand() {
        const unknownName = this.args[0];
        let suggestion = "";
        if (this._showSuggestionAfterError) {
          const candidateNames = [];
          this.createHelp().visibleCommands(this).forEach((command) => {
            candidateNames.push(command.name());
            if (command.alias())
              candidateNames.push(command.alias());
          });
          suggestion = suggestSimilar(unknownName, candidateNames);
        }
        const message = `error: unknown command '${unknownName}'${suggestion}`;
        this._displayError(1, "commander.unknownCommand", message);
      }
      version(str, flags, description) {
        if (str === void 0)
          return this._version;
        this._version = str;
        flags = flags || "-V, --version";
        description = description || "output the version number";
        const versionOption = this.createOption(flags, description);
        this._versionOptionName = versionOption.attributeName();
        this.options.push(versionOption);
        this.on("option:" + versionOption.name(), () => {
          this._outputConfiguration.writeOut(`${str}
`);
          this._exit(0, "commander.version", str);
        });
        return this;
      }
      description(str, argsDescription) {
        if (str === void 0 && argsDescription === void 0)
          return this._description;
        this._description = str;
        if (argsDescription) {
          this._argsDescription = argsDescription;
        }
        return this;
      }
      alias(alias) {
        if (alias === void 0)
          return this._aliases[0];
        let command = this;
        if (this.commands.length !== 0 && this.commands[this.commands.length - 1]._executableHandler) {
          command = this.commands[this.commands.length - 1];
        }
        if (alias === command._name)
          throw new Error("Command alias can't be the same as its name");
        command._aliases.push(alias);
        return this;
      }
      aliases(aliases) {
        if (aliases === void 0)
          return this._aliases;
        aliases.forEach((alias) => this.alias(alias));
        return this;
      }
      usage(str) {
        if (str === void 0) {
          if (this._usage)
            return this._usage;
          const args = this._args.map((arg) => {
            return humanReadableArgName(arg);
          });
          return [].concat(this.options.length || this._hasHelpOption ? "[options]" : [], this.commands.length ? "[command]" : [], this._args.length ? args : []).join(" ");
        }
        this._usage = str;
        return this;
      }
      name(str) {
        if (str === void 0)
          return this._name;
        this._name = str;
        return this;
      }
      helpInformation(contextOptions) {
        const helper = this.createHelp();
        if (helper.helpWidth === void 0) {
          helper.helpWidth = contextOptions && contextOptions.error ? this._outputConfiguration.getErrHelpWidth() : this._outputConfiguration.getOutHelpWidth();
        }
        return helper.formatHelp(this, helper);
      }
      _getHelpContext(contextOptions) {
        contextOptions = contextOptions || {};
        const context = { error: !!contextOptions.error };
        let write;
        if (context.error) {
          write = (arg) => this._outputConfiguration.writeErr(arg);
        } else {
          write = (arg) => this._outputConfiguration.writeOut(arg);
        }
        context.write = contextOptions.write || write;
        context.command = this;
        return context;
      }
      outputHelp(contextOptions) {
        let deprecatedCallback;
        if (typeof contextOptions === "function") {
          deprecatedCallback = contextOptions;
          contextOptions = void 0;
        }
        const context = this._getHelpContext(contextOptions);
        getCommandAndParents(this).reverse().forEach((command) => command.emit("beforeAllHelp", context));
        this.emit("beforeHelp", context);
        let helpInformation = this.helpInformation(context);
        if (deprecatedCallback) {
          helpInformation = deprecatedCallback(helpInformation);
          if (typeof helpInformation !== "string" && !Buffer.isBuffer(helpInformation)) {
            throw new Error("outputHelp callback must return a string or a Buffer");
          }
        }
        context.write(helpInformation);
        this.emit(this._helpLongFlag);
        this.emit("afterHelp", context);
        getCommandAndParents(this).forEach((command) => command.emit("afterAllHelp", context));
      }
      helpOption(flags, description) {
        if (typeof flags === "boolean") {
          this._hasHelpOption = flags;
          return this;
        }
        this._helpFlags = flags || this._helpFlags;
        this._helpDescription = description || this._helpDescription;
        const helpFlags = splitOptionFlags(this._helpFlags);
        this._helpShortFlag = helpFlags.shortFlag;
        this._helpLongFlag = helpFlags.longFlag;
        return this;
      }
      help(contextOptions) {
        this.outputHelp(contextOptions);
        let exitCode = process.exitCode || 0;
        if (exitCode === 0 && contextOptions && typeof contextOptions !== "function" && contextOptions.error) {
          exitCode = 1;
        }
        this._exit(exitCode, "commander.help", "(outputHelp)");
      }
      addHelpText(position, text) {
        const allowedValues = ["beforeAll", "before", "after", "afterAll"];
        if (!allowedValues.includes(position)) {
          throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
        }
        const helpEvent = `${position}Help`;
        this.on(helpEvent, (context) => {
          let helpStr;
          if (typeof text === "function") {
            helpStr = text({ error: context.error, command: context.command });
          } else {
            helpStr = text;
          }
          if (helpStr) {
            context.write(`${helpStr}
`);
          }
        });
        return this;
      }
    };
    function outputHelpIfRequested(cmd, args) {
      const helpOption = cmd._hasHelpOption && args.find((arg) => arg === cmd._helpLongFlag || arg === cmd._helpShortFlag);
      if (helpOption) {
        cmd.outputHelp();
        cmd._exit(0, "commander.helpDisplayed", "(outputHelp)");
      }
    }
    function incrementNodeInspectorPort(args) {
      return args.map((arg) => {
        if (!arg.startsWith("--inspect")) {
          return arg;
        }
        let debugOption;
        let debugHost = "127.0.0.1";
        let debugPort = "9229";
        let match;
        if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
          debugOption = match[1];
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null) {
          debugOption = match[1];
          if (/^\d+$/.test(match[3])) {
            debugPort = match[3];
          } else {
            debugHost = match[3];
          }
        } else if ((match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null) {
          debugOption = match[1];
          debugHost = match[3];
          debugPort = match[4];
        }
        if (debugOption && debugPort !== "0") {
          return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
        }
        return arg;
      });
    }
    function getCommandAndParents(startCommand) {
      const result = [];
      for (let command = startCommand; command; command = command.parent) {
        result.push(command);
      }
      return result;
    }
    exports.Command = Command2;
  }
});

// node_modules/commander/index.js
var require_commander = __commonJS({
  "node_modules/commander/index.js"(exports, module2) {
    var { Argument } = require_argument();
    var { Command: Command2 } = require_command();
    var { CommanderError, InvalidArgumentError } = require_error();
    var { Help } = require_help();
    var { Option } = require_option();
    exports = module2.exports = new Command2();
    exports.program = exports;
    exports.Argument = Argument;
    exports.Command = Command2;
    exports.CommanderError = CommanderError;
    exports.Help = Help;
    exports.InvalidArgumentError = InvalidArgumentError;
    exports.InvalidOptionArgumentError = InvalidArgumentError;
    exports.Option = Option;
  }
});

// node_modules/@apidevtools/swagger-parser/lib/util.js
var require_util = __commonJS({
  "node_modules/@apidevtools/swagger-parser/lib/util.js"(exports) {
    "use strict";
    var util = require("util");
    exports.format = util.format;
    exports.inherits = util.inherits;
    exports.swaggerParamRegExp = /\{([^/}]+)}/g;
  }
});

// node_modules/@jsdevtools/ono/cjs/to-json.js
var require_to_json = __commonJS({
  "node_modules/@jsdevtools/ono/cjs/to-json.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDeepKeys = exports.toJSON = void 0;
    var nonJsonTypes = ["function", "symbol", "undefined"];
    var protectedProps = ["constructor", "prototype", "__proto__"];
    var objectPrototype = Object.getPrototypeOf({});
    function toJSON() {
      let pojo = {};
      let error = this;
      for (let key of getDeepKeys(error)) {
        if (typeof key === "string") {
          let value = error[key];
          let type = typeof value;
          if (!nonJsonTypes.includes(type)) {
            pojo[key] = value;
          }
        }
      }
      return pojo;
    }
    exports.toJSON = toJSON;
    function getDeepKeys(obj, omit = []) {
      let keys = [];
      while (obj && obj !== objectPrototype) {
        keys = keys.concat(Object.getOwnPropertyNames(obj), Object.getOwnPropertySymbols(obj));
        obj = Object.getPrototypeOf(obj);
      }
      let uniqueKeys = new Set(keys);
      for (let key of omit.concat(protectedProps)) {
        uniqueKeys.delete(key);
      }
      return uniqueKeys;
    }
    exports.getDeepKeys = getDeepKeys;
  }
});

// node_modules/@jsdevtools/ono/cjs/isomorphic.node.js
var require_isomorphic_node = __commonJS({
  "node_modules/@jsdevtools/ono/cjs/isomorphic.node.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.addInspectMethod = exports.format = void 0;
    var util = require("util");
    var to_json_1 = require_to_json();
    var inspectMethod = util.inspect.custom || Symbol.for("nodejs.util.inspect.custom");
    exports.format = util.format;
    function addInspectMethod(newError) {
      newError[inspectMethod] = inspect;
    }
    exports.addInspectMethod = addInspectMethod;
    function inspect() {
      let pojo = {};
      let error = this;
      for (let key of to_json_1.getDeepKeys(error)) {
        let value = error[key];
        pojo[key] = value;
      }
      delete pojo[inspectMethod];
      return pojo;
    }
  }
});

// node_modules/@jsdevtools/ono/cjs/stack.js
var require_stack = __commonJS({
  "node_modules/@jsdevtools/ono/cjs/stack.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lazyJoinStacks = exports.joinStacks = exports.isWritableStack = exports.isLazyStack = void 0;
    var newline = /\r?\n/;
    var onoCall = /\bono[ @]/;
    function isLazyStack(stackProp) {
      return Boolean(stackProp && stackProp.configurable && typeof stackProp.get === "function");
    }
    exports.isLazyStack = isLazyStack;
    function isWritableStack(stackProp) {
      return Boolean(!stackProp || stackProp.writable || typeof stackProp.set === "function");
    }
    exports.isWritableStack = isWritableStack;
    function joinStacks(newError, originalError) {
      let newStack = popStack(newError.stack);
      let originalStack = originalError ? originalError.stack : void 0;
      if (newStack && originalStack) {
        return newStack + "\n\n" + originalStack;
      } else {
        return newStack || originalStack;
      }
    }
    exports.joinStacks = joinStacks;
    function lazyJoinStacks(lazyStack, newError, originalError) {
      if (originalError) {
        Object.defineProperty(newError, "stack", {
          get: () => {
            let newStack = lazyStack.get.apply(newError);
            return joinStacks({ stack: newStack }, originalError);
          },
          enumerable: false,
          configurable: true
        });
      } else {
        lazyPopStack(newError, lazyStack);
      }
    }
    exports.lazyJoinStacks = lazyJoinStacks;
    function popStack(stack) {
      if (stack) {
        let lines = stack.split(newline);
        let onoStart;
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i];
          if (onoCall.test(line)) {
            if (onoStart === void 0) {
              onoStart = i;
            }
          } else if (onoStart !== void 0) {
            lines.splice(onoStart, i - onoStart);
            break;
          }
        }
        if (lines.length > 0) {
          return lines.join("\n");
        }
      }
      return stack;
    }
    function lazyPopStack(error, lazyStack) {
      Object.defineProperty(error, "stack", {
        get: () => popStack(lazyStack.get.apply(error)),
        enumerable: false,
        configurable: true
      });
    }
  }
});

// node_modules/@jsdevtools/ono/cjs/extend-error.js
var require_extend_error = __commonJS({
  "node_modules/@jsdevtools/ono/cjs/extend-error.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.extendError = void 0;
    var isomorphic_node_1 = require_isomorphic_node();
    var stack_1 = require_stack();
    var to_json_1 = require_to_json();
    var protectedProps = ["name", "message", "stack"];
    function extendError(error, originalError, props) {
      let onoError = error;
      extendStack(onoError, originalError);
      if (originalError && typeof originalError === "object") {
        mergeErrors(onoError, originalError);
      }
      onoError.toJSON = to_json_1.toJSON;
      if (isomorphic_node_1.addInspectMethod) {
        isomorphic_node_1.addInspectMethod(onoError);
      }
      if (props && typeof props === "object") {
        Object.assign(onoError, props);
      }
      return onoError;
    }
    exports.extendError = extendError;
    function extendStack(newError, originalError) {
      let stackProp = Object.getOwnPropertyDescriptor(newError, "stack");
      if (stack_1.isLazyStack(stackProp)) {
        stack_1.lazyJoinStacks(stackProp, newError, originalError);
      } else if (stack_1.isWritableStack(stackProp)) {
        newError.stack = stack_1.joinStacks(newError, originalError);
      }
    }
    function mergeErrors(newError, originalError) {
      let keys = to_json_1.getDeepKeys(originalError, protectedProps);
      let _newError = newError;
      let _originalError = originalError;
      for (let key of keys) {
        if (_newError[key] === void 0) {
          try {
            _newError[key] = _originalError[key];
          } catch (e) {
          }
        }
      }
    }
  }
});

// node_modules/@jsdevtools/ono/cjs/normalize.js
var require_normalize = __commonJS({
  "node_modules/@jsdevtools/ono/cjs/normalize.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizeArgs = exports.normalizeOptions = void 0;
    var isomorphic_node_1 = require_isomorphic_node();
    function normalizeOptions(options) {
      options = options || {};
      return {
        concatMessages: options.concatMessages === void 0 ? true : Boolean(options.concatMessages),
        format: options.format === void 0 ? isomorphic_node_1.format : typeof options.format === "function" ? options.format : false
      };
    }
    exports.normalizeOptions = normalizeOptions;
    function normalizeArgs(args, options) {
      let originalError;
      let props;
      let formatArgs;
      let message = "";
      if (typeof args[0] === "string") {
        formatArgs = args;
      } else if (typeof args[1] === "string") {
        if (args[0] instanceof Error) {
          originalError = args[0];
        } else {
          props = args[0];
        }
        formatArgs = args.slice(1);
      } else {
        originalError = args[0];
        props = args[1];
        formatArgs = args.slice(2);
      }
      if (formatArgs.length > 0) {
        if (options.format) {
          message = options.format.apply(void 0, formatArgs);
        } else {
          message = formatArgs.join(" ");
        }
      }
      if (options.concatMessages && originalError && originalError.message) {
        message += (message ? " \n" : "") + originalError.message;
      }
      return { originalError, props, message };
    }
    exports.normalizeArgs = normalizeArgs;
  }
});

// node_modules/@jsdevtools/ono/cjs/constructor.js
var require_constructor = __commonJS({
  "node_modules/@jsdevtools/ono/cjs/constructor.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Ono = void 0;
    var extend_error_1 = require_extend_error();
    var normalize_1 = require_normalize();
    var to_json_1 = require_to_json();
    var constructor = Ono;
    exports.Ono = constructor;
    function Ono(ErrorConstructor, options) {
      options = normalize_1.normalizeOptions(options);
      function ono(...args) {
        let { originalError, props, message } = normalize_1.normalizeArgs(args, options);
        let newError = new ErrorConstructor(message);
        return extend_error_1.extendError(newError, originalError, props);
      }
      ono[Symbol.species] = ErrorConstructor;
      return ono;
    }
    Ono.toJSON = function toJSON(error) {
      return to_json_1.toJSON.call(error);
    };
    Ono.extend = function extend(error, originalError, props) {
      if (props || originalError instanceof Error) {
        return extend_error_1.extendError(error, originalError, props);
      } else if (originalError) {
        return extend_error_1.extendError(error, void 0, originalError);
      } else {
        return extend_error_1.extendError(error);
      }
    };
  }
});

// node_modules/@jsdevtools/ono/cjs/singleton.js
var require_singleton = __commonJS({
  "node_modules/@jsdevtools/ono/cjs/singleton.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ono = void 0;
    var constructor_1 = require_constructor();
    var singleton = ono;
    exports.ono = singleton;
    ono.error = new constructor_1.Ono(Error);
    ono.eval = new constructor_1.Ono(EvalError);
    ono.range = new constructor_1.Ono(RangeError);
    ono.reference = new constructor_1.Ono(ReferenceError);
    ono.syntax = new constructor_1.Ono(SyntaxError);
    ono.type = new constructor_1.Ono(TypeError);
    ono.uri = new constructor_1.Ono(URIError);
    var onoMap = ono;
    function ono(...args) {
      let originalError = args[0];
      if (typeof originalError === "object" && typeof originalError.name === "string") {
        for (let typedOno of Object.values(onoMap)) {
          if (typeof typedOno === "function" && typedOno.name === "ono") {
            let species = typedOno[Symbol.species];
            if (species && species !== Error && (originalError instanceof species || originalError.name === species.name)) {
              return typedOno.apply(void 0, args);
            }
          }
        }
      }
      return ono.error.apply(void 0, args);
    }
  }
});

// node_modules/@jsdevtools/ono/cjs/types.js
var require_types = __commonJS({
  "node_modules/@jsdevtools/ono/cjs/types.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var util_1 = require("util");
  }
});

// node_modules/@jsdevtools/ono/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/@jsdevtools/ono/cjs/index.js"(exports, module2) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !exports2.hasOwnProperty(p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ono = void 0;
    var singleton_1 = require_singleton();
    Object.defineProperty(exports, "ono", { enumerable: true, get: function() {
      return singleton_1.ono;
    } });
    var constructor_1 = require_constructor();
    Object.defineProperty(exports, "Ono", { enumerable: true, get: function() {
      return constructor_1.Ono;
    } });
    __exportStar(require_types(), exports);
    exports.default = singleton_1.ono;
    if (typeof module2 === "object" && typeof module2.exports === "object") {
      module2.exports = Object.assign(module2.exports.default, module2.exports);
    }
  }
});

// node_modules/z-schema/src/Polyfills.js
var require_Polyfills = __commonJS({
  "node_modules/z-schema/src/Polyfills.js"() {
    if (typeof Number.isFinite !== "function") {
      Number.isFinite = function isFinite2(value) {
        if (typeof value !== "number") {
          return false;
        }
        if (value !== value || value === Infinity || value === -Infinity) {
          return false;
        }
        return true;
      };
    }
  }
});

// node_modules/lodash.get/index.js
var require_lodash = __commonJS({
  "node_modules/lodash.get/index.js"(exports, module2) {
    var FUNC_ERROR_TEXT = "Expected a function";
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var INFINITY = 1 / 0;
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var symbolTag = "[object Symbol]";
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
    var reIsPlainProp = /^\w*$/;
    var reLeadingDot = /^\./;
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reEscapeChar = /\\(\\)?/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function isHostObject(value) {
      var result = false;
      if (value != null && typeof value.toString != "function") {
        try {
          result = !!(value + "");
        } catch (e) {
        }
      }
      return result;
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var objectToString = objectProto.toString;
    var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
    var Symbol2 = root.Symbol;
    var splice = arrayProto.splice;
    var Map2 = getNative(root, "Map");
    var nativeCreate = getNative(Object, "create");
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolToString = symbolProto ? symbolProto.toString : void 0;
    function Hash(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries ? entries.length : 0;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      return getMapData(this, key)["delete"](key);
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseGet(object, path2) {
      path2 = isKey(path2, object) ? [path2] : castPath(path2);
      var index = 0, length = path2.length;
      while (object != null && index < length) {
        object = object[toKey(path2[index++])];
      }
      return index && index == length ? object : void 0;
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) || isHostObject(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    function castPath(value) {
      return isArray(value) ? value : stringToPath(value);
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    var stringToPath = memoize(function(string) {
      string = toString2(string);
      var result = [];
      if (reLeadingDot.test(string)) {
        result.push("");
      }
      string.replace(rePropName, function(match, number, quote, string2) {
        result.push(quote ? string2.replace(reEscapeChar, "$1") : number || match);
      });
      return result;
    });
    function toKey(value) {
      if (typeof value == "string" || isSymbol(value)) {
        return value;
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function memoize(func, resolver) {
      if (typeof func != "function" || resolver && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache)();
      return memoized;
    }
    memoize.Cache = MapCache;
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var isArray = Array.isArray;
    function isFunction(value) {
      var tag = isObject(value) ? objectToString.call(value) : "";
      return tag == funcTag || tag == genTag;
    }
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return !!value && typeof value == "object";
    }
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && objectToString.call(value) == symbolTag;
    }
    function toString2(value) {
      return value == null ? "" : baseToString(value);
    }
    function get(object, path2, defaultValue) {
      var result = object == null ? void 0 : baseGet(object, path2);
      return result === void 0 ? defaultValue : result;
    }
    module2.exports = get;
  }
});

// node_modules/z-schema/src/Errors.js
var require_Errors = __commonJS({
  "node_modules/z-schema/src/Errors.js"(exports, module2) {
    "use strict";
    module2.exports = {
      INVALID_TYPE: "Expected type {0} but found type {1}",
      INVALID_FORMAT: "Object didn't pass validation for format {0}: {1}",
      ENUM_MISMATCH: "No enum match for: {0}",
      ENUM_CASE_MISMATCH: "Enum does not match case for: {0}",
      ANY_OF_MISSING: "Data does not match any schemas from 'anyOf'",
      ONE_OF_MISSING: "Data does not match any schemas from 'oneOf'",
      ONE_OF_MULTIPLE: "Data is valid against more than one schema from 'oneOf'",
      NOT_PASSED: "Data matches schema from 'not'",
      ARRAY_LENGTH_SHORT: "Array is too short ({0}), minimum {1}",
      ARRAY_LENGTH_LONG: "Array is too long ({0}), maximum {1}",
      ARRAY_UNIQUE: "Array items are not unique (indexes {0} and {1})",
      ARRAY_ADDITIONAL_ITEMS: "Additional items not allowed",
      MULTIPLE_OF: "Value {0} is not a multiple of {1}",
      MINIMUM: "Value {0} is less than minimum {1}",
      MINIMUM_EXCLUSIVE: "Value {0} is equal or less than exclusive minimum {1}",
      MAXIMUM: "Value {0} is greater than maximum {1}",
      MAXIMUM_EXCLUSIVE: "Value {0} is equal or greater than exclusive maximum {1}",
      OBJECT_PROPERTIES_MINIMUM: "Too few properties defined ({0}), minimum {1}",
      OBJECT_PROPERTIES_MAXIMUM: "Too many properties defined ({0}), maximum {1}",
      OBJECT_MISSING_REQUIRED_PROPERTY: "Missing required property: {0}",
      OBJECT_ADDITIONAL_PROPERTIES: "Additional properties not allowed: {0}",
      OBJECT_DEPENDENCY_KEY: "Dependency failed - key must exist: {0} (due to key: {1})",
      MIN_LENGTH: "String is too short ({0} chars), minimum {1}",
      MAX_LENGTH: "String is too long ({0} chars), maximum {1}",
      PATTERN: "String does not match pattern {0}: {1}",
      KEYWORD_TYPE_EXPECTED: "Keyword '{0}' is expected to be of type '{1}'",
      KEYWORD_UNDEFINED_STRICT: "Keyword '{0}' must be defined in strict mode",
      KEYWORD_UNEXPECTED: "Keyword '{0}' is not expected to appear in the schema",
      KEYWORD_MUST_BE: "Keyword '{0}' must be {1}",
      KEYWORD_DEPENDENCY: "Keyword '{0}' requires keyword '{1}'",
      KEYWORD_PATTERN: "Keyword '{0}' is not a valid RegExp pattern: {1}",
      KEYWORD_VALUE_TYPE: "Each element of keyword '{0}' array must be a '{1}'",
      UNKNOWN_FORMAT: "There is no validation function for format '{0}'",
      CUSTOM_MODE_FORCE_PROPERTIES: "{0} must define at least one property if present",
      REF_UNRESOLVED: "Reference has not been resolved during compilation: {0}",
      UNRESOLVABLE_REFERENCE: "Reference could not be resolved: {0}",
      SCHEMA_NOT_REACHABLE: "Validator was not able to read schema with uri: {0}",
      SCHEMA_TYPE_EXPECTED: "Schema is expected to be of type 'object'",
      SCHEMA_NOT_AN_OBJECT: "Schema is not an object: {0}",
      ASYNC_TIMEOUT: "{0} asynchronous task(s) have timed out after {1} ms",
      PARENT_SCHEMA_VALIDATION_FAILED: "Schema failed to validate against its parent schema, see inner errors for details.",
      REMOTE_NOT_VALID: "Remote reference didn't compile successfully: {0}"
    };
  }
});

// node_modules/z-schema/src/Utils.js
var require_Utils = __commonJS({
  "node_modules/z-schema/src/Utils.js"(exports) {
    "use strict";
    exports.jsonSymbol = Symbol.for("z-schema/json");
    exports.schemaSymbol = Symbol.for("z-schema/schema");
    var sortedKeys = exports.sortedKeys = function(obj) {
      return Object.keys(obj).sort();
    };
    exports.isAbsoluteUri = function(uri) {
      return /^https?:\/\//.test(uri);
    };
    exports.isRelativeUri = function(uri) {
      return /.+#/.test(uri);
    };
    exports.whatIs = function(what) {
      var to = typeof what;
      if (to === "object") {
        if (what === null) {
          return "null";
        }
        if (Array.isArray(what)) {
          return "array";
        }
        return "object";
      }
      if (to === "number") {
        if (Number.isFinite(what)) {
          if (what % 1 === 0) {
            return "integer";
          } else {
            return "number";
          }
        }
        if (Number.isNaN(what)) {
          return "not-a-number";
        }
        return "unknown-number";
      }
      return to;
    };
    exports.areEqual = function areEqual(json1, json2, options) {
      options = options || {};
      var caseInsensitiveComparison = options.caseInsensitiveComparison || false;
      if (json1 === json2) {
        return true;
      }
      if (caseInsensitiveComparison === true && typeof json1 === "string" && typeof json2 === "string" && json1.toUpperCase() === json2.toUpperCase()) {
        return true;
      }
      var i, len;
      if (Array.isArray(json1) && Array.isArray(json2)) {
        if (json1.length !== json2.length) {
          return false;
        }
        len = json1.length;
        for (i = 0; i < len; i++) {
          if (!areEqual(json1[i], json2[i], { caseInsensitiveComparison })) {
            return false;
          }
        }
        return true;
      }
      if (exports.whatIs(json1) === "object" && exports.whatIs(json2) === "object") {
        var keys1 = sortedKeys(json1);
        var keys2 = sortedKeys(json2);
        if (!areEqual(keys1, keys2, { caseInsensitiveComparison })) {
          return false;
        }
        len = keys1.length;
        for (i = 0; i < len; i++) {
          if (!areEqual(json1[keys1[i]], json2[keys1[i]], { caseInsensitiveComparison })) {
            return false;
          }
        }
        return true;
      }
      return false;
    };
    exports.isUniqueArray = function(arr, indexes) {
      var i, j, l = arr.length;
      for (i = 0; i < l; i++) {
        for (j = i + 1; j < l; j++) {
          if (exports.areEqual(arr[i], arr[j])) {
            if (indexes) {
              indexes.push(i, j);
            }
            return false;
          }
        }
      }
      return true;
    };
    exports.difference = function(bigSet, subSet) {
      var arr = [], idx = bigSet.length;
      while (idx--) {
        if (subSet.indexOf(bigSet[idx]) === -1) {
          arr.push(bigSet[idx]);
        }
      }
      return arr;
    };
    exports.clone = function(src) {
      if (typeof src === "undefined") {
        return void 0;
      }
      if (typeof src !== "object" || src === null) {
        return src;
      }
      var res, idx;
      if (Array.isArray(src)) {
        res = [];
        idx = src.length;
        while (idx--) {
          res[idx] = src[idx];
        }
      } else {
        res = {};
        var keys = Object.keys(src);
        idx = keys.length;
        while (idx--) {
          var key = keys[idx];
          res[key] = src[key];
        }
      }
      return res;
    };
    exports.cloneDeep = function(src) {
      var vidx = 0, visited = new Map(), cloned = [];
      function cloneDeep(src2) {
        if (typeof src2 !== "object" || src2 === null) {
          return src2;
        }
        var res, idx, cidx;
        cidx = visited.get(src2);
        if (cidx !== void 0) {
          return cloned[cidx];
        }
        visited.set(src2, vidx++);
        if (Array.isArray(src2)) {
          res = [];
          cloned.push(res);
          idx = src2.length;
          while (idx--) {
            res[idx] = cloneDeep(src2[idx]);
          }
        } else {
          res = {};
          cloned.push(res);
          var keys = Object.keys(src2);
          idx = keys.length;
          while (idx--) {
            var key = keys[idx];
            res[key] = cloneDeep(src2[key]);
          }
        }
        return res;
      }
      return cloneDeep(src);
    };
    exports.ucs2decode = function(string) {
      var output = [], counter = 0, length = string.length, value, extra;
      while (counter < length) {
        value = string.charCodeAt(counter++);
        if (value >= 55296 && value <= 56319 && counter < length) {
          extra = string.charCodeAt(counter++);
          if ((extra & 64512) == 56320) {
            output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }
      return output;
    };
  }
});

// node_modules/z-schema/src/Report.js
var require_Report = __commonJS({
  "node_modules/z-schema/src/Report.js"(exports, module2) {
    "use strict";
    var get = require_lodash();
    var Errors = require_Errors();
    var Utils = require_Utils();
    function Report(parentOrOptions, reportOptions) {
      this.parentReport = parentOrOptions instanceof Report ? parentOrOptions : void 0;
      this.options = parentOrOptions instanceof Report ? parentOrOptions.options : parentOrOptions || {};
      this.reportOptions = reportOptions || {};
      this.errors = [];
      this.path = [];
      this.asyncTasks = [];
      this.rootSchema = void 0;
      this.commonErrorMessage = void 0;
      this.json = void 0;
    }
    Report.prototype.isValid = function() {
      if (this.asyncTasks.length > 0) {
        throw new Error("Async tasks pending, can't answer isValid");
      }
      return this.errors.length === 0;
    };
    Report.prototype.addAsyncTask = function(fn, args, asyncTaskResultProcessFn) {
      this.asyncTasks.push([fn, args, asyncTaskResultProcessFn]);
    };
    Report.prototype.getAncestor = function(id) {
      if (!this.parentReport) {
        return void 0;
      }
      if (this.parentReport.getSchemaId() === id) {
        return this.parentReport;
      }
      return this.parentReport.getAncestor(id);
    };
    Report.prototype.processAsyncTasks = function(timeout, callback) {
      var validationTimeout = timeout || 2e3, tasksCount = this.asyncTasks.length, idx = tasksCount, timedOut = false, self2 = this;
      function finish() {
        process.nextTick(function() {
          var valid = self2.errors.length === 0, err = valid ? null : self2.errors;
          callback(err, valid);
        });
      }
      function respond(asyncTaskResultProcessFn) {
        return function(asyncTaskResult) {
          if (timedOut) {
            return;
          }
          asyncTaskResultProcessFn(asyncTaskResult);
          if (--tasksCount === 0) {
            finish();
          }
        };
      }
      if (tasksCount === 0 || this.errors.length > 0 && this.options.breakOnFirstError) {
        finish();
        return;
      }
      while (idx--) {
        var task = this.asyncTasks[idx];
        task[0].apply(null, task[1].concat(respond(task[2])));
      }
      setTimeout(function() {
        if (tasksCount > 0) {
          timedOut = true;
          self2.addError("ASYNC_TIMEOUT", [tasksCount, validationTimeout]);
          callback(self2.errors, false);
        }
      }, validationTimeout);
    };
    Report.prototype.getPath = function(returnPathAsString) {
      var path2 = [];
      if (this.parentReport) {
        path2 = path2.concat(this.parentReport.path);
      }
      path2 = path2.concat(this.path);
      if (returnPathAsString !== true) {
        path2 = "#/" + path2.map(function(segment) {
          segment = segment.toString();
          if (Utils.isAbsoluteUri(segment)) {
            return "uri(" + segment + ")";
          }
          return segment.replace(/\~/g, "~0").replace(/\//g, "~1");
        }).join("/");
      }
      return path2;
    };
    Report.prototype.getSchemaId = function() {
      if (!this.rootSchema) {
        return null;
      }
      var path2 = [];
      if (this.parentReport) {
        path2 = path2.concat(this.parentReport.path);
      }
      path2 = path2.concat(this.path);
      while (path2.length > 0) {
        var obj = get(this.rootSchema, path2);
        if (obj && obj.id) {
          return obj.id;
        }
        path2.pop();
      }
      return this.rootSchema.id;
    };
    Report.prototype.hasError = function(errorCode, params) {
      var idx = this.errors.length;
      while (idx--) {
        if (this.errors[idx].code === errorCode) {
          var match = true;
          var idx2 = this.errors[idx].params.length;
          while (idx2--) {
            if (this.errors[idx].params[idx2] !== params[idx2]) {
              match = false;
            }
          }
          if (match) {
            return match;
          }
        }
      }
      return false;
    };
    Report.prototype.addError = function(errorCode, params, subReports, schema) {
      if (!errorCode) {
        throw new Error("No errorCode passed into addError()");
      }
      this.addCustomError(errorCode, Errors[errorCode], params, subReports, schema);
    };
    Report.prototype.getJson = function() {
      var self2 = this;
      while (self2.json === void 0) {
        self2 = self2.parentReport;
        if (self2 === void 0) {
          return void 0;
        }
      }
      return self2.json;
    };
    Report.prototype.addCustomError = function(errorCode, errorMessage, params, subReports, schema) {
      if (this.errors.length >= this.reportOptions.maxErrors) {
        return;
      }
      if (!errorMessage) {
        throw new Error("No errorMessage known for code " + errorCode);
      }
      params = params || [];
      var idx = params.length;
      while (idx--) {
        var whatIs = Utils.whatIs(params[idx]);
        var param = whatIs === "object" || whatIs === "null" ? JSON.stringify(params[idx]) : params[idx];
        errorMessage = errorMessage.replace("{" + idx + "}", param);
      }
      var err = {
        code: errorCode,
        params,
        message: errorMessage,
        path: this.getPath(this.options.reportPathAsArray),
        schemaId: this.getSchemaId()
      };
      err[Utils.schemaSymbol] = schema;
      err[Utils.jsonSymbol] = this.getJson();
      if (schema && typeof schema === "string") {
        err.description = schema;
      } else if (schema && typeof schema === "object") {
        if (schema.title) {
          err.title = schema.title;
        }
        if (schema.description) {
          err.description = schema.description;
        }
      }
      if (subReports != null) {
        if (!Array.isArray(subReports)) {
          subReports = [subReports];
        }
        err.inner = [];
        idx = subReports.length;
        while (idx--) {
          var subReport = subReports[idx], idx2 = subReport.errors.length;
          while (idx2--) {
            err.inner.push(subReport.errors[idx2]);
          }
        }
        if (err.inner.length === 0) {
          err.inner = void 0;
        }
      }
      this.errors.push(err);
    };
    module2.exports = Report;
  }
});

// node_modules/validator/lib/util/assertString.js
var require_assertString = __commonJS({
  "node_modules/validator/lib/util/assertString.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = assertString;
    function _typeof(obj) {
      "@babel/helpers - typeof";
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    function assertString(input) {
      var isString = typeof input === "string" || input instanceof String;
      if (!isString) {
        var invalidType = _typeof(input);
        if (input === null)
          invalidType = "null";
        else if (invalidType === "object")
          invalidType = input.constructor.name;
        throw new TypeError("Expected a string but received a ".concat(invalidType));
      }
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/toDate.js
var require_toDate = __commonJS({
  "node_modules/validator/lib/toDate.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toDate;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function toDate(date) {
      (0, _assertString.default)(date);
      date = Date.parse(date);
      return !isNaN(date) ? new Date(date) : null;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/alpha.js
var require_alpha = __commonJS({
  "node_modules/validator/lib/alpha.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.commaDecimal = exports.dotDecimal = exports.farsiLocales = exports.arabicLocales = exports.englishLocales = exports.decimal = exports.alphanumeric = exports.alpha = void 0;
    var alpha = {
      "en-US": /^[A-Z]+$/i,
      "az-AZ": /^[A-VXYZÇƏĞİıÖŞÜ]+$/i,
      "bg-BG": /^[А-Я]+$/i,
      "cs-CZ": /^[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i,
      "da-DK": /^[A-ZÆØÅ]+$/i,
      "de-DE": /^[A-ZÄÖÜß]+$/i,
      "el-GR": /^[Α-ώ]+$/i,
      "es-ES": /^[A-ZÁÉÍÑÓÚÜ]+$/i,
      "fa-IR": /^[ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی]+$/i,
      "fi-FI": /^[A-ZÅÄÖ]+$/i,
      "fr-FR": /^[A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
      "it-IT": /^[A-ZÀÉÈÌÎÓÒÙ]+$/i,
      "nb-NO": /^[A-ZÆØÅ]+$/i,
      "nl-NL": /^[A-ZÁÉËÏÓÖÜÚ]+$/i,
      "nn-NO": /^[A-ZÆØÅ]+$/i,
      "hu-HU": /^[A-ZÁÉÍÓÖŐÚÜŰ]+$/i,
      "pl-PL": /^[A-ZĄĆĘŚŁŃÓŻŹ]+$/i,
      "pt-PT": /^[A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i,
      "ru-RU": /^[А-ЯЁ]+$/i,
      "sl-SI": /^[A-ZČĆĐŠŽ]+$/i,
      "sk-SK": /^[A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i,
      "sr-RS@latin": /^[A-ZČĆŽŠĐ]+$/i,
      "sr-RS": /^[А-ЯЂЈЉЊЋЏ]+$/i,
      "sv-SE": /^[A-ZÅÄÖ]+$/i,
      "th-TH": /^[ก-๐\s]+$/i,
      "tr-TR": /^[A-ZÇĞİıÖŞÜ]+$/i,
      "uk-UA": /^[А-ЩЬЮЯЄIЇҐі]+$/i,
      "vi-VN": /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]+$/i,
      "ku-IQ": /^[ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i,
      ar: /^[ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/,
      he: /^[א-ת]+$/,
      fa: /^['آاءأؤئبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهةی']+$/i,
      "hi-IN": /^[\u0900-\u0961]+[\u0972-\u097F]*$/i
    };
    exports.alpha = alpha;
    var alphanumeric = {
      "en-US": /^[0-9A-Z]+$/i,
      "az-AZ": /^[0-9A-VXYZÇƏĞİıÖŞÜ]+$/i,
      "bg-BG": /^[0-9А-Я]+$/i,
      "cs-CZ": /^[0-9A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]+$/i,
      "da-DK": /^[0-9A-ZÆØÅ]+$/i,
      "de-DE": /^[0-9A-ZÄÖÜß]+$/i,
      "el-GR": /^[0-9Α-ω]+$/i,
      "es-ES": /^[0-9A-ZÁÉÍÑÓÚÜ]+$/i,
      "fi-FI": /^[0-9A-ZÅÄÖ]+$/i,
      "fr-FR": /^[0-9A-ZÀÂÆÇÉÈÊËÏÎÔŒÙÛÜŸ]+$/i,
      "it-IT": /^[0-9A-ZÀÉÈÌÎÓÒÙ]+$/i,
      "hu-HU": /^[0-9A-ZÁÉÍÓÖŐÚÜŰ]+$/i,
      "nb-NO": /^[0-9A-ZÆØÅ]+$/i,
      "nl-NL": /^[0-9A-ZÁÉËÏÓÖÜÚ]+$/i,
      "nn-NO": /^[0-9A-ZÆØÅ]+$/i,
      "pl-PL": /^[0-9A-ZĄĆĘŚŁŃÓŻŹ]+$/i,
      "pt-PT": /^[0-9A-ZÃÁÀÂÄÇÉÊËÍÏÕÓÔÖÚÜ]+$/i,
      "ru-RU": /^[0-9А-ЯЁ]+$/i,
      "sl-SI": /^[0-9A-ZČĆĐŠŽ]+$/i,
      "sk-SK": /^[0-9A-ZÁČĎÉÍŇÓŠŤÚÝŽĹŔĽÄÔ]+$/i,
      "sr-RS@latin": /^[0-9A-ZČĆŽŠĐ]+$/i,
      "sr-RS": /^[0-9А-ЯЂЈЉЊЋЏ]+$/i,
      "sv-SE": /^[0-9A-ZÅÄÖ]+$/i,
      "th-TH": /^[ก-๙\s]+$/i,
      "tr-TR": /^[0-9A-ZÇĞİıÖŞÜ]+$/i,
      "uk-UA": /^[0-9А-ЩЬЮЯЄIЇҐі]+$/i,
      "ku-IQ": /^[٠١٢٣٤٥٦٧٨٩0-9ئابپتجچحخدرڕزژسشعغفڤقکگلڵمنوۆھەیێيطؤثآإأكضصةظذ]+$/i,
      "vi-VN": /^[0-9A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ]+$/i,
      ar: /^[٠١٢٣٤٥٦٧٨٩0-9ءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْٰ]+$/,
      he: /^[0-9א-ת]+$/,
      fa: /^['0-9آاءأؤئبپتثجچحخدذرزژسشصضطظعغفقکگلمنوهةی۱۲۳۴۵۶۷۸۹۰']+$/i,
      "hi-IN": /^[\u0900-\u0963]+[\u0966-\u097F]*$/i
    };
    exports.alphanumeric = alphanumeric;
    var decimal = {
      "en-US": ".",
      ar: "\u066B"
    };
    exports.decimal = decimal;
    var englishLocales = ["AU", "GB", "HK", "IN", "NZ", "ZA", "ZM"];
    exports.englishLocales = englishLocales;
    for (i = 0; i < englishLocales.length; i++) {
      locale = "en-".concat(englishLocales[i]);
      alpha[locale] = alpha["en-US"];
      alphanumeric[locale] = alphanumeric["en-US"];
      decimal[locale] = decimal["en-US"];
    }
    var locale;
    var i;
    var arabicLocales = ["AE", "BH", "DZ", "EG", "IQ", "JO", "KW", "LB", "LY", "MA", "QM", "QA", "SA", "SD", "SY", "TN", "YE"];
    exports.arabicLocales = arabicLocales;
    for (_i = 0; _i < arabicLocales.length; _i++) {
      _locale = "ar-".concat(arabicLocales[_i]);
      alpha[_locale] = alpha.ar;
      alphanumeric[_locale] = alphanumeric.ar;
      decimal[_locale] = decimal.ar;
    }
    var _locale;
    var _i;
    var farsiLocales = ["IR", "AF"];
    exports.farsiLocales = farsiLocales;
    for (_i2 = 0; _i2 < farsiLocales.length; _i2++) {
      _locale2 = "fa-".concat(farsiLocales[_i2]);
      alphanumeric[_locale2] = alphanumeric.fa;
      decimal[_locale2] = decimal.ar;
    }
    var _locale2;
    var _i2;
    var dotDecimal = ["ar-EG", "ar-LB", "ar-LY"];
    exports.dotDecimal = dotDecimal;
    var commaDecimal = ["bg-BG", "cs-CZ", "da-DK", "de-DE", "el-GR", "en-ZM", "es-ES", "fr-CA", "fr-FR", "id-ID", "it-IT", "ku-IQ", "hi-IN", "hu-HU", "nb-NO", "nn-NO", "nl-NL", "pl-PL", "pt-PT", "ru-RU", "sl-SI", "sr-RS@latin", "sr-RS", "sv-SE", "tr-TR", "uk-UA", "vi-VN"];
    exports.commaDecimal = commaDecimal;
    for (_i3 = 0; _i3 < dotDecimal.length; _i3++) {
      decimal[dotDecimal[_i3]] = decimal["en-US"];
    }
    var _i3;
    for (_i4 = 0; _i4 < commaDecimal.length; _i4++) {
      decimal[commaDecimal[_i4]] = ",";
    }
    var _i4;
    alpha["fr-CA"] = alpha["fr-FR"];
    alphanumeric["fr-CA"] = alphanumeric["fr-FR"];
    alpha["pt-BR"] = alpha["pt-PT"];
    alphanumeric["pt-BR"] = alphanumeric["pt-PT"];
    decimal["pt-BR"] = decimal["pt-PT"];
    alpha["pl-Pl"] = alpha["pl-PL"];
    alphanumeric["pl-Pl"] = alphanumeric["pl-PL"];
    decimal["pl-Pl"] = decimal["pl-PL"];
    alpha["fa-AF"] = alpha.fa;
  }
});

// node_modules/validator/lib/isFloat.js
var require_isFloat = __commonJS({
  "node_modules/validator/lib/isFloat.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isFloat;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    var _alpha = require_alpha();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isFloat(str, options) {
      (0, _assertString.default)(str);
      options = options || {};
      var float = new RegExp("^(?:[-+])?(?:[0-9]+)?(?:\\".concat(options.locale ? _alpha.decimal[options.locale] : ".", "[0-9]*)?(?:[eE][\\+\\-]?(?:[0-9]+))?$"));
      if (str === "" || str === "." || str === "-" || str === "+") {
        return false;
      }
      var value = parseFloat(str.replace(",", "."));
      return float.test(str) && (!options.hasOwnProperty("min") || value >= options.min) && (!options.hasOwnProperty("max") || value <= options.max) && (!options.hasOwnProperty("lt") || value < options.lt) && (!options.hasOwnProperty("gt") || value > options.gt);
    }
    var locales = Object.keys(_alpha.decimal);
    exports.locales = locales;
  }
});

// node_modules/validator/lib/toFloat.js
var require_toFloat = __commonJS({
  "node_modules/validator/lib/toFloat.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toFloat;
    var _isFloat = _interopRequireDefault(require_isFloat());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function toFloat(str) {
      if (!(0, _isFloat.default)(str))
        return NaN;
      return parseFloat(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/toInt.js
var require_toInt = __commonJS({
  "node_modules/validator/lib/toInt.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toInt;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function toInt(str, radix) {
      (0, _assertString.default)(str);
      return parseInt(str, radix || 10);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/toBoolean.js
var require_toBoolean = __commonJS({
  "node_modules/validator/lib/toBoolean.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toBoolean;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function toBoolean(str, strict) {
      (0, _assertString.default)(str);
      if (strict) {
        return str === "1" || /^true$/i.test(str);
      }
      return str !== "0" && !/^false$/i.test(str) && str !== "";
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/equals.js
var require_equals = __commonJS({
  "node_modules/validator/lib/equals.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = equals;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function equals(str, comparison) {
      (0, _assertString.default)(str);
      return str === comparison;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/util/toString.js
var require_toString = __commonJS({
  "node_modules/validator/lib/util/toString.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = toString2;
    function _typeof(obj) {
      "@babel/helpers - typeof";
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    function toString2(input) {
      if (_typeof(input) === "object" && input !== null) {
        if (typeof input.toString === "function") {
          input = input.toString();
        } else {
          input = "[object Object]";
        }
      } else if (input === null || typeof input === "undefined" || isNaN(input) && !input.length) {
        input = "";
      }
      return String(input);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/util/merge.js
var require_merge = __commonJS({
  "node_modules/validator/lib/util/merge.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = merge;
    function merge() {
      var obj = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      var defaults = arguments.length > 1 ? arguments[1] : void 0;
      for (var key in defaults) {
        if (typeof obj[key] === "undefined") {
          obj[key] = defaults[key];
        }
      }
      return obj;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/contains.js
var require_contains = __commonJS({
  "node_modules/validator/lib/contains.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = contains;
    var _assertString = _interopRequireDefault(require_assertString());
    var _toString = _interopRequireDefault(require_toString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var defaulContainsOptions = {
      ignoreCase: false,
      minOccurrences: 1
    };
    function contains(str, elem, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, defaulContainsOptions);
      if (options.ignoreCase) {
        return str.toLowerCase().split((0, _toString.default)(elem).toLowerCase()).length > options.minOccurrences;
      }
      return str.split((0, _toString.default)(elem)).length > options.minOccurrences;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/matches.js
var require_matches = __commonJS({
  "node_modules/validator/lib/matches.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = matches;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function matches(str, pattern, modifiers) {
      (0, _assertString.default)(str);
      if (Object.prototype.toString.call(pattern) !== "[object RegExp]") {
        pattern = new RegExp(pattern, modifiers);
      }
      return pattern.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isByteLength.js
var require_isByteLength = __commonJS({
  "node_modules/validator/lib/isByteLength.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isByteLength;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    function isByteLength(str, options) {
      (0, _assertString.default)(str);
      var min;
      var max;
      if (_typeof(options) === "object") {
        min = options.min || 0;
        max = options.max;
      } else {
        min = arguments[1];
        max = arguments[2];
      }
      var len = encodeURI(str).split(/%..|./).length - 1;
      return len >= min && (typeof max === "undefined" || len <= max);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isFQDN.js
var require_isFQDN = __commonJS({
  "node_modules/validator/lib/isFQDN.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isFQDN;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var default_fqdn_options = {
      require_tld: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_numeric_tld: false,
      allow_wildcard: false
    };
    function isFQDN(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_fqdn_options);
      if (options.allow_trailing_dot && str[str.length - 1] === ".") {
        str = str.substring(0, str.length - 1);
      }
      if (options.allow_wildcard === true && str.indexOf("*.") === 0) {
        str = str.substring(2);
      }
      var parts = str.split(".");
      var tld = parts[parts.length - 1];
      if (options.require_tld) {
        if (parts.length < 2) {
          return false;
        }
        if (!/^([a-z\u00A1-\u00A8\u00AA-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]{2,}|xn[a-z0-9-]{2,})$/i.test(tld)) {
          return false;
        }
        if (/\s/.test(tld)) {
          return false;
        }
      }
      if (!options.allow_numeric_tld && /^\d+$/.test(tld)) {
        return false;
      }
      return parts.every(function(part) {
        if (part.length > 63) {
          return false;
        }
        if (!/^[a-z_\u00a1-\uffff0-9-]+$/i.test(part)) {
          return false;
        }
        if (/[\uff01-\uff5e]/.test(part)) {
          return false;
        }
        if (/^-|-$/.test(part)) {
          return false;
        }
        if (!options.allow_underscores && /_/.test(part)) {
          return false;
        }
        return true;
      });
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isIP.js
var require_isIP = __commonJS({
  "node_modules/validator/lib/isIP.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIP;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
    var IPv4AddressFormat = "(".concat(IPv4SegmentFormat, "[.]){3}").concat(IPv4SegmentFormat);
    var IPv4AddressRegExp = new RegExp("^".concat(IPv4AddressFormat, "$"));
    var IPv6SegmentFormat = "(?:[0-9a-fA-F]{1,4})";
    var IPv6AddressRegExp = new RegExp("^(" + "(?:".concat(IPv6SegmentFormat, ":){7}(?:").concat(IPv6SegmentFormat, "|:)|") + "(?:".concat(IPv6SegmentFormat, ":){6}(?:").concat(IPv4AddressFormat, "|:").concat(IPv6SegmentFormat, "|:)|") + "(?:".concat(IPv6SegmentFormat, ":){5}(?::").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,2}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){4}(?:(:").concat(IPv6SegmentFormat, "){0,1}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,3}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){3}(?:(:").concat(IPv6SegmentFormat, "){0,2}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,4}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){2}(?:(:").concat(IPv6SegmentFormat, "){0,3}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,5}|:)|") + "(?:".concat(IPv6SegmentFormat, ":){1}(?:(:").concat(IPv6SegmentFormat, "){0,4}:").concat(IPv4AddressFormat, "|(:").concat(IPv6SegmentFormat, "){1,6}|:)|") + "(?::((?::".concat(IPv6SegmentFormat, "){0,5}:").concat(IPv4AddressFormat, "|(?::").concat(IPv6SegmentFormat, "){1,7}|:))") + ")(%[0-9a-zA-Z-.:]{1,})?$");
    function isIP(str) {
      var version = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
      (0, _assertString.default)(str);
      version = String(version);
      if (!version) {
        return isIP(str, 4) || isIP(str, 6);
      }
      if (version === "4") {
        if (!IPv4AddressRegExp.test(str)) {
          return false;
        }
        var parts = str.split(".").sort(function(a, b) {
          return a - b;
        });
        return parts[3] <= 255;
      }
      if (version === "6") {
        return !!IPv6AddressRegExp.test(str);
      }
      return false;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isEmail.js
var require_isEmail = __commonJS({
  "node_modules/validator/lib/isEmail.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEmail;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    var _isByteLength = _interopRequireDefault(require_isByteLength());
    var _isFQDN = _interopRequireDefault(require_isFQDN());
    var _isIP = _interopRequireDefault(require_isIP());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var default_email_options = {
      allow_display_name: false,
      require_display_name: false,
      allow_utf8_local_part: true,
      require_tld: true,
      blacklisted_chars: "",
      ignore_max_length: false,
      host_blacklist: []
    };
    var splitNameAddress = /^([^\x00-\x1F\x7F-\x9F\cX]+)</i;
    var emailUserPart = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~]+$/i;
    var gmailUserPart = /^[a-z\d]+$/;
    var quotedEmailUser = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f]))*$/i;
    var emailUserUtf8Part = /^[a-z\d!#\$%&'\*\+\-\/=\?\^_`{\|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+$/i;
    var quotedEmailUserUtf8 = /^([\s\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*$/i;
    var defaultMaxEmailLength = 254;
    function validateDisplayName(display_name) {
      var display_name_without_quotes = display_name.replace(/^"(.+)"$/, "$1");
      if (!display_name_without_quotes.trim()) {
        return false;
      }
      var contains_illegal = /[\.";<>]/.test(display_name_without_quotes);
      if (contains_illegal) {
        if (display_name_without_quotes === display_name) {
          return false;
        }
        var all_start_with_back_slash = display_name_without_quotes.split('"').length === display_name_without_quotes.split('\\"').length;
        if (!all_start_with_back_slash) {
          return false;
        }
      }
      return true;
    }
    function isEmail(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_email_options);
      if (options.require_display_name || options.allow_display_name) {
        var display_email = str.match(splitNameAddress);
        if (display_email) {
          var display_name = display_email[1];
          str = str.replace(display_name, "").replace(/(^<|>$)/g, "");
          if (display_name.endsWith(" ")) {
            display_name = display_name.substr(0, display_name.length - 1);
          }
          if (!validateDisplayName(display_name)) {
            return false;
          }
        } else if (options.require_display_name) {
          return false;
        }
      }
      if (!options.ignore_max_length && str.length > defaultMaxEmailLength) {
        return false;
      }
      var parts = str.split("@");
      var domain = parts.pop();
      var lower_domain = domain.toLowerCase();
      if (options.host_blacklist.includes(lower_domain)) {
        return false;
      }
      var user = parts.join("@");
      if (options.domain_specific_validation && (lower_domain === "gmail.com" || lower_domain === "googlemail.com")) {
        user = user.toLowerCase();
        var username = user.split("+")[0];
        if (!(0, _isByteLength.default)(username.replace(/\./g, ""), {
          min: 6,
          max: 30
        })) {
          return false;
        }
        var _user_parts = username.split(".");
        for (var i = 0; i < _user_parts.length; i++) {
          if (!gmailUserPart.test(_user_parts[i])) {
            return false;
          }
        }
      }
      if (options.ignore_max_length === false && (!(0, _isByteLength.default)(user, {
        max: 64
      }) || !(0, _isByteLength.default)(domain, {
        max: 254
      }))) {
        return false;
      }
      if (!(0, _isFQDN.default)(domain, {
        require_tld: options.require_tld
      })) {
        if (!options.allow_ip_domain) {
          return false;
        }
        if (!(0, _isIP.default)(domain)) {
          if (!domain.startsWith("[") || !domain.endsWith("]")) {
            return false;
          }
          var noBracketdomain = domain.substr(1, domain.length - 2);
          if (noBracketdomain.length === 0 || !(0, _isIP.default)(noBracketdomain)) {
            return false;
          }
        }
      }
      if (user[0] === '"') {
        user = user.slice(1, user.length - 1);
        return options.allow_utf8_local_part ? quotedEmailUserUtf8.test(user) : quotedEmailUser.test(user);
      }
      var pattern = options.allow_utf8_local_part ? emailUserUtf8Part : emailUserPart;
      var user_parts = user.split(".");
      for (var _i = 0; _i < user_parts.length; _i++) {
        if (!pattern.test(user_parts[_i])) {
          return false;
        }
      }
      if (options.blacklisted_chars) {
        if (user.search(new RegExp("[".concat(options.blacklisted_chars, "]+"), "g")) !== -1)
          return false;
      }
      return true;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isURL.js
var require_isURL = __commonJS({
  "node_modules/validator/lib/isURL.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isURL;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isFQDN = _interopRequireDefault(require_isFQDN());
    var _isIP = _interopRequireDefault(require_isIP());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o)
        return;
      if (typeof o === "string")
        return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor)
        n = o.constructor.name;
      if (n === "Map" || n === "Set")
        return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
        return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length)
        len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    function _iterableToArrayLimit(arr, i) {
      if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr)))
        return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = void 0;
      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i)
            break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null)
            _i["return"]();
        } finally {
          if (_d)
            throw _e;
        }
      }
      return _arr;
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr))
        return arr;
    }
    var default_url_options = {
      protocols: ["http", "https", "ftp"],
      require_tld: true,
      require_protocol: false,
      require_host: true,
      require_port: false,
      require_valid_protocol: true,
      allow_underscores: false,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false,
      allow_fragments: true,
      allow_query_components: true,
      validate_length: true
    };
    var wrapped_ipv6 = /^\[([^\]]+)\](?::([0-9]+))?$/;
    function isRegExp(obj) {
      return Object.prototype.toString.call(obj) === "[object RegExp]";
    }
    function checkHost(host, matches) {
      for (var i = 0; i < matches.length; i++) {
        var match = matches[i];
        if (host === match || isRegExp(match) && match.test(host)) {
          return true;
        }
      }
      return false;
    }
    function isURL(url, options) {
      (0, _assertString.default)(url);
      if (!url || /[\s<>]/.test(url)) {
        return false;
      }
      if (url.indexOf("mailto:") === 0) {
        return false;
      }
      options = (0, _merge.default)(options, default_url_options);
      if (options.validate_length && url.length >= 2083) {
        return false;
      }
      if (!options.allow_fragments && url.includes("#")) {
        return false;
      }
      if (!options.allow_query_components && (url.includes("?") || url.includes("&"))) {
        return false;
      }
      var protocol, auth, host, hostname, port, port_str, split, ipv6;
      split = url.split("#");
      url = split.shift();
      split = url.split("?");
      url = split.shift();
      split = url.split("://");
      if (split.length > 1) {
        protocol = split.shift().toLowerCase();
        if (options.require_valid_protocol && options.protocols.indexOf(protocol) === -1) {
          return false;
        }
      } else if (options.require_protocol) {
        return false;
      } else if (url.substr(0, 2) === "//") {
        if (!options.allow_protocol_relative_urls) {
          return false;
        }
        split[0] = url.substr(2);
      }
      url = split.join("://");
      if (url === "") {
        return false;
      }
      split = url.split("/");
      url = split.shift();
      if (url === "" && !options.require_host) {
        return true;
      }
      split = url.split("@");
      if (split.length > 1) {
        if (options.disallow_auth) {
          return false;
        }
        if (split[0] === "") {
          return false;
        }
        auth = split.shift();
        if (auth.indexOf(":") >= 0 && auth.split(":").length > 2) {
          return false;
        }
        var _auth$split = auth.split(":"), _auth$split2 = _slicedToArray(_auth$split, 2), user = _auth$split2[0], password = _auth$split2[1];
        if (user === "" && password === "") {
          return false;
        }
      }
      hostname = split.join("@");
      port_str = null;
      ipv6 = null;
      var ipv6_match = hostname.match(wrapped_ipv6);
      if (ipv6_match) {
        host = "";
        ipv6 = ipv6_match[1];
        port_str = ipv6_match[2] || null;
      } else {
        split = hostname.split(":");
        host = split.shift();
        if (split.length) {
          port_str = split.join(":");
        }
      }
      if (port_str !== null && port_str.length > 0) {
        port = parseInt(port_str, 10);
        if (!/^[0-9]+$/.test(port_str) || port <= 0 || port > 65535) {
          return false;
        }
      } else if (options.require_port) {
        return false;
      }
      if (options.host_whitelist) {
        return checkHost(host, options.host_whitelist);
      }
      if (!(0, _isIP.default)(host) && !(0, _isFQDN.default)(host, options) && (!ipv6 || !(0, _isIP.default)(ipv6, 6))) {
        return false;
      }
      host = host || ipv6;
      if (options.host_blacklist && checkHost(host, options.host_blacklist)) {
        return false;
      }
      return true;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isMACAddress.js
var require_isMACAddress = __commonJS({
  "node_modules/validator/lib/isMACAddress.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMACAddress;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var macAddress = /^(?:[0-9a-fA-F]{2}([-:\s]))([0-9a-fA-F]{2}\1){4}([0-9a-fA-F]{2})$/;
    var macAddressNoSeparators = /^([0-9a-fA-F]){12}$/;
    var macAddressWithDots = /^([0-9a-fA-F]{4}\.){2}([0-9a-fA-F]{4})$/;
    function isMACAddress(str, options) {
      (0, _assertString.default)(str);
      if (options && (options.no_colons || options.no_separators)) {
        return macAddressNoSeparators.test(str);
      }
      return macAddress.test(str) || macAddressWithDots.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isIPRange.js
var require_isIPRange = __commonJS({
  "node_modules/validator/lib/isIPRange.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIPRange;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isIP = _interopRequireDefault(require_isIP());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var subnetMaybe = /^\d{1,3}$/;
    var v4Subnet = 32;
    var v6Subnet = 128;
    function isIPRange(str) {
      var version = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
      (0, _assertString.default)(str);
      var parts = str.split("/");
      if (parts.length !== 2) {
        return false;
      }
      if (!subnetMaybe.test(parts[1])) {
        return false;
      }
      if (parts[1].length > 1 && parts[1].startsWith("0")) {
        return false;
      }
      var isValidIP = (0, _isIP.default)(parts[0], version);
      if (!isValidIP) {
        return false;
      }
      var expectedSubnet = null;
      switch (String(version)) {
        case "4":
          expectedSubnet = v4Subnet;
          break;
        case "6":
          expectedSubnet = v6Subnet;
          break;
        default:
          expectedSubnet = (0, _isIP.default)(parts[0], "6") ? v6Subnet : v4Subnet;
      }
      return parts[1] <= expectedSubnet && parts[1] >= 0;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isDate.js
var require_isDate = __commonJS({
  "node_modules/validator/lib/isDate.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDate;
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _iterableToArrayLimit(arr, i) {
      if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr)))
        return;
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = void 0;
      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);
          if (i && _arr.length === i)
            break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null)
            _i["return"]();
        } finally {
          if (_d)
            throw _e;
        }
      }
      return _arr;
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr))
        return arr;
    }
    function _createForOfIteratorHelper(o, allowArrayLike) {
      var it;
      if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
          if (it)
            o = it;
          var i = 0;
          var F = function F2() {
          };
          return { s: F, n: function n() {
            if (i >= o.length)
              return { done: true };
            return { done: false, value: o[i++] };
          }, e: function e(_e2) {
            throw _e2;
          }, f: F };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
      }
      var normalCompletion = true, didErr = false, err;
      return { s: function s() {
        it = o[Symbol.iterator]();
      }, n: function n() {
        var step = it.next();
        normalCompletion = step.done;
        return step;
      }, e: function e(_e3) {
        didErr = true;
        err = _e3;
      }, f: function f() {
        try {
          if (!normalCompletion && it.return != null)
            it.return();
        } finally {
          if (didErr)
            throw err;
        }
      } };
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o)
        return;
      if (typeof o === "string")
        return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor)
        n = o.constructor.name;
      if (n === "Map" || n === "Set")
        return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
        return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length)
        len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    var default_date_options = {
      format: "YYYY/MM/DD",
      delimiters: ["/", "-"],
      strictMode: false
    };
    function isValidFormat(format) {
      return /(^(y{4}|y{2})[.\/-](m{1,2})[.\/-](d{1,2})$)|(^(m{1,2})[.\/-](d{1,2})[.\/-]((y{4}|y{2})$))|(^(d{1,2})[.\/-](m{1,2})[.\/-]((y{4}|y{2})$))/gi.test(format);
    }
    function zip(date, format) {
      var zippedArr = [], len = Math.min(date.length, format.length);
      for (var i = 0; i < len; i++) {
        zippedArr.push([date[i], format[i]]);
      }
      return zippedArr;
    }
    function isDate(input, options) {
      if (typeof options === "string") {
        options = (0, _merge.default)({
          format: options
        }, default_date_options);
      } else {
        options = (0, _merge.default)(options, default_date_options);
      }
      if (typeof input === "string" && isValidFormat(options.format)) {
        var formatDelimiter = options.delimiters.find(function(delimiter) {
          return options.format.indexOf(delimiter) !== -1;
        });
        var dateDelimiter = options.strictMode ? formatDelimiter : options.delimiters.find(function(delimiter) {
          return input.indexOf(delimiter) !== -1;
        });
        var dateAndFormat = zip(input.split(dateDelimiter), options.format.toLowerCase().split(formatDelimiter));
        var dateObj = {};
        var _iterator = _createForOfIteratorHelper(dateAndFormat), _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done; ) {
            var _step$value = _slicedToArray(_step.value, 2), dateWord = _step$value[0], formatWord = _step$value[1];
            if (dateWord.length !== formatWord.length) {
              return false;
            }
            dateObj[formatWord.charAt(0)] = dateWord;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        return new Date("".concat(dateObj.m, "/").concat(dateObj.d, "/").concat(dateObj.y)).getDate() === +dateObj.d;
      }
      if (!options.strictMode) {
        return Object.prototype.toString.call(input) === "[object Date]" && isFinite(input);
      }
      return false;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isBoolean.js
var require_isBoolean = __commonJS({
  "node_modules/validator/lib/isBoolean.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBoolean;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var defaultOptions = {
      loose: false
    };
    var strictBooleans = ["true", "false", "1", "0"];
    var looseBooleans = [].concat(strictBooleans, ["yes", "no"]);
    function isBoolean(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : defaultOptions;
      (0, _assertString.default)(str);
      if (options.loose) {
        return looseBooleans.includes(str.toLowerCase());
      }
      return strictBooleans.includes(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isLocale.js
var require_isLocale = __commonJS({
  "node_modules/validator/lib/isLocale.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLocale;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var localeReg = /^[A-Za-z]{2,4}([_-]([A-Za-z]{4}|[\d]{3}))?([_-]([A-Za-z]{2}|[\d]{3}))?$/;
    function isLocale(str) {
      (0, _assertString.default)(str);
      if (str === "en_US_POSIX" || str === "ca_ES_VALENCIA") {
        return true;
      }
      return localeReg.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isAlpha.js
var require_isAlpha = __commonJS({
  "node_modules/validator/lib/isAlpha.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAlpha;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    var _alpha = require_alpha();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isAlpha(_str) {
      var locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "en-US";
      var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      (0, _assertString.default)(_str);
      var str = _str;
      var ignore = options.ignore;
      if (ignore) {
        if (ignore instanceof RegExp) {
          str = str.replace(ignore, "");
        } else if (typeof ignore === "string") {
          str = str.replace(new RegExp("[".concat(ignore.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, "\\$&"), "]"), "g"), "");
        } else {
          throw new Error("ignore should be instance of a String or RegExp");
        }
      }
      if (locale in _alpha.alpha) {
        return _alpha.alpha[locale].test(str);
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    var locales = Object.keys(_alpha.alpha);
    exports.locales = locales;
  }
});

// node_modules/validator/lib/isAlphanumeric.js
var require_isAlphanumeric = __commonJS({
  "node_modules/validator/lib/isAlphanumeric.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAlphanumeric;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    var _alpha = require_alpha();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isAlphanumeric(_str) {
      var locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "en-US";
      var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      (0, _assertString.default)(_str);
      var str = _str;
      var ignore = options.ignore;
      if (ignore) {
        if (ignore instanceof RegExp) {
          str = str.replace(ignore, "");
        } else if (typeof ignore === "string") {
          str = str.replace(new RegExp("[".concat(ignore.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, "\\$&"), "]"), "g"), "");
        } else {
          throw new Error("ignore should be instance of a String or RegExp");
        }
      }
      if (locale in _alpha.alphanumeric) {
        return _alpha.alphanumeric[locale].test(str);
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    var locales = Object.keys(_alpha.alphanumeric);
    exports.locales = locales;
  }
});

// node_modules/validator/lib/isNumeric.js
var require_isNumeric = __commonJS({
  "node_modules/validator/lib/isNumeric.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isNumeric;
    var _assertString = _interopRequireDefault(require_assertString());
    var _alpha = require_alpha();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var numericNoSymbols = /^[0-9]+$/;
    function isNumeric(str, options) {
      (0, _assertString.default)(str);
      if (options && options.no_symbols) {
        return numericNoSymbols.test(str);
      }
      return new RegExp("^[+-]?([0-9]*[".concat((options || {}).locale ? _alpha.decimal[options.locale] : ".", "])?[0-9]+$")).test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isPassportNumber.js
var require_isPassportNumber = __commonJS({
  "node_modules/validator/lib/isPassportNumber.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isPassportNumber;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var passportRegexByCountryCode = {
      AM: /^[A-Z]{2}\d{7}$/,
      AR: /^[A-Z]{3}\d{6}$/,
      AT: /^[A-Z]\d{7}$/,
      AU: /^[A-Z]\d{7}$/,
      BE: /^[A-Z]{2}\d{6}$/,
      BG: /^\d{9}$/,
      BR: /^[A-Z]{2}\d{6}$/,
      BY: /^[A-Z]{2}\d{7}$/,
      CA: /^[A-Z]{2}\d{6}$/,
      CH: /^[A-Z]\d{7}$/,
      CN: /^G\d{8}$|^E(?![IO])[A-Z0-9]\d{7}$/,
      CY: /^[A-Z](\d{6}|\d{8})$/,
      CZ: /^\d{8}$/,
      DE: /^[CFGHJKLMNPRTVWXYZ0-9]{9}$/,
      DK: /^\d{9}$/,
      DZ: /^\d{9}$/,
      EE: /^([A-Z]\d{7}|[A-Z]{2}\d{7})$/,
      ES: /^[A-Z0-9]{2}([A-Z0-9]?)\d{6}$/,
      FI: /^[A-Z]{2}\d{7}$/,
      FR: /^\d{2}[A-Z]{2}\d{5}$/,
      GB: /^\d{9}$/,
      GR: /^[A-Z]{2}\d{7}$/,
      HR: /^\d{9}$/,
      HU: /^[A-Z]{2}(\d{6}|\d{7})$/,
      IE: /^[A-Z0-9]{2}\d{7}$/,
      IN: /^[A-Z]{1}-?\d{7}$/,
      ID: /^[A-C]\d{7}$/,
      IR: /^[A-Z]\d{8}$/,
      IS: /^(A)\d{7}$/,
      IT: /^[A-Z0-9]{2}\d{7}$/,
      JP: /^[A-Z]{2}\d{7}$/,
      KR: /^[MS]\d{8}$/,
      LT: /^[A-Z0-9]{8}$/,
      LU: /^[A-Z0-9]{8}$/,
      LV: /^[A-Z0-9]{2}\d{7}$/,
      LY: /^[A-Z0-9]{8}$/,
      MT: /^\d{7}$/,
      MZ: /^([A-Z]{2}\d{7})|(\d{2}[A-Z]{2}\d{5})$/,
      MY: /^[AHK]\d{8}$/,
      NL: /^[A-Z]{2}[A-Z0-9]{6}\d$/,
      PL: /^[A-Z]{2}\d{7}$/,
      PT: /^[A-Z]\d{6}$/,
      RO: /^\d{8,9}$/,
      RU: /^\d{9}$/,
      SE: /^\d{8}$/,
      SL: /^(P)[A-Z]\d{7}$/,
      SK: /^[0-9A-Z]\d{7}$/,
      TR: /^[A-Z]\d{8}$/,
      UA: /^[A-Z]{2}\d{6}$/,
      US: /^\d{9}$/
    };
    function isPassportNumber(str, countryCode) {
      (0, _assertString.default)(str);
      var normalizedStr = str.replace(/\s/g, "").toUpperCase();
      return countryCode.toUpperCase() in passportRegexByCountryCode && passportRegexByCountryCode[countryCode].test(normalizedStr);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isInt.js
var require_isInt = __commonJS({
  "node_modules/validator/lib/isInt.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isInt;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
    var intLeadingZeroes = /^[-+]?[0-9]+$/;
    function isInt(str, options) {
      (0, _assertString.default)(str);
      options = options || {};
      var regex = options.hasOwnProperty("allow_leading_zeroes") && !options.allow_leading_zeroes ? int : intLeadingZeroes;
      var minCheckPassed = !options.hasOwnProperty("min") || str >= options.min;
      var maxCheckPassed = !options.hasOwnProperty("max") || str <= options.max;
      var ltCheckPassed = !options.hasOwnProperty("lt") || str < options.lt;
      var gtCheckPassed = !options.hasOwnProperty("gt") || str > options.gt;
      return regex.test(str) && minCheckPassed && maxCheckPassed && ltCheckPassed && gtCheckPassed;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isPort.js
var require_isPort = __commonJS({
  "node_modules/validator/lib/isPort.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isPort;
    var _isInt = _interopRequireDefault(require_isInt());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isPort(str) {
      return (0, _isInt.default)(str, {
        min: 0,
        max: 65535
      });
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isLowercase.js
var require_isLowercase = __commonJS({
  "node_modules/validator/lib/isLowercase.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLowercase;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isLowercase(str) {
      (0, _assertString.default)(str);
      return str === str.toLowerCase();
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isUppercase.js
var require_isUppercase = __commonJS({
  "node_modules/validator/lib/isUppercase.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isUppercase;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isUppercase(str) {
      (0, _assertString.default)(str);
      return str === str.toUpperCase();
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isIMEI.js
var require_isIMEI = __commonJS({
  "node_modules/validator/lib/isIMEI.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIMEI;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var imeiRegexWithoutHypens = /^[0-9]{15}$/;
    var imeiRegexWithHypens = /^\d{2}-\d{6}-\d{6}-\d{1}$/;
    function isIMEI(str, options) {
      (0, _assertString.default)(str);
      options = options || {};
      var imeiRegex = imeiRegexWithoutHypens;
      if (options.allow_hyphens) {
        imeiRegex = imeiRegexWithHypens;
      }
      if (!imeiRegex.test(str)) {
        return false;
      }
      str = str.replace(/-/g, "");
      var sum = 0, mul = 2, l = 14;
      for (var i = 0; i < l; i++) {
        var digit = str.substring(l - i - 1, l - i);
        var tp = parseInt(digit, 10) * mul;
        if (tp >= 10) {
          sum += tp % 10 + 1;
        } else {
          sum += tp;
        }
        if (mul === 1) {
          mul += 1;
        } else {
          mul -= 1;
        }
      }
      var chk = (10 - sum % 10) % 10;
      if (chk !== parseInt(str.substring(14, 15), 10)) {
        return false;
      }
      return true;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isAscii.js
var require_isAscii = __commonJS({
  "node_modules/validator/lib/isAscii.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAscii;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var ascii = /^[\x00-\x7F]+$/;
    function isAscii(str) {
      (0, _assertString.default)(str);
      return ascii.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isFullWidth.js
var require_isFullWidth = __commonJS({
  "node_modules/validator/lib/isFullWidth.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isFullWidth;
    exports.fullWidth = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
    exports.fullWidth = fullWidth;
    function isFullWidth(str) {
      (0, _assertString.default)(str);
      return fullWidth.test(str);
    }
  }
});

// node_modules/validator/lib/isHalfWidth.js
var require_isHalfWidth = __commonJS({
  "node_modules/validator/lib/isHalfWidth.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHalfWidth;
    exports.halfWidth = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var halfWidth = /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;
    exports.halfWidth = halfWidth;
    function isHalfWidth(str) {
      (0, _assertString.default)(str);
      return halfWidth.test(str);
    }
  }
});

// node_modules/validator/lib/isVariableWidth.js
var require_isVariableWidth = __commonJS({
  "node_modules/validator/lib/isVariableWidth.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isVariableWidth;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isFullWidth = require_isFullWidth();
    var _isHalfWidth = require_isHalfWidth();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isVariableWidth(str) {
      (0, _assertString.default)(str);
      return _isFullWidth.fullWidth.test(str) && _isHalfWidth.halfWidth.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isMultibyte.js
var require_isMultibyte = __commonJS({
  "node_modules/validator/lib/isMultibyte.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMultibyte;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var multibyte = /[^\x00-\x7F]/;
    function isMultibyte(str) {
      (0, _assertString.default)(str);
      return multibyte.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/util/multilineRegex.js
var require_multilineRegex = __commonJS({
  "node_modules/validator/lib/util/multilineRegex.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = multilineRegexp;
    function multilineRegexp(parts, flags) {
      var regexpAsStringLiteral = parts.join("");
      return new RegExp(regexpAsStringLiteral, flags);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isSemVer.js
var require_isSemVer = __commonJS({
  "node_modules/validator/lib/isSemVer.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isSemVer;
    var _assertString = _interopRequireDefault(require_assertString());
    var _multilineRegex = _interopRequireDefault(require_multilineRegex());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var semanticVersioningRegex = (0, _multilineRegex.default)(["^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)", "(?:-((?:0|[1-9]\\d*|\\d*[a-z-][0-9a-z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-z-][0-9a-z-]*))*))", "?(?:\\+([0-9a-z-]+(?:\\.[0-9a-z-]+)*))?$"], "i");
    function isSemVer(str) {
      (0, _assertString.default)(str);
      return semanticVersioningRegex.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isSurrogatePair.js
var require_isSurrogatePair = __commonJS({
  "node_modules/validator/lib/isSurrogatePair.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isSurrogatePair;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var surrogatePair = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
    function isSurrogatePair(str) {
      (0, _assertString.default)(str);
      return surrogatePair.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/util/includes.js
var require_includes = __commonJS({
  "node_modules/validator/lib/util/includes.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var includes = function includes2(arr, val) {
      return arr.some(function(arrVal) {
        return val === arrVal;
      });
    };
    var _default = includes;
    exports.default = _default;
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isDecimal.js
var require_isDecimal = __commonJS({
  "node_modules/validator/lib/isDecimal.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDecimal;
    var _merge = _interopRequireDefault(require_merge());
    var _assertString = _interopRequireDefault(require_assertString());
    var _includes = _interopRequireDefault(require_includes());
    var _alpha = require_alpha();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function decimalRegExp(options) {
      var regExp = new RegExp("^[-+]?([0-9]+)?(\\".concat(_alpha.decimal[options.locale], "[0-9]{").concat(options.decimal_digits, "})").concat(options.force_decimal ? "" : "?", "$"));
      return regExp;
    }
    var default_decimal_options = {
      force_decimal: false,
      decimal_digits: "1,",
      locale: "en-US"
    };
    var blacklist = ["", "-", "+"];
    function isDecimal(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_decimal_options);
      if (options.locale in _alpha.decimal) {
        return !(0, _includes.default)(blacklist, str.replace(/ /g, "")) && decimalRegExp(options).test(str);
      }
      throw new Error("Invalid locale '".concat(options.locale, "'"));
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isHexadecimal.js
var require_isHexadecimal = __commonJS({
  "node_modules/validator/lib/isHexadecimal.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHexadecimal;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var hexadecimal = /^(0x|0h)?[0-9A-F]+$/i;
    function isHexadecimal(str) {
      (0, _assertString.default)(str);
      return hexadecimal.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isOctal.js
var require_isOctal = __commonJS({
  "node_modules/validator/lib/isOctal.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isOctal;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var octal = /^(0o)?[0-7]+$/i;
    function isOctal(str) {
      (0, _assertString.default)(str);
      return octal.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isDivisibleBy.js
var require_isDivisibleBy = __commonJS({
  "node_modules/validator/lib/isDivisibleBy.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDivisibleBy;
    var _assertString = _interopRequireDefault(require_assertString());
    var _toFloat = _interopRequireDefault(require_toFloat());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isDivisibleBy(str, num) {
      (0, _assertString.default)(str);
      return (0, _toFloat.default)(str) % parseInt(num, 10) === 0;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isHexColor.js
var require_isHexColor = __commonJS({
  "node_modules/validator/lib/isHexColor.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHexColor;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var hexcolor = /^#?([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i;
    function isHexColor(str) {
      (0, _assertString.default)(str);
      return hexcolor.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isRgbColor.js
var require_isRgbColor = __commonJS({
  "node_modules/validator/lib/isRgbColor.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isRgbColor;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var rgbColor = /^rgb\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){2}([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\)$/;
    var rgbaColor = /^rgba\((([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5]),){3}(0?\.\d|1(\.0)?|0(\.0)?)\)$/;
    var rgbColorPercent = /^rgb\((([0-9]%|[1-9][0-9]%|100%),){2}([0-9]%|[1-9][0-9]%|100%)\)/;
    var rgbaColorPercent = /^rgba\((([0-9]%|[1-9][0-9]%|100%),){3}(0?\.\d|1(\.0)?|0(\.0)?)\)/;
    function isRgbColor(str) {
      var includePercentValues = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
      (0, _assertString.default)(str);
      if (!includePercentValues) {
        return rgbColor.test(str) || rgbaColor.test(str);
      }
      return rgbColor.test(str) || rgbaColor.test(str) || rgbColorPercent.test(str) || rgbaColorPercent.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isHSL.js
var require_isHSL = __commonJS({
  "node_modules/validator/lib/isHSL.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHSL;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var hslComma = /^hsla?\(((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn)?(,(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}(,((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?))?\)$/i;
    var hslSpace = /^hsla?\(((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?))(deg|grad|rad|turn)?(\s(\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%){2}\s?(\/\s((\+|\-)?([0-9]+(\.[0-9]+)?(e(\+|\-)?[0-9]+)?|\.[0-9]+(e(\+|\-)?[0-9]+)?)%?)\s?)?\)$/i;
    function isHSL(str) {
      (0, _assertString.default)(str);
      var strippedStr = str.replace(/\s+/g, " ").replace(/\s?(hsla?\(|\)|,)\s?/ig, "$1");
      if (strippedStr.indexOf(",") !== -1) {
        return hslComma.test(strippedStr);
      }
      return hslSpace.test(strippedStr);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isISRC.js
var require_isISRC = __commonJS({
  "node_modules/validator/lib/isISRC.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISRC;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var isrc = /^[A-Z]{2}[0-9A-Z]{3}\d{2}\d{5}$/;
    function isISRC(str) {
      (0, _assertString.default)(str);
      return isrc.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isIBAN.js
var require_isIBAN = __commonJS({
  "node_modules/validator/lib/isIBAN.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIBAN;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var ibanRegexThroughCountryCode = {
      AD: /^(AD[0-9]{2})\d{8}[A-Z0-9]{12}$/,
      AE: /^(AE[0-9]{2})\d{3}\d{16}$/,
      AL: /^(AL[0-9]{2})\d{8}[A-Z0-9]{16}$/,
      AT: /^(AT[0-9]{2})\d{16}$/,
      AZ: /^(AZ[0-9]{2})[A-Z0-9]{4}\d{20}$/,
      BA: /^(BA[0-9]{2})\d{16}$/,
      BE: /^(BE[0-9]{2})\d{12}$/,
      BG: /^(BG[0-9]{2})[A-Z]{4}\d{6}[A-Z0-9]{8}$/,
      BH: /^(BH[0-9]{2})[A-Z]{4}[A-Z0-9]{14}$/,
      BR: /^(BR[0-9]{2})\d{23}[A-Z]{1}[A-Z0-9]{1}$/,
      BY: /^(BY[0-9]{2})[A-Z0-9]{4}\d{20}$/,
      CH: /^(CH[0-9]{2})\d{5}[A-Z0-9]{12}$/,
      CR: /^(CR[0-9]{2})\d{18}$/,
      CY: /^(CY[0-9]{2})\d{8}[A-Z0-9]{16}$/,
      CZ: /^(CZ[0-9]{2})\d{20}$/,
      DE: /^(DE[0-9]{2})\d{18}$/,
      DK: /^(DK[0-9]{2})\d{14}$/,
      DO: /^(DO[0-9]{2})[A-Z]{4}\d{20}$/,
      EE: /^(EE[0-9]{2})\d{16}$/,
      EG: /^(EG[0-9]{2})\d{25}$/,
      ES: /^(ES[0-9]{2})\d{20}$/,
      FI: /^(FI[0-9]{2})\d{14}$/,
      FO: /^(FO[0-9]{2})\d{14}$/,
      FR: /^(FR[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/,
      GB: /^(GB[0-9]{2})[A-Z]{4}\d{14}$/,
      GE: /^(GE[0-9]{2})[A-Z0-9]{2}\d{16}$/,
      GI: /^(GI[0-9]{2})[A-Z]{4}[A-Z0-9]{15}$/,
      GL: /^(GL[0-9]{2})\d{14}$/,
      GR: /^(GR[0-9]{2})\d{7}[A-Z0-9]{16}$/,
      GT: /^(GT[0-9]{2})[A-Z0-9]{4}[A-Z0-9]{20}$/,
      HR: /^(HR[0-9]{2})\d{17}$/,
      HU: /^(HU[0-9]{2})\d{24}$/,
      IE: /^(IE[0-9]{2})[A-Z0-9]{4}\d{14}$/,
      IL: /^(IL[0-9]{2})\d{19}$/,
      IQ: /^(IQ[0-9]{2})[A-Z]{4}\d{15}$/,
      IR: /^(IR[0-9]{2})0\d{2}0\d{18}$/,
      IS: /^(IS[0-9]{2})\d{22}$/,
      IT: /^(IT[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/,
      JO: /^(JO[0-9]{2})[A-Z]{4}\d{22}$/,
      KW: /^(KW[0-9]{2})[A-Z]{4}[A-Z0-9]{22}$/,
      KZ: /^(KZ[0-9]{2})\d{3}[A-Z0-9]{13}$/,
      LB: /^(LB[0-9]{2})\d{4}[A-Z0-9]{20}$/,
      LC: /^(LC[0-9]{2})[A-Z]{4}[A-Z0-9]{24}$/,
      LI: /^(LI[0-9]{2})\d{5}[A-Z0-9]{12}$/,
      LT: /^(LT[0-9]{2})\d{16}$/,
      LU: /^(LU[0-9]{2})\d{3}[A-Z0-9]{13}$/,
      LV: /^(LV[0-9]{2})[A-Z]{4}[A-Z0-9]{13}$/,
      MC: /^(MC[0-9]{2})\d{10}[A-Z0-9]{11}\d{2}$/,
      MD: /^(MD[0-9]{2})[A-Z0-9]{20}$/,
      ME: /^(ME[0-9]{2})\d{18}$/,
      MK: /^(MK[0-9]{2})\d{3}[A-Z0-9]{10}\d{2}$/,
      MR: /^(MR[0-9]{2})\d{23}$/,
      MT: /^(MT[0-9]{2})[A-Z]{4}\d{5}[A-Z0-9]{18}$/,
      MU: /^(MU[0-9]{2})[A-Z]{4}\d{19}[A-Z]{3}$/,
      MZ: /^(MZ[0-9]{2})\d{21}$/,
      NL: /^(NL[0-9]{2})[A-Z]{4}\d{10}$/,
      NO: /^(NO[0-9]{2})\d{11}$/,
      PK: /^(PK[0-9]{2})[A-Z0-9]{4}\d{16}$/,
      PL: /^(PL[0-9]{2})\d{24}$/,
      PS: /^(PS[0-9]{2})[A-Z0-9]{4}\d{21}$/,
      PT: /^(PT[0-9]{2})\d{21}$/,
      QA: /^(QA[0-9]{2})[A-Z]{4}[A-Z0-9]{21}$/,
      RO: /^(RO[0-9]{2})[A-Z]{4}[A-Z0-9]{16}$/,
      RS: /^(RS[0-9]{2})\d{18}$/,
      SA: /^(SA[0-9]{2})\d{2}[A-Z0-9]{18}$/,
      SC: /^(SC[0-9]{2})[A-Z]{4}\d{20}[A-Z]{3}$/,
      SE: /^(SE[0-9]{2})\d{20}$/,
      SI: /^(SI[0-9]{2})\d{15}$/,
      SK: /^(SK[0-9]{2})\d{20}$/,
      SM: /^(SM[0-9]{2})[A-Z]{1}\d{10}[A-Z0-9]{12}$/,
      SV: /^(SV[0-9]{2})[A-Z0-9]{4}\d{20}$/,
      TL: /^(TL[0-9]{2})\d{19}$/,
      TN: /^(TN[0-9]{2})\d{20}$/,
      TR: /^(TR[0-9]{2})\d{5}[A-Z0-9]{17}$/,
      UA: /^(UA[0-9]{2})\d{6}[A-Z0-9]{19}$/,
      VA: /^(VA[0-9]{2})\d{18}$/,
      VG: /^(VG[0-9]{2})[A-Z0-9]{4}\d{16}$/,
      XK: /^(XK[0-9]{2})\d{16}$/
    };
    function hasValidIbanFormat(str) {
      var strippedStr = str.replace(/[\s\-]+/gi, "").toUpperCase();
      var isoCountryCode = strippedStr.slice(0, 2).toUpperCase();
      return isoCountryCode in ibanRegexThroughCountryCode && ibanRegexThroughCountryCode[isoCountryCode].test(strippedStr);
    }
    function hasValidIbanChecksum(str) {
      var strippedStr = str.replace(/[^A-Z0-9]+/gi, "").toUpperCase();
      var rearranged = strippedStr.slice(4) + strippedStr.slice(0, 4);
      var alphaCapsReplacedWithDigits = rearranged.replace(/[A-Z]/g, function(char) {
        return char.charCodeAt(0) - 55;
      });
      var remainder = alphaCapsReplacedWithDigits.match(/\d{1,7}/g).reduce(function(acc, value) {
        return Number(acc + value) % 97;
      }, "");
      return remainder === 1;
    }
    function isIBAN(str) {
      (0, _assertString.default)(str);
      return hasValidIbanFormat(str) && hasValidIbanChecksum(str);
    }
    var locales = Object.keys(ibanRegexThroughCountryCode);
    exports.locales = locales;
  }
});

// node_modules/validator/lib/isISO31661Alpha2.js
var require_isISO31661Alpha2 = __commonJS({
  "node_modules/validator/lib/isISO31661Alpha2.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO31661Alpha2;
    exports.CountryCodes = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var validISO31661Alpha2CountriesCodes = new Set(["AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"]);
    function isISO31661Alpha2(str) {
      (0, _assertString.default)(str);
      return validISO31661Alpha2CountriesCodes.has(str.toUpperCase());
    }
    var CountryCodes = validISO31661Alpha2CountriesCodes;
    exports.CountryCodes = CountryCodes;
  }
});

// node_modules/validator/lib/isBIC.js
var require_isBIC = __commonJS({
  "node_modules/validator/lib/isBIC.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBIC;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isISO31661Alpha = require_isISO31661Alpha2();
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var isBICReg = /^[A-Za-z]{6}[A-Za-z0-9]{2}([A-Za-z0-9]{3})?$/;
    function isBIC(str) {
      (0, _assertString.default)(str);
      if (!_isISO31661Alpha.CountryCodes.has(str.slice(4, 6).toUpperCase())) {
        return false;
      }
      return isBICReg.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isMD5.js
var require_isMD5 = __commonJS({
  "node_modules/validator/lib/isMD5.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMD5;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var md5 = /^[a-f0-9]{32}$/;
    function isMD5(str) {
      (0, _assertString.default)(str);
      return md5.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isHash.js
var require_isHash = __commonJS({
  "node_modules/validator/lib/isHash.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isHash;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var lengths = {
      md5: 32,
      md4: 32,
      sha1: 40,
      sha256: 64,
      sha384: 96,
      sha512: 128,
      ripemd128: 32,
      ripemd160: 40,
      tiger128: 32,
      tiger160: 40,
      tiger192: 48,
      crc32: 8,
      crc32b: 8
    };
    function isHash(str, algorithm) {
      (0, _assertString.default)(str);
      var hash = new RegExp("^[a-fA-F0-9]{".concat(lengths[algorithm], "}$"));
      return hash.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isBase64.js
var require_isBase64 = __commonJS({
  "node_modules/validator/lib/isBase64.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBase64;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var notBase64 = /[^A-Z0-9+\/=]/i;
    var urlSafeBase64 = /^[A-Z0-9_\-]*$/i;
    var defaultBase64Options = {
      urlSafe: false
    };
    function isBase64(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, defaultBase64Options);
      var len = str.length;
      if (options.urlSafe) {
        return urlSafeBase64.test(str);
      }
      if (len % 4 !== 0 || notBase64.test(str)) {
        return false;
      }
      var firstPaddingChar = str.indexOf("=");
      return firstPaddingChar === -1 || firstPaddingChar === len - 1 || firstPaddingChar === len - 2 && str[len - 1] === "=";
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isJWT.js
var require_isJWT = __commonJS({
  "node_modules/validator/lib/isJWT.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isJWT;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isBase = _interopRequireDefault(require_isBase64());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isJWT(str) {
      (0, _assertString.default)(str);
      var dotSplit = str.split(".");
      var len = dotSplit.length;
      if (len > 3 || len < 2) {
        return false;
      }
      return dotSplit.reduce(function(acc, currElem) {
        return acc && (0, _isBase.default)(currElem, {
          urlSafe: true
        });
      }, true);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isJSON.js
var require_isJSON = __commonJS({
  "node_modules/validator/lib/isJSON.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isJSON;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    var default_json_options = {
      allow_primitives: false
    };
    function isJSON(str, options) {
      (0, _assertString.default)(str);
      try {
        options = (0, _merge.default)(options, default_json_options);
        var primitives = [];
        if (options.allow_primitives) {
          primitives = [null, false, true];
        }
        var obj = JSON.parse(str);
        return primitives.includes(obj) || !!obj && _typeof(obj) === "object";
      } catch (e) {
      }
      return false;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isEmpty.js
var require_isEmpty = __commonJS({
  "node_modules/validator/lib/isEmpty.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEmpty;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var default_is_empty_options = {
      ignore_whitespace: false
    };
    function isEmpty(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_is_empty_options);
      return (options.ignore_whitespace ? str.trim().length : str.length) === 0;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isLength.js
var require_isLength = __commonJS({
  "node_modules/validator/lib/isLength.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLength;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    function isLength(str, options) {
      (0, _assertString.default)(str);
      var min;
      var max;
      if (_typeof(options) === "object") {
        min = options.min || 0;
        max = options.max;
      } else {
        min = arguments[1] || 0;
        max = arguments[2];
      }
      var surrogatePairs = str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g) || [];
      var len = str.length - surrogatePairs.length;
      return len >= min && (typeof max === "undefined" || len <= max);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isUUID.js
var require_isUUID = __commonJS({
  "node_modules/validator/lib/isUUID.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isUUID;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var uuid = {
      1: /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
      2: /^[0-9A-F]{8}-[0-9A-F]{4}-2[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
      3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
      4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
    };
    function isUUID(str, version) {
      (0, _assertString.default)(str);
      var pattern = uuid[![void 0, null].includes(version) ? version : "all"];
      return !!pattern && pattern.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isMongoId.js
var require_isMongoId = __commonJS({
  "node_modules/validator/lib/isMongoId.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMongoId;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isHexadecimal = _interopRequireDefault(require_isHexadecimal());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isMongoId(str) {
      (0, _assertString.default)(str);
      return (0, _isHexadecimal.default)(str) && str.length === 24;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isAfter.js
var require_isAfter = __commonJS({
  "node_modules/validator/lib/isAfter.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isAfter;
    var _assertString = _interopRequireDefault(require_assertString());
    var _toDate = _interopRequireDefault(require_toDate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isAfter(str) {
      var date = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : String(new Date());
      (0, _assertString.default)(str);
      var comparison = (0, _toDate.default)(date);
      var original = (0, _toDate.default)(str);
      return !!(original && comparison && original > comparison);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isBefore.js
var require_isBefore = __commonJS({
  "node_modules/validator/lib/isBefore.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBefore;
    var _assertString = _interopRequireDefault(require_assertString());
    var _toDate = _interopRequireDefault(require_toDate());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isBefore(str) {
      var date = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : String(new Date());
      (0, _assertString.default)(str);
      var comparison = (0, _toDate.default)(date);
      var original = (0, _toDate.default)(str);
      return !!(original && comparison && original < comparison);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isIn.js
var require_isIn = __commonJS({
  "node_modules/validator/lib/isIn.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIn;
    var _assertString = _interopRequireDefault(require_assertString());
    var _toString = _interopRequireDefault(require_toString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _typeof(obj) {
      "@babel/helpers - typeof";
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    function isIn(str, options) {
      (0, _assertString.default)(str);
      var i;
      if (Object.prototype.toString.call(options) === "[object Array]") {
        var array = [];
        for (i in options) {
          if ({}.hasOwnProperty.call(options, i)) {
            array[i] = (0, _toString.default)(options[i]);
          }
        }
        return array.indexOf(str) >= 0;
      } else if (_typeof(options) === "object") {
        return options.hasOwnProperty(str);
      } else if (options && typeof options.indexOf === "function") {
        return options.indexOf(str) >= 0;
      }
      return false;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isCreditCard.js
var require_isCreditCard = __commonJS({
  "node_modules/validator/lib/isCreditCard.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isCreditCard;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var creditCard = /^(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|(222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}|6(?:011|5[0-9][0-9])[0-9]{12,15}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11}|6[27][0-9]{14}|^(81[0-9]{14,17}))$/;
    function isCreditCard(str) {
      (0, _assertString.default)(str);
      var sanitized = str.replace(/[- ]+/g, "");
      if (!creditCard.test(sanitized)) {
        return false;
      }
      var sum = 0;
      var digit;
      var tmpNum;
      var shouldDouble;
      for (var i = sanitized.length - 1; i >= 0; i--) {
        digit = sanitized.substring(i, i + 1);
        tmpNum = parseInt(digit, 10);
        if (shouldDouble) {
          tmpNum *= 2;
          if (tmpNum >= 10) {
            sum += tmpNum % 10 + 1;
          } else {
            sum += tmpNum;
          }
        } else {
          sum += tmpNum;
        }
        shouldDouble = !shouldDouble;
      }
      return !!(sum % 10 === 0 ? sanitized : false);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isIdentityCard.js
var require_isIdentityCard = __commonJS({
  "node_modules/validator/lib/isIdentityCard.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isIdentityCard;
    var _assertString = _interopRequireDefault(require_assertString());
    var _isInt = _interopRequireDefault(require_isInt());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var validators = {
      PL: function PL(str) {
        (0, _assertString.default)(str);
        var weightOfDigits = {
          1: 1,
          2: 3,
          3: 7,
          4: 9,
          5: 1,
          6: 3,
          7: 7,
          8: 9,
          9: 1,
          10: 3,
          11: 0
        };
        if (str != null && str.length === 11 && (0, _isInt.default)(str, {
          allow_leading_zeroes: true
        })) {
          var digits = str.split("").slice(0, -1);
          var sum = digits.reduce(function(acc, digit, index) {
            return acc + Number(digit) * weightOfDigits[index + 1];
          }, 0);
          var modulo = sum % 10;
          var lastDigit = Number(str.charAt(str.length - 1));
          if (modulo === 0 && lastDigit === 0 || lastDigit === 10 - modulo) {
            return true;
          }
        }
        return false;
      },
      ES: function ES(str) {
        (0, _assertString.default)(str);
        var DNI = /^[0-9X-Z][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/;
        var charsValue = {
          X: 0,
          Y: 1,
          Z: 2
        };
        var controlDigits = ["T", "R", "W", "A", "G", "M", "Y", "F", "P", "D", "X", "B", "N", "J", "Z", "S", "Q", "V", "H", "L", "C", "K", "E"];
        var sanitized = str.trim().toUpperCase();
        if (!DNI.test(sanitized)) {
          return false;
        }
        var number = sanitized.slice(0, -1).replace(/[X,Y,Z]/g, function(char) {
          return charsValue[char];
        });
        return sanitized.endsWith(controlDigits[number % 23]);
      },
      FI: function FI(str) {
        (0, _assertString.default)(str);
        if (str.length !== 11) {
          return false;
        }
        if (!str.match(/^\d{6}[\-A\+]\d{3}[0-9ABCDEFHJKLMNPRSTUVWXY]{1}$/)) {
          return false;
        }
        var checkDigits = "0123456789ABCDEFHJKLMNPRSTUVWXY";
        var idAsNumber = parseInt(str.slice(0, 6), 10) * 1e3 + parseInt(str.slice(7, 10), 10);
        var remainder = idAsNumber % 31;
        var checkDigit = checkDigits[remainder];
        return checkDigit === str.slice(10, 11);
      },
      IN: function IN(str) {
        var DNI = /^[1-9]\d{3}\s?\d{4}\s?\d{4}$/;
        var d = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];
        var p = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]];
        var sanitized = str.trim();
        if (!DNI.test(sanitized)) {
          return false;
        }
        var c = 0;
        var invertedArray = sanitized.replace(/\s/g, "").split("").map(Number).reverse();
        invertedArray.forEach(function(val, i) {
          c = d[c][p[i % 8][val]];
        });
        return c === 0;
      },
      IR: function IR(str) {
        if (!str.match(/^\d{10}$/))
          return false;
        str = "0000".concat(str).substr(str.length - 6);
        if (parseInt(str.substr(3, 6), 10) === 0)
          return false;
        var lastNumber = parseInt(str.substr(9, 1), 10);
        var sum = 0;
        for (var i = 0; i < 9; i++) {
          sum += parseInt(str.substr(i, 1), 10) * (10 - i);
        }
        sum %= 11;
        return sum < 2 && lastNumber === sum || sum >= 2 && lastNumber === 11 - sum;
      },
      IT: function IT(str) {
        if (str.length !== 9)
          return false;
        if (str === "CA00000AA")
          return false;
        return str.search(/C[A-Z][0-9]{5}[A-Z]{2}/i) > -1;
      },
      NO: function NO(str) {
        var sanitized = str.trim();
        if (isNaN(Number(sanitized)))
          return false;
        if (sanitized.length !== 11)
          return false;
        if (sanitized === "00000000000")
          return false;
        var f = sanitized.split("").map(Number);
        var k1 = (11 - (3 * f[0] + 7 * f[1] + 6 * f[2] + 1 * f[3] + 8 * f[4] + 9 * f[5] + 4 * f[6] + 5 * f[7] + 2 * f[8]) % 11) % 11;
        var k2 = (11 - (5 * f[0] + 4 * f[1] + 3 * f[2] + 2 * f[3] + 7 * f[4] + 6 * f[5] + 5 * f[6] + 4 * f[7] + 3 * f[8] + 2 * k1) % 11) % 11;
        if (k1 !== f[9] || k2 !== f[10])
          return false;
        return true;
      },
      TH: function TH(str) {
        if (!str.match(/^[1-8]\d{12}$/))
          return false;
        var sum = 0;
        for (var i = 0; i < 12; i++) {
          sum += parseInt(str[i], 10) * (13 - i);
        }
        return str[12] === ((11 - sum % 11) % 10).toString();
      },
      LK: function LK(str) {
        var old_nic = /^[1-9]\d{8}[vx]$/i;
        var new_nic = /^[1-9]\d{11}$/i;
        if (str.length === 10 && old_nic.test(str))
          return true;
        else if (str.length === 12 && new_nic.test(str))
          return true;
        return false;
      },
      "he-IL": function heIL(str) {
        var DNI = /^\d{9}$/;
        var sanitized = str.trim();
        if (!DNI.test(sanitized)) {
          return false;
        }
        var id = sanitized;
        var sum = 0, incNum;
        for (var i = 0; i < id.length; i++) {
          incNum = Number(id[i]) * (i % 2 + 1);
          sum += incNum > 9 ? incNum - 9 : incNum;
        }
        return sum % 10 === 0;
      },
      "ar-LY": function arLY(str) {
        var NIN = /^(1|2)\d{11}$/;
        var sanitized = str.trim();
        if (!NIN.test(sanitized)) {
          return false;
        }
        return true;
      },
      "ar-TN": function arTN(str) {
        var DNI = /^\d{8}$/;
        var sanitized = str.trim();
        if (!DNI.test(sanitized)) {
          return false;
        }
        return true;
      },
      "zh-CN": function zhCN(str) {
        var provincesAndCities = [
          "11",
          "12",
          "13",
          "14",
          "15",
          "21",
          "22",
          "23",
          "31",
          "32",
          "33",
          "34",
          "35",
          "36",
          "37",
          "41",
          "42",
          "43",
          "44",
          "45",
          "46",
          "50",
          "51",
          "52",
          "53",
          "54",
          "61",
          "62",
          "63",
          "64",
          "65",
          "71",
          "81",
          "82",
          "91"
        ];
        var powers = ["7", "9", "10", "5", "8", "4", "2", "1", "6", "3", "7", "9", "10", "5", "8", "4", "2"];
        var parityBit = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
        var checkAddressCode = function checkAddressCode2(addressCode) {
          return provincesAndCities.includes(addressCode);
        };
        var checkBirthDayCode = function checkBirthDayCode2(birDayCode) {
          var yyyy = parseInt(birDayCode.substring(0, 4), 10);
          var mm = parseInt(birDayCode.substring(4, 6), 10);
          var dd = parseInt(birDayCode.substring(6), 10);
          var xdata = new Date(yyyy, mm - 1, dd);
          if (xdata > new Date()) {
            return false;
          } else if (xdata.getFullYear() === yyyy && xdata.getMonth() === mm - 1 && xdata.getDate() === dd) {
            return true;
          }
          return false;
        };
        var getParityBit = function getParityBit2(idCardNo) {
          var id17 = idCardNo.substring(0, 17);
          var power = 0;
          for (var i = 0; i < 17; i++) {
            power += parseInt(id17.charAt(i), 10) * parseInt(powers[i], 10);
          }
          var mod = power % 11;
          return parityBit[mod];
        };
        var checkParityBit = function checkParityBit2(idCardNo) {
          return getParityBit(idCardNo) === idCardNo.charAt(17).toUpperCase();
        };
        var check15IdCardNo = function check15IdCardNo2(idCardNo) {
          var check = /^[1-9]\d{7}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}$/.test(idCardNo);
          if (!check)
            return false;
          var addressCode = idCardNo.substring(0, 2);
          check = checkAddressCode(addressCode);
          if (!check)
            return false;
          var birDayCode = "19".concat(idCardNo.substring(6, 12));
          check = checkBirthDayCode(birDayCode);
          if (!check)
            return false;
          return true;
        };
        var check18IdCardNo = function check18IdCardNo2(idCardNo) {
          var check = /^[1-9]\d{5}[1-9]\d{3}((0[1-9])|(1[0-2]))((0[1-9])|([1-2][0-9])|(3[0-1]))\d{3}(\d|x|X)$/.test(idCardNo);
          if (!check)
            return false;
          var addressCode = idCardNo.substring(0, 2);
          check = checkAddressCode(addressCode);
          if (!check)
            return false;
          var birDayCode = idCardNo.substring(6, 14);
          check = checkBirthDayCode(birDayCode);
          if (!check)
            return false;
          return checkParityBit(idCardNo);
        };
        var checkIdCardNo = function checkIdCardNo2(idCardNo) {
          var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(idCardNo);
          if (!check)
            return false;
          if (idCardNo.length === 15) {
            return check15IdCardNo(idCardNo);
          }
          return check18IdCardNo(idCardNo);
        };
        return checkIdCardNo(str);
      },
      "zh-TW": function zhTW(str) {
        var ALPHABET_CODES = {
          A: 10,
          B: 11,
          C: 12,
          D: 13,
          E: 14,
          F: 15,
          G: 16,
          H: 17,
          I: 34,
          J: 18,
          K: 19,
          L: 20,
          M: 21,
          N: 22,
          O: 35,
          P: 23,
          Q: 24,
          R: 25,
          S: 26,
          T: 27,
          U: 28,
          V: 29,
          W: 32,
          X: 30,
          Y: 31,
          Z: 33
        };
        var sanitized = str.trim().toUpperCase();
        if (!/^[A-Z][0-9]{9}$/.test(sanitized))
          return false;
        return Array.from(sanitized).reduce(function(sum, number, index) {
          if (index === 0) {
            var code = ALPHABET_CODES[number];
            return code % 10 * 9 + Math.floor(code / 10);
          }
          if (index === 9) {
            return (10 - sum % 10 - Number(number)) % 10 === 0;
          }
          return sum + Number(number) * (9 - index);
        }, 0);
      }
    };
    function isIdentityCard(str, locale) {
      (0, _assertString.default)(str);
      if (locale in validators) {
        return validators[locale](str);
      } else if (locale === "any") {
        for (var key in validators) {
          if (validators.hasOwnProperty(key)) {
            var validator = validators[key];
            if (validator(str)) {
              return true;
            }
          }
        }
        return false;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isEAN.js
var require_isEAN = __commonJS({
  "node_modules/validator/lib/isEAN.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEAN;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var LENGTH_EAN_8 = 8;
    var LENGTH_EAN_14 = 14;
    var validEanRegex = /^(\d{8}|\d{13}|\d{14})$/;
    function getPositionWeightThroughLengthAndIndex(length, index) {
      if (length === LENGTH_EAN_8 || length === LENGTH_EAN_14) {
        return index % 2 === 0 ? 3 : 1;
      }
      return index % 2 === 0 ? 1 : 3;
    }
    function calculateCheckDigit(ean) {
      var checksum = ean.slice(0, -1).split("").map(function(char, index) {
        return Number(char) * getPositionWeightThroughLengthAndIndex(ean.length, index);
      }).reduce(function(acc, partialSum) {
        return acc + partialSum;
      }, 0);
      var remainder = 10 - checksum % 10;
      return remainder < 10 ? remainder : 0;
    }
    function isEAN(str) {
      (0, _assertString.default)(str);
      var actualCheckDigit = Number(str.slice(-1));
      return validEanRegex.test(str) && actualCheckDigit === calculateCheckDigit(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isISIN.js
var require_isISIN = __commonJS({
  "node_modules/validator/lib/isISIN.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISIN;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var isin = /^[A-Z]{2}[0-9A-Z]{9}[0-9]$/;
    function isISIN(str) {
      (0, _assertString.default)(str);
      if (!isin.test(str)) {
        return false;
      }
      var double = true;
      var sum = 0;
      for (var i = str.length - 2; i >= 0; i--) {
        if (str[i] >= "A" && str[i] <= "Z") {
          var value = str[i].charCodeAt(0) - 55;
          var lo = value % 10;
          var hi = Math.trunc(value / 10);
          for (var _i = 0, _arr = [lo, hi]; _i < _arr.length; _i++) {
            var digit = _arr[_i];
            if (double) {
              if (digit >= 5) {
                sum += 1 + (digit - 5) * 2;
              } else {
                sum += digit * 2;
              }
            } else {
              sum += digit;
            }
            double = !double;
          }
        } else {
          var _digit = str[i].charCodeAt(0) - "0".charCodeAt(0);
          if (double) {
            if (_digit >= 5) {
              sum += 1 + (_digit - 5) * 2;
            } else {
              sum += _digit * 2;
            }
          } else {
            sum += _digit;
          }
          double = !double;
        }
      }
      var check = Math.trunc((sum + 9) / 10) * 10 - sum;
      return +str[str.length - 1] === check;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isISBN.js
var require_isISBN = __commonJS({
  "node_modules/validator/lib/isISBN.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISBN;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var isbn10Maybe = /^(?:[0-9]{9}X|[0-9]{10})$/;
    var isbn13Maybe = /^(?:[0-9]{13})$/;
    var factor = [1, 3];
    function isISBN(str) {
      var version = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
      (0, _assertString.default)(str);
      version = String(version);
      if (!version) {
        return isISBN(str, 10) || isISBN(str, 13);
      }
      var sanitized = str.replace(/[\s-]+/g, "");
      var checksum = 0;
      var i;
      if (version === "10") {
        if (!isbn10Maybe.test(sanitized)) {
          return false;
        }
        for (i = 0; i < 9; i++) {
          checksum += (i + 1) * sanitized.charAt(i);
        }
        if (sanitized.charAt(9) === "X") {
          checksum += 10 * 10;
        } else {
          checksum += 10 * sanitized.charAt(9);
        }
        if (checksum % 11 === 0) {
          return !!sanitized;
        }
      } else if (version === "13") {
        if (!isbn13Maybe.test(sanitized)) {
          return false;
        }
        for (i = 0; i < 12; i++) {
          checksum += factor[i % 2] * sanitized.charAt(i);
        }
        if (sanitized.charAt(12) - (10 - checksum % 10) % 10 === 0) {
          return !!sanitized;
        }
      }
      return false;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isISSN.js
var require_isISSN = __commonJS({
  "node_modules/validator/lib/isISSN.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISSN;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var issn = "^\\d{4}-?\\d{3}[\\dX]$";
    function isISSN(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      (0, _assertString.default)(str);
      var testIssn = issn;
      testIssn = options.require_hyphen ? testIssn.replace("?", "") : testIssn;
      testIssn = options.case_sensitive ? new RegExp(testIssn) : new RegExp(testIssn, "i");
      if (!testIssn.test(str)) {
        return false;
      }
      var digits = str.replace("-", "").toUpperCase();
      var checksum = 0;
      for (var i = 0; i < digits.length; i++) {
        var digit = digits[i];
        checksum += (digit === "X" ? 10 : +digit) * (8 - i);
      }
      return checksum % 11 === 0;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/util/algorithms.js
var require_algorithms = __commonJS({
  "node_modules/validator/lib/util/algorithms.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.iso7064Check = iso7064Check;
    exports.luhnCheck = luhnCheck;
    exports.reverseMultiplyAndSum = reverseMultiplyAndSum;
    exports.verhoeffCheck = verhoeffCheck;
    function iso7064Check(str) {
      var checkvalue = 10;
      for (var i = 0; i < str.length - 1; i++) {
        checkvalue = (parseInt(str[i], 10) + checkvalue) % 10 === 0 ? 10 * 2 % 11 : (parseInt(str[i], 10) + checkvalue) % 10 * 2 % 11;
      }
      checkvalue = checkvalue === 1 ? 0 : 11 - checkvalue;
      return checkvalue === parseInt(str[10], 10);
    }
    function luhnCheck(str) {
      var checksum = 0;
      var second = false;
      for (var i = str.length - 1; i >= 0; i--) {
        if (second) {
          var product = parseInt(str[i], 10) * 2;
          if (product > 9) {
            checksum += product.toString().split("").map(function(a) {
              return parseInt(a, 10);
            }).reduce(function(a, b) {
              return a + b;
            }, 0);
          } else {
            checksum += product;
          }
        } else {
          checksum += parseInt(str[i], 10);
        }
        second = !second;
      }
      return checksum % 10 === 0;
    }
    function reverseMultiplyAndSum(digits, base) {
      var total = 0;
      for (var i = 0; i < digits.length; i++) {
        total += digits[i] * (base - i);
      }
      return total;
    }
    function verhoeffCheck(str) {
      var d_table = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 2, 3, 4, 0, 6, 7, 8, 9, 5], [2, 3, 4, 0, 1, 7, 8, 9, 5, 6], [3, 4, 0, 1, 2, 8, 9, 5, 6, 7], [4, 0, 1, 2, 3, 9, 5, 6, 7, 8], [5, 9, 8, 7, 6, 0, 4, 3, 2, 1], [6, 5, 9, 8, 7, 1, 0, 4, 3, 2], [7, 6, 5, 9, 8, 2, 1, 0, 4, 3], [8, 7, 6, 5, 9, 3, 2, 1, 0, 4], [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]];
      var p_table = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 5, 7, 6, 2, 8, 3, 0, 9, 4], [5, 8, 0, 3, 7, 9, 6, 1, 4, 2], [8, 9, 1, 6, 0, 4, 3, 5, 2, 7], [9, 4, 5, 3, 1, 2, 6, 8, 7, 0], [4, 2, 8, 6, 5, 7, 3, 9, 0, 1], [2, 7, 9, 3, 8, 0, 6, 4, 1, 5], [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]];
      var str_copy = str.split("").reverse().join("");
      var checksum = 0;
      for (var i = 0; i < str_copy.length; i++) {
        checksum = d_table[checksum][p_table[i % 8][parseInt(str_copy[i], 10)]];
      }
      return checksum === 0;
    }
  }
});

// node_modules/validator/lib/isTaxID.js
var require_isTaxID = __commonJS({
  "node_modules/validator/lib/isTaxID.js"(exports, module2) {
    "use strict";
    function _typeof(obj) {
      "@babel/helpers - typeof";
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isTaxID;
    var _assertString = _interopRequireDefault(require_assertString());
    var algorithms = _interopRequireWildcard(require_algorithms());
    var _isDate = _interopRequireDefault(require_isDate());
    function _getRequireWildcardCache() {
      if (typeof WeakMap !== "function")
        return null;
      var cache = new WeakMap();
      _getRequireWildcardCache = function _getRequireWildcardCache2() {
        return cache;
      };
      return cache;
    }
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      }
      if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
        return { default: obj };
      }
      var cache = _getRequireWildcardCache();
      if (cache && cache.has(obj)) {
        return cache.get(obj);
      }
      var newObj = {};
      var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
          if (desc && (desc.get || desc.set)) {
            Object.defineProperty(newObj, key, desc);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
      newObj.default = obj;
      if (cache) {
        cache.set(obj, newObj);
      }
      return newObj;
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }
    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o)
        return;
      if (typeof o === "string")
        return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor)
        n = o.constructor.name;
      if (n === "Map" || n === "Set")
        return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
        return _arrayLikeToArray(o, minLen);
    }
    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter))
        return Array.from(iter);
    }
    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr))
        return _arrayLikeToArray(arr);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length)
        len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
      }
      return arr2;
    }
    function bgBgCheck(tin) {
      var century_year = tin.slice(0, 2);
      var month = parseInt(tin.slice(2, 4), 10);
      if (month > 40) {
        month -= 40;
        century_year = "20".concat(century_year);
      } else if (month > 20) {
        month -= 20;
        century_year = "18".concat(century_year);
      } else {
        century_year = "19".concat(century_year);
      }
      if (month < 10) {
        month = "0".concat(month);
      }
      var date = "".concat(century_year, "/").concat(month, "/").concat(tin.slice(4, 6));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var multip_lookup = [2, 4, 8, 5, 10, 9, 7, 3, 6];
      var checksum = 0;
      for (var i = 0; i < multip_lookup.length; i++) {
        checksum += digits[i] * multip_lookup[i];
      }
      checksum = checksum % 11 === 10 ? 0 : checksum % 11;
      return checksum === digits[9];
    }
    function csCzCheck(tin) {
      tin = tin.replace(/\W/, "");
      var full_year = parseInt(tin.slice(0, 2), 10);
      if (tin.length === 10) {
        if (full_year < 54) {
          full_year = "20".concat(full_year);
        } else {
          full_year = "19".concat(full_year);
        }
      } else {
        if (tin.slice(6) === "000") {
          return false;
        }
        if (full_year < 54) {
          full_year = "19".concat(full_year);
        } else {
          return false;
        }
      }
      if (full_year.length === 3) {
        full_year = [full_year.slice(0, 2), "0", full_year.slice(2)].join("");
      }
      var month = parseInt(tin.slice(2, 4), 10);
      if (month > 50) {
        month -= 50;
      }
      if (month > 20) {
        if (parseInt(full_year, 10) < 2004) {
          return false;
        }
        month -= 20;
      }
      if (month < 10) {
        month = "0".concat(month);
      }
      var date = "".concat(full_year, "/").concat(month, "/").concat(tin.slice(4, 6));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      if (tin.length === 10) {
        if (parseInt(tin, 10) % 11 !== 0) {
          var checkdigit = parseInt(tin.slice(0, 9), 10) % 11;
          if (parseInt(full_year, 10) < 1986 && checkdigit === 10) {
            if (parseInt(tin.slice(9), 10) !== 0) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    }
    function deAtCheck(tin) {
      return algorithms.luhnCheck(tin);
    }
    function deDeCheck(tin) {
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var occurences = [];
      for (var i = 0; i < digits.length - 1; i++) {
        occurences.push("");
        for (var j = 0; j < digits.length - 1; j++) {
          if (digits[i] === digits[j]) {
            occurences[i] += j;
          }
        }
      }
      occurences = occurences.filter(function(a) {
        return a.length > 1;
      });
      if (occurences.length !== 2 && occurences.length !== 3) {
        return false;
      }
      if (occurences[0].length === 3) {
        var trip_locations = occurences[0].split("").map(function(a) {
          return parseInt(a, 10);
        });
        var recurrent = 0;
        for (var _i = 0; _i < trip_locations.length - 1; _i++) {
          if (trip_locations[_i] + 1 === trip_locations[_i + 1]) {
            recurrent += 1;
          }
        }
        if (recurrent === 2) {
          return false;
        }
      }
      return algorithms.iso7064Check(tin);
    }
    function dkDkCheck(tin) {
      tin = tin.replace(/\W/, "");
      var year = parseInt(tin.slice(4, 6), 10);
      var century_digit = tin.slice(6, 7);
      switch (century_digit) {
        case "0":
        case "1":
        case "2":
        case "3":
          year = "19".concat(year);
          break;
        case "4":
        case "9":
          if (year < 37) {
            year = "20".concat(year);
          } else {
            year = "19".concat(year);
          }
          break;
        default:
          if (year < 37) {
            year = "20".concat(year);
          } else if (year > 58) {
            year = "18".concat(year);
          } else {
            return false;
          }
          break;
      }
      if (year.length === 3) {
        year = [year.slice(0, 2), "0", year.slice(2)].join("");
      }
      var date = "".concat(year, "/").concat(tin.slice(2, 4), "/").concat(tin.slice(0, 2));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 0;
      var weight = 4;
      for (var i = 0; i < 9; i++) {
        checksum += digits[i] * weight;
        weight -= 1;
        if (weight === 1) {
          weight = 7;
        }
      }
      checksum %= 11;
      if (checksum === 1) {
        return false;
      }
      return checksum === 0 ? digits[9] === 0 : digits[9] === 11 - checksum;
    }
    function elCyCheck(tin) {
      var digits = tin.slice(0, 8).split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 0;
      for (var i = 1; i < digits.length; i += 2) {
        checksum += digits[i];
      }
      for (var _i2 = 0; _i2 < digits.length; _i2 += 2) {
        if (digits[_i2] < 2) {
          checksum += 1 - digits[_i2];
        } else {
          checksum += 2 * (digits[_i2] - 2) + 5;
          if (digits[_i2] > 4) {
            checksum += 2;
          }
        }
      }
      return String.fromCharCode(checksum % 26 + 65) === tin.charAt(8);
    }
    function elGrCheck(tin) {
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 0;
      for (var i = 0; i < 8; i++) {
        checksum += digits[i] * Math.pow(2, 8 - i);
      }
      return checksum % 11 % 10 === digits[8];
    }
    function enIeCheck(tin) {
      var checksum = algorithms.reverseMultiplyAndSum(tin.split("").slice(0, 7).map(function(a) {
        return parseInt(a, 10);
      }), 8);
      if (tin.length === 9 && tin[8] !== "W") {
        checksum += (tin[8].charCodeAt(0) - 64) * 9;
      }
      checksum %= 23;
      if (checksum === 0) {
        return tin[7].toUpperCase() === "W";
      }
      return tin[7].toUpperCase() === String.fromCharCode(64 + checksum);
    }
    var enUsCampusPrefix = {
      andover: ["10", "12"],
      atlanta: ["60", "67"],
      austin: ["50", "53"],
      brookhaven: ["01", "02", "03", "04", "05", "06", "11", "13", "14", "16", "21", "22", "23", "25", "34", "51", "52", "54", "55", "56", "57", "58", "59", "65"],
      cincinnati: ["30", "32", "35", "36", "37", "38", "61"],
      fresno: ["15", "24"],
      internet: ["20", "26", "27", "45", "46", "47"],
      kansas: ["40", "44"],
      memphis: ["94", "95"],
      ogden: ["80", "90"],
      philadelphia: ["33", "39", "41", "42", "43", "46", "48", "62", "63", "64", "66", "68", "71", "72", "73", "74", "75", "76", "77", "81", "82", "83", "84", "85", "86", "87", "88", "91", "92", "93", "98", "99"],
      sba: ["31"]
    };
    function enUsGetPrefixes() {
      var prefixes = [];
      for (var location2 in enUsCampusPrefix) {
        if (enUsCampusPrefix.hasOwnProperty(location2)) {
          prefixes.push.apply(prefixes, _toConsumableArray(enUsCampusPrefix[location2]));
        }
      }
      return prefixes;
    }
    function enUsCheck(tin) {
      return enUsGetPrefixes().indexOf(tin.substr(0, 2)) !== -1;
    }
    function esEsCheck(tin) {
      var chars = tin.toUpperCase().split("");
      if (isNaN(parseInt(chars[0], 10)) && chars.length > 1) {
        var lead_replace = 0;
        switch (chars[0]) {
          case "Y":
            lead_replace = 1;
            break;
          case "Z":
            lead_replace = 2;
            break;
          default:
        }
        chars.splice(0, 1, lead_replace);
      } else {
        while (chars.length < 9) {
          chars.unshift(0);
        }
      }
      var lookup = ["T", "R", "W", "A", "G", "M", "Y", "F", "P", "D", "X", "B", "N", "J", "Z", "S", "Q", "V", "H", "L", "C", "K", "E"];
      chars = chars.join("");
      var checksum = parseInt(chars.slice(0, 8), 10) % 23;
      return chars[8] === lookup[checksum];
    }
    function etEeCheck(tin) {
      var full_year = tin.slice(1, 3);
      var century_digit = tin.slice(0, 1);
      switch (century_digit) {
        case "1":
        case "2":
          full_year = "18".concat(full_year);
          break;
        case "3":
        case "4":
          full_year = "19".concat(full_year);
          break;
        default:
          full_year = "20".concat(full_year);
          break;
      }
      var date = "".concat(full_year, "/").concat(tin.slice(3, 5), "/").concat(tin.slice(5, 7));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 0;
      var weight = 1;
      for (var i = 0; i < 10; i++) {
        checksum += digits[i] * weight;
        weight += 1;
        if (weight === 10) {
          weight = 1;
        }
      }
      if (checksum % 11 === 10) {
        checksum = 0;
        weight = 3;
        for (var _i3 = 0; _i3 < 10; _i3++) {
          checksum += digits[_i3] * weight;
          weight += 1;
          if (weight === 10) {
            weight = 1;
          }
        }
        if (checksum % 11 === 10) {
          return digits[10] === 0;
        }
      }
      return checksum % 11 === digits[10];
    }
    function fiFiCheck(tin) {
      var full_year = tin.slice(4, 6);
      var century_symbol = tin.slice(6, 7);
      switch (century_symbol) {
        case "+":
          full_year = "18".concat(full_year);
          break;
        case "-":
          full_year = "19".concat(full_year);
          break;
        default:
          full_year = "20".concat(full_year);
          break;
      }
      var date = "".concat(full_year, "/").concat(tin.slice(2, 4), "/").concat(tin.slice(0, 2));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var checksum = parseInt(tin.slice(0, 6) + tin.slice(7, 10), 10) % 31;
      if (checksum < 10) {
        return checksum === parseInt(tin.slice(10), 10);
      }
      checksum -= 10;
      var letters_lookup = ["A", "B", "C", "D", "E", "F", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "W", "X", "Y"];
      return letters_lookup[checksum] === tin.slice(10);
    }
    function frBeCheck(tin) {
      if (tin.slice(2, 4) !== "00" || tin.slice(4, 6) !== "00") {
        var date = "".concat(tin.slice(0, 2), "/").concat(tin.slice(2, 4), "/").concat(tin.slice(4, 6));
        if (!(0, _isDate.default)(date, "YY/MM/DD")) {
          return false;
        }
      }
      var checksum = 97 - parseInt(tin.slice(0, 9), 10) % 97;
      var checkdigits = parseInt(tin.slice(9, 11), 10);
      if (checksum !== checkdigits) {
        checksum = 97 - parseInt("2".concat(tin.slice(0, 9)), 10) % 97;
        if (checksum !== checkdigits) {
          return false;
        }
      }
      return true;
    }
    function frFrCheck(tin) {
      tin = tin.replace(/\s/g, "");
      var checksum = parseInt(tin.slice(0, 10), 10) % 511;
      var checkdigits = parseInt(tin.slice(10, 13), 10);
      return checksum === checkdigits;
    }
    function frLuCheck(tin) {
      var date = "".concat(tin.slice(0, 4), "/").concat(tin.slice(4, 6), "/").concat(tin.slice(6, 8));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      if (!algorithms.luhnCheck(tin.slice(0, 12))) {
        return false;
      }
      return algorithms.verhoeffCheck("".concat(tin.slice(0, 11)).concat(tin[12]));
    }
    function hrHrCheck(tin) {
      return algorithms.iso7064Check(tin);
    }
    function huHuCheck(tin) {
      var digits = tin.split("").map(function(a) {
        return parseInt(a, 10);
      });
      var checksum = 8;
      for (var i = 1; i < 9; i++) {
        checksum += digits[i] * (i + 1);
      }
      return checksum % 11 === digits[9];
    }
    function itItNameCheck(name) {
      var vowelflag = false;
      var xflag = false;
      for (var i = 0; i < 3; i++) {
        if (!vowelflag && /[AEIOU]/.test(name[i])) {
          vowelflag = true;
        } else if (!xflag && vowelflag && name[i] === "X") {
          xflag = true;
        } else if (i > 0) {
          if (vowelflag && !xflag) {
            if (!/[AEIOU]/.test(name[i])) {
              return false;
            }
          }
          if (xflag) {
            if (!/X/.test(name[i])) {
              return false;
            }
          }
        }
      }
      return true;
    }
    function itItCheck(tin) {
      var chars = tin.toUpperCase().split("");
      if (!itItNameCheck(chars.slice(0, 3))) {
        return false;
      }
      if (!itItNameCheck(chars.slice(3, 6))) {
        return false;
      }
      var number_locations = [6, 7, 9, 10, 12, 13, 14];
      var number_replace = {
        L: "0",
        M: "1",
        N: "2",
        P: "3",
        Q: "4",
        R: "5",
        S: "6",
        T: "7",
        U: "8",
        V: "9"
      };
      for (var _i4 = 0, _number_locations = number_locations; _i4 < _number_locations.length; _i4++) {
        var i = _number_locations[_i4];
        if (chars[i] in number_replace) {
          chars.splice(i, 1, number_replace[chars[i]]);
        }
      }
      var month_replace = {
        A: "01",
        B: "02",
        C: "03",
        D: "04",
        E: "05",
        H: "06",
        L: "07",
        M: "08",
        P: "09",
        R: "10",
        S: "11",
        T: "12"
      };
      var month = month_replace[chars[8]];
      var day = parseInt(chars[9] + chars[10], 10);
      if (day > 40) {
        day -= 40;
      }
      if (day < 10) {
        day = "0".concat(day);
      }
      var date = "".concat(chars[6]).concat(chars[7], "/").concat(month, "/").concat(day);
      if (!(0, _isDate.default)(date, "YY/MM/DD")) {
        return false;
      }
      var checksum = 0;
      for (var _i5 = 1; _i5 < chars.length - 1; _i5 += 2) {
        var char_to_int = parseInt(chars[_i5], 10);
        if (isNaN(char_to_int)) {
          char_to_int = chars[_i5].charCodeAt(0) - 65;
        }
        checksum += char_to_int;
      }
      var odd_convert = {
        A: 1,
        B: 0,
        C: 5,
        D: 7,
        E: 9,
        F: 13,
        G: 15,
        H: 17,
        I: 19,
        J: 21,
        K: 2,
        L: 4,
        M: 18,
        N: 20,
        O: 11,
        P: 3,
        Q: 6,
        R: 8,
        S: 12,
        T: 14,
        U: 16,
        V: 10,
        W: 22,
        X: 25,
        Y: 24,
        Z: 23,
        0: 1,
        1: 0
      };
      for (var _i6 = 0; _i6 < chars.length - 1; _i6 += 2) {
        var _char_to_int = 0;
        if (chars[_i6] in odd_convert) {
          _char_to_int = odd_convert[chars[_i6]];
        } else {
          var multiplier = parseInt(chars[_i6], 10);
          _char_to_int = 2 * multiplier + 1;
          if (multiplier > 4) {
            _char_to_int += 2;
          }
        }
        checksum += _char_to_int;
      }
      if (String.fromCharCode(65 + checksum % 26) !== chars[15]) {
        return false;
      }
      return true;
    }
    function lvLvCheck(tin) {
      tin = tin.replace(/\W/, "");
      var day = tin.slice(0, 2);
      if (day !== "32") {
        var month = tin.slice(2, 4);
        if (month !== "00") {
          var full_year = tin.slice(4, 6);
          switch (tin[6]) {
            case "0":
              full_year = "18".concat(full_year);
              break;
            case "1":
              full_year = "19".concat(full_year);
              break;
            default:
              full_year = "20".concat(full_year);
              break;
          }
          var date = "".concat(full_year, "/").concat(tin.slice(2, 4), "/").concat(day);
          if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
            return false;
          }
        }
        var checksum = 1101;
        var multip_lookup = [1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
        for (var i = 0; i < tin.length - 1; i++) {
          checksum -= parseInt(tin[i], 10) * multip_lookup[i];
        }
        return parseInt(tin[10], 10) === checksum % 11;
      }
      return true;
    }
    function mtMtCheck(tin) {
      if (tin.length !== 9) {
        var chars = tin.toUpperCase().split("");
        while (chars.length < 8) {
          chars.unshift(0);
        }
        switch (tin[7]) {
          case "A":
          case "P":
            if (parseInt(chars[6], 10) === 0) {
              return false;
            }
            break;
          default: {
            var first_part = parseInt(chars.join("").slice(0, 5), 10);
            if (first_part > 32e3) {
              return false;
            }
            var second_part = parseInt(chars.join("").slice(5, 7), 10);
            if (first_part === second_part) {
              return false;
            }
          }
        }
      }
      return true;
    }
    function nlNlCheck(tin) {
      return algorithms.reverseMultiplyAndSum(tin.split("").slice(0, 8).map(function(a) {
        return parseInt(a, 10);
      }), 9) % 11 === parseInt(tin[8], 10);
    }
    function plPlCheck(tin) {
      if (tin.length === 10) {
        var lookup = [6, 5, 7, 2, 3, 4, 5, 6, 7];
        var _checksum = 0;
        for (var i = 0; i < lookup.length; i++) {
          _checksum += parseInt(tin[i], 10) * lookup[i];
        }
        _checksum %= 11;
        if (_checksum === 10) {
          return false;
        }
        return _checksum === parseInt(tin[9], 10);
      }
      var full_year = tin.slice(0, 2);
      var month = parseInt(tin.slice(2, 4), 10);
      if (month > 80) {
        full_year = "18".concat(full_year);
        month -= 80;
      } else if (month > 60) {
        full_year = "22".concat(full_year);
        month -= 60;
      } else if (month > 40) {
        full_year = "21".concat(full_year);
        month -= 40;
      } else if (month > 20) {
        full_year = "20".concat(full_year);
        month -= 20;
      } else {
        full_year = "19".concat(full_year);
      }
      if (month < 10) {
        month = "0".concat(month);
      }
      var date = "".concat(full_year, "/").concat(month, "/").concat(tin.slice(4, 6));
      if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      var checksum = 0;
      var multiplier = 1;
      for (var _i7 = 0; _i7 < tin.length - 1; _i7++) {
        checksum += parseInt(tin[_i7], 10) * multiplier % 10;
        multiplier += 2;
        if (multiplier > 10) {
          multiplier = 1;
        } else if (multiplier === 5) {
          multiplier += 2;
        }
      }
      checksum = 10 - checksum % 10;
      return checksum === parseInt(tin[10], 10);
    }
    function ptBrCheck(tin) {
      if (tin.length === 11) {
        var _sum;
        var remainder;
        _sum = 0;
        if (tin === "11111111111" || tin === "22222222222" || tin === "33333333333" || tin === "44444444444" || tin === "55555555555" || tin === "66666666666" || tin === "77777777777" || tin === "88888888888" || tin === "99999999999" || tin === "00000000000")
          return false;
        for (var i = 1; i <= 9; i++) {
          _sum += parseInt(tin.substring(i - 1, i), 10) * (11 - i);
        }
        remainder = _sum * 10 % 11;
        if (remainder === 10)
          remainder = 0;
        if (remainder !== parseInt(tin.substring(9, 10), 10))
          return false;
        _sum = 0;
        for (var _i8 = 1; _i8 <= 10; _i8++) {
          _sum += parseInt(tin.substring(_i8 - 1, _i8), 10) * (12 - _i8);
        }
        remainder = _sum * 10 % 11;
        if (remainder === 10)
          remainder = 0;
        if (remainder !== parseInt(tin.substring(10, 11), 10))
          return false;
        return true;
      }
      if (tin === "00000000000000" || tin === "11111111111111" || tin === "22222222222222" || tin === "33333333333333" || tin === "44444444444444" || tin === "55555555555555" || tin === "66666666666666" || tin === "77777777777777" || tin === "88888888888888" || tin === "99999999999999") {
        return false;
      }
      var length = tin.length - 2;
      var identifiers = tin.substring(0, length);
      var verificators = tin.substring(length);
      var sum = 0;
      var pos = length - 7;
      for (var _i9 = length; _i9 >= 1; _i9--) {
        sum += identifiers.charAt(length - _i9) * pos;
        pos -= 1;
        if (pos < 2) {
          pos = 9;
        }
      }
      var result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (result !== parseInt(verificators.charAt(0), 10)) {
        return false;
      }
      length += 1;
      identifiers = tin.substring(0, length);
      sum = 0;
      pos = length - 7;
      for (var _i10 = length; _i10 >= 1; _i10--) {
        sum += identifiers.charAt(length - _i10) * pos;
        pos -= 1;
        if (pos < 2) {
          pos = 9;
        }
      }
      result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (result !== parseInt(verificators.charAt(1), 10)) {
        return false;
      }
      return true;
    }
    function ptPtCheck(tin) {
      var checksum = 11 - algorithms.reverseMultiplyAndSum(tin.split("").slice(0, 8).map(function(a) {
        return parseInt(a, 10);
      }), 9) % 11;
      if (checksum > 9) {
        return parseInt(tin[8], 10) === 0;
      }
      return checksum === parseInt(tin[8], 10);
    }
    function roRoCheck(tin) {
      if (tin.slice(0, 4) !== "9000") {
        var full_year = tin.slice(1, 3);
        switch (tin[0]) {
          case "1":
          case "2":
            full_year = "19".concat(full_year);
            break;
          case "3":
          case "4":
            full_year = "18".concat(full_year);
            break;
          case "5":
          case "6":
            full_year = "20".concat(full_year);
            break;
          default:
        }
        var date = "".concat(full_year, "/").concat(tin.slice(3, 5), "/").concat(tin.slice(5, 7));
        if (date.length === 8) {
          if (!(0, _isDate.default)(date, "YY/MM/DD")) {
            return false;
          }
        } else if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
          return false;
        }
        var digits = tin.split("").map(function(a) {
          return parseInt(a, 10);
        });
        var multipliers = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
        var checksum = 0;
        for (var i = 0; i < multipliers.length; i++) {
          checksum += digits[i] * multipliers[i];
        }
        if (checksum % 11 === 10) {
          return digits[12] === 1;
        }
        return digits[12] === checksum % 11;
      }
      return true;
    }
    function skSkCheck(tin) {
      if (tin.length === 9) {
        tin = tin.replace(/\W/, "");
        if (tin.slice(6) === "000") {
          return false;
        }
        var full_year = parseInt(tin.slice(0, 2), 10);
        if (full_year > 53) {
          return false;
        }
        if (full_year < 10) {
          full_year = "190".concat(full_year);
        } else {
          full_year = "19".concat(full_year);
        }
        var month = parseInt(tin.slice(2, 4), 10);
        if (month > 50) {
          month -= 50;
        }
        if (month < 10) {
          month = "0".concat(month);
        }
        var date = "".concat(full_year, "/").concat(month, "/").concat(tin.slice(4, 6));
        if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
          return false;
        }
      }
      return true;
    }
    function slSiCheck(tin) {
      var checksum = 11 - algorithms.reverseMultiplyAndSum(tin.split("").slice(0, 7).map(function(a) {
        return parseInt(a, 10);
      }), 8) % 11;
      if (checksum === 10) {
        return parseInt(tin[7], 10) === 0;
      }
      return checksum === parseInt(tin[7], 10);
    }
    function svSeCheck(tin) {
      var tin_copy = tin.slice(0);
      if (tin.length > 11) {
        tin_copy = tin_copy.slice(2);
      }
      var full_year = "";
      var month = tin_copy.slice(2, 4);
      var day = parseInt(tin_copy.slice(4, 6), 10);
      if (tin.length > 11) {
        full_year = tin.slice(0, 4);
      } else {
        full_year = tin.slice(0, 2);
        if (tin.length === 11 && day < 60) {
          var current_year = new Date().getFullYear().toString();
          var current_century = parseInt(current_year.slice(0, 2), 10);
          current_year = parseInt(current_year, 10);
          if (tin[6] === "-") {
            if (parseInt("".concat(current_century).concat(full_year), 10) > current_year) {
              full_year = "".concat(current_century - 1).concat(full_year);
            } else {
              full_year = "".concat(current_century).concat(full_year);
            }
          } else {
            full_year = "".concat(current_century - 1).concat(full_year);
            if (current_year - parseInt(full_year, 10) < 100) {
              return false;
            }
          }
        }
      }
      if (day > 60) {
        day -= 60;
      }
      if (day < 10) {
        day = "0".concat(day);
      }
      var date = "".concat(full_year, "/").concat(month, "/").concat(day);
      if (date.length === 8) {
        if (!(0, _isDate.default)(date, "YY/MM/DD")) {
          return false;
        }
      } else if (!(0, _isDate.default)(date, "YYYY/MM/DD")) {
        return false;
      }
      return algorithms.luhnCheck(tin.replace(/\W/, ""));
    }
    var taxIdFormat = {
      "bg-BG": /^\d{10}$/,
      "cs-CZ": /^\d{6}\/{0,1}\d{3,4}$/,
      "de-AT": /^\d{9}$/,
      "de-DE": /^[1-9]\d{10}$/,
      "dk-DK": /^\d{6}-{0,1}\d{4}$/,
      "el-CY": /^[09]\d{7}[A-Z]$/,
      "el-GR": /^([0-4]|[7-9])\d{8}$/,
      "en-GB": /^\d{10}$|^(?!GB|NK|TN|ZZ)(?![DFIQUV])[A-Z](?![DFIQUVO])[A-Z]\d{6}[ABCD ]$/i,
      "en-IE": /^\d{7}[A-W][A-IW]{0,1}$/i,
      "en-US": /^\d{2}[- ]{0,1}\d{7}$/,
      "es-ES": /^(\d{0,8}|[XYZKLM]\d{7})[A-HJ-NP-TV-Z]$/i,
      "et-EE": /^[1-6]\d{6}(00[1-9]|0[1-9][0-9]|[1-6][0-9]{2}|70[0-9]|710)\d$/,
      "fi-FI": /^\d{6}[-+A]\d{3}[0-9A-FHJ-NPR-Y]$/i,
      "fr-BE": /^\d{11}$/,
      "fr-FR": /^[0-3]\d{12}$|^[0-3]\d\s\d{2}(\s\d{3}){3}$/,
      "fr-LU": /^\d{13}$/,
      "hr-HR": /^\d{11}$/,
      "hu-HU": /^8\d{9}$/,
      "it-IT": /^[A-Z]{6}[L-NP-V0-9]{2}[A-EHLMPRST][L-NP-V0-9]{2}[A-ILMZ][L-NP-V0-9]{3}[A-Z]$/i,
      "lv-LV": /^\d{6}-{0,1}\d{5}$/,
      "mt-MT": /^\d{3,7}[APMGLHBZ]$|^([1-8])\1\d{7}$/i,
      "nl-NL": /^\d{9}$/,
      "pl-PL": /^\d{10,11}$/,
      "pt-BR": /(?:^\d{11}$)|(?:^\d{14}$)/,
      "pt-PT": /^\d{9}$/,
      "ro-RO": /^\d{13}$/,
      "sk-SK": /^\d{6}\/{0,1}\d{3,4}$/,
      "sl-SI": /^[1-9]\d{7}$/,
      "sv-SE": /^(\d{6}[-+]{0,1}\d{4}|(18|19|20)\d{6}[-+]{0,1}\d{4})$/
    };
    taxIdFormat["lb-LU"] = taxIdFormat["fr-LU"];
    taxIdFormat["lt-LT"] = taxIdFormat["et-EE"];
    taxIdFormat["nl-BE"] = taxIdFormat["fr-BE"];
    var taxIdCheck = {
      "bg-BG": bgBgCheck,
      "cs-CZ": csCzCheck,
      "de-AT": deAtCheck,
      "de-DE": deDeCheck,
      "dk-DK": dkDkCheck,
      "el-CY": elCyCheck,
      "el-GR": elGrCheck,
      "en-IE": enIeCheck,
      "en-US": enUsCheck,
      "es-ES": esEsCheck,
      "et-EE": etEeCheck,
      "fi-FI": fiFiCheck,
      "fr-BE": frBeCheck,
      "fr-FR": frFrCheck,
      "fr-LU": frLuCheck,
      "hr-HR": hrHrCheck,
      "hu-HU": huHuCheck,
      "it-IT": itItCheck,
      "lv-LV": lvLvCheck,
      "mt-MT": mtMtCheck,
      "nl-NL": nlNlCheck,
      "pl-PL": plPlCheck,
      "pt-BR": ptBrCheck,
      "pt-PT": ptPtCheck,
      "ro-RO": roRoCheck,
      "sk-SK": skSkCheck,
      "sl-SI": slSiCheck,
      "sv-SE": svSeCheck
    };
    taxIdCheck["lb-LU"] = taxIdCheck["fr-LU"];
    taxIdCheck["lt-LT"] = taxIdCheck["et-EE"];
    taxIdCheck["nl-BE"] = taxIdCheck["fr-BE"];
    var allsymbols = /[-\\\/!@#$%\^&\*\(\)\+\=\[\]]+/g;
    var sanitizeRegexes = {
      "de-AT": allsymbols,
      "de-DE": /[\/\\]/g,
      "fr-BE": allsymbols
    };
    sanitizeRegexes["nl-BE"] = sanitizeRegexes["fr-BE"];
    function isTaxID(str) {
      var locale = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "en-US";
      (0, _assertString.default)(str);
      var strcopy = str.slice(0);
      if (locale in taxIdFormat) {
        if (locale in sanitizeRegexes) {
          strcopy = strcopy.replace(sanitizeRegexes[locale], "");
        }
        if (!taxIdFormat[locale].test(strcopy)) {
          return false;
        }
        if (locale in taxIdCheck) {
          return taxIdCheck[locale](strcopy);
        }
        return true;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isMobilePhone.js
var require_isMobilePhone = __commonJS({
  "node_modules/validator/lib/isMobilePhone.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMobilePhone;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var phones = {
      "am-AM": /^(\+?374|0)((10|[9|7][0-9])\d{6}$|[2-4]\d{7}$)/,
      "ar-AE": /^((\+?971)|0)?5[024568]\d{7}$/,
      "ar-BH": /^(\+?973)?(3|6)\d{7}$/,
      "ar-DZ": /^(\+?213|0)(5|6|7)\d{8}$/,
      "ar-LB": /^(\+?961)?((3|81)\d{6}|7\d{7})$/,
      "ar-EG": /^((\+?20)|0)?1[0125]\d{8}$/,
      "ar-IQ": /^(\+?964|0)?7[0-9]\d{8}$/,
      "ar-JO": /^(\+?962|0)?7[789]\d{7}$/,
      "ar-KW": /^(\+?965)[569]\d{7}$/,
      "ar-LY": /^((\+?218)|0)?(9[1-6]\d{7}|[1-8]\d{7,9})$/,
      "ar-MA": /^(?:(?:\+|00)212|0)[5-7]\d{8}$/,
      "ar-OM": /^((\+|00)968)?(9[1-9])\d{6}$/,
      "ar-PS": /^(\+?970|0)5[6|9](\d{7})$/,
      "ar-SA": /^(!?(\+?966)|0)?5\d{8}$/,
      "ar-SY": /^(!?(\+?963)|0)?9\d{8}$/,
      "ar-TN": /^(\+?216)?[2459]\d{7}$/,
      "az-AZ": /^(\+994|0)(5[015]|7[07]|99)\d{7}$/,
      "bs-BA": /^((((\+|00)3876)|06))((([0-3]|[5-6])\d{6})|(4\d{7}))$/,
      "be-BY": /^(\+?375)?(24|25|29|33|44)\d{7}$/,
      "bg-BG": /^(\+?359|0)?8[789]\d{7}$/,
      "bn-BD": /^(\+?880|0)1[13456789][0-9]{8}$/,
      "ca-AD": /^(\+376)?[346]\d{5}$/,
      "cs-CZ": /^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
      "da-DK": /^(\+?45)?\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$/,
      "de-DE": /^((\+49|0)[1|3])([0|5][0-45-9]\d|6([23]|0\d?)|7([0-57-9]|6\d))\d{7,9}$/,
      "de-AT": /^(\+43|0)\d{1,4}\d{3,12}$/,
      "de-CH": /^(\+41|0)([1-9])\d{1,9}$/,
      "de-LU": /^(\+352)?((6\d1)\d{6})$/,
      "dv-MV": /^(\+?960)?(7[2-9]|91|9[3-9])\d{7}$/,
      "el-GR": /^(\+?30|0)?(69\d{8})$/,
      "en-AU": /^(\+?61|0)4\d{8}$/,
      "en-BM": /^(\+?1)?441(((3|7)\d{6}$)|(5[0-3][0-9]\d{4}$)|(59\d{5}))/,
      "en-GB": /^(\+?44|0)7\d{9}$/,
      "en-GG": /^(\+?44|0)1481\d{6}$/,
      "en-GH": /^(\+233|0)(20|50|24|54|27|57|26|56|23|28|55|59)\d{7}$/,
      "en-GY": /^(\+592|0)6\d{6}$/,
      "en-HK": /^(\+?852[-\s]?)?[456789]\d{3}[-\s]?\d{4}$/,
      "en-MO": /^(\+?853[-\s]?)?[6]\d{3}[-\s]?\d{4}$/,
      "en-IE": /^(\+?353|0)8[356789]\d{7}$/,
      "en-IN": /^(\+?91|0)?[6789]\d{9}$/,
      "en-KE": /^(\+?254|0)(7|1)\d{8}$/,
      "en-KI": /^((\+686|686)?)?( )?((6|7)(2|3|8)[0-9]{6})$/,
      "en-MT": /^(\+?356|0)?(99|79|77|21|27|22|25)[0-9]{6}$/,
      "en-MU": /^(\+?230|0)?\d{8}$/,
      "en-NA": /^(\+?264|0)(6|8)\d{7}$/,
      "en-NG": /^(\+?234|0)?[789]\d{9}$/,
      "en-NZ": /^(\+?64|0)[28]\d{7,9}$/,
      "en-PK": /^((00|\+)?92|0)3[0-6]\d{8}$/,
      "en-PH": /^(09|\+639)\d{9}$/,
      "en-RW": /^(\+?250|0)?[7]\d{8}$/,
      "en-SG": /^(\+65)?[3689]\d{7}$/,
      "en-SL": /^(\+?232|0)\d{8}$/,
      "en-TZ": /^(\+?255|0)?[67]\d{8}$/,
      "en-UG": /^(\+?256|0)?[7]\d{8}$/,
      "en-US": /^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$/,
      "en-ZA": /^(\+?27|0)\d{9}$/,
      "en-ZM": /^(\+?26)?09[567]\d{7}$/,
      "en-ZW": /^(\+263)[0-9]{9}$/,
      "en-BW": /^(\+?267)?(7[1-8]{1})\d{6}$/,
      "es-AR": /^\+?549(11|[2368]\d)\d{8}$/,
      "es-BO": /^(\+?591)?(6|7)\d{7}$/,
      "es-CO": /^(\+?57)?3(0(0|1|2|4|5)|1\d|2[0-4]|5(0|1))\d{7}$/,
      "es-CL": /^(\+?56|0)[2-9]\d{1}\d{7}$/,
      "es-CR": /^(\+506)?[2-8]\d{7}$/,
      "es-CU": /^(\+53|0053)?5\d{7}/,
      "es-DO": /^(\+?1)?8[024]9\d{7}$/,
      "es-HN": /^(\+?504)?[9|8]\d{7}$/,
      "es-EC": /^(\+?593|0)([2-7]|9[2-9])\d{7}$/,
      "es-ES": /^(\+?34)?[6|7]\d{8}$/,
      "es-PE": /^(\+?51)?9\d{8}$/,
      "es-MX": /^(\+?52)?(1|01)?\d{10,11}$/,
      "es-PA": /^(\+?507)\d{7,8}$/,
      "es-PY": /^(\+?595|0)9[9876]\d{7}$/,
      "es-SV": /^(\+?503)?[67]\d{7}$/,
      "es-UY": /^(\+598|0)9[1-9][\d]{6}$/,
      "es-VE": /^(\+?58)?(2|4)\d{9}$/,
      "et-EE": /^(\+?372)?\s?(5|8[1-4])\s?([0-9]\s?){6,7}$/,
      "fa-IR": /^(\+?98[\-\s]?|0)9[0-39]\d[\-\s]?\d{3}[\-\s]?\d{4}$/,
      "fi-FI": /^(\+?358|0)\s?(4(0|1|2|4|5|6)?|50)\s?(\d\s?){4,8}\d$/,
      "fj-FJ": /^(\+?679)?\s?\d{3}\s?\d{4}$/,
      "fo-FO": /^(\+?298)?\s?\d{2}\s?\d{2}\s?\d{2}$/,
      "fr-BF": /^(\+226|0)[67]\d{7}$/,
      "fr-CM": /^(\+?237)6[0-9]{8}$/,
      "fr-FR": /^(\+?33|0)[67]\d{8}$/,
      "fr-GF": /^(\+?594|0|00594)[67]\d{8}$/,
      "fr-GP": /^(\+?590|0|00590)[67]\d{8}$/,
      "fr-MQ": /^(\+?596|0|00596)[67]\d{8}$/,
      "fr-PF": /^(\+?689)?8[789]\d{6}$/,
      "fr-RE": /^(\+?262|0|00262)[67]\d{8}$/,
      "he-IL": /^(\+972|0)([23489]|5[012345689]|77)[1-9]\d{6}$/,
      "hu-HU": /^(\+?36|06)(20|30|31|50|70)\d{7}$/,
      "id-ID": /^(\+?62|0)8(1[123456789]|2[1238]|3[1238]|5[12356789]|7[78]|9[56789]|8[123456789])([\s?|\d]{5,11})$/,
      "it-IT": /^(\+?39)?\s?3\d{2} ?\d{6,7}$/,
      "it-SM": /^((\+378)|(0549)|(\+390549)|(\+3780549))?6\d{5,9}$/,
      "ja-JP": /^(\+81[ \-]?(\(0\))?|0)[6789]0[ \-]?\d{4}[ \-]?\d{4}$/,
      "ka-GE": /^(\+?995)?(5|79)\d{7}$/,
      "kk-KZ": /^(\+?7|8)?7\d{9}$/,
      "kl-GL": /^(\+?299)?\s?\d{2}\s?\d{2}\s?\d{2}$/,
      "ko-KR": /^((\+?82)[ \-]?)?0?1([0|1|6|7|8|9]{1})[ \-]?\d{3,4}[ \-]?\d{4}$/,
      "lt-LT": /^(\+370|8)\d{8}$/,
      "lv-LV": /^(\+?371)2\d{7}$/,
      "ms-MY": /^(\+?6?01){1}(([0145]{1}(\-|\s)?\d{7,8})|([236789]{1}(\s|\-)?\d{7}))$/,
      "mz-MZ": /^(\+?258)?8[234567]\d{7}$/,
      "nb-NO": /^(\+?47)?[49]\d{7}$/,
      "ne-NP": /^(\+?977)?9[78]\d{8}$/,
      "nl-BE": /^(\+?32|0)4\d{8}$/,
      "nl-NL": /^(((\+|00)?31\(0\))|((\+|00)?31)|0)6{1}\d{8}$/,
      "nn-NO": /^(\+?47)?[49]\d{7}$/,
      "pl-PL": /^(\+?48)? ?[5-8]\d ?\d{3} ?\d{2} ?\d{2}$/,
      "pt-BR": /^((\+?55\ ?[1-9]{2}\ ?)|(\+?55\ ?\([1-9]{2}\)\ ?)|(0[1-9]{2}\ ?)|(\([1-9]{2}\)\ ?)|([1-9]{2}\ ?))((\d{4}\-?\d{4})|(9[2-9]{1}\d{3}\-?\d{4}))$/,
      "pt-PT": /^(\+?351)?9[1236]\d{7}$/,
      "pt-AO": /^(\+244)\d{9}$/,
      "ro-RO": /^(\+?4?0)\s?7\d{2}(\/|\s|\.|\-)?\d{3}(\s|\.|\-)?\d{3}$/,
      "ru-RU": /^(\+?7|8)?9\d{9}$/,
      "si-LK": /^(?:0|94|\+94)?(7(0|1|2|4|5|6|7|8)( |-)?)\d{7}$/,
      "sl-SI": /^(\+386\s?|0)(\d{1}\s?\d{3}\s?\d{2}\s?\d{2}|\d{2}\s?\d{3}\s?\d{3})$/,
      "sk-SK": /^(\+?421)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$/,
      "sq-AL": /^(\+355|0)6[789]\d{6}$/,
      "sr-RS": /^(\+3816|06)[- \d]{5,9}$/,
      "sv-SE": /^(\+?46|0)[\s\-]?7[\s\-]?[02369]([\s\-]?\d){7}$/,
      "tg-TJ": /^(\+?992)?[5][5]\d{7}$/,
      "th-TH": /^(\+66|66|0)\d{9}$/,
      "tr-TR": /^(\+?90|0)?5\d{9}$/,
      "tk-TM": /^(\+993|993|8)\d{8}$/,
      "uk-UA": /^(\+?38|8)?0\d{9}$/,
      "uz-UZ": /^(\+?998)?(6[125-79]|7[1-69]|88|9\d)\d{7}$/,
      "vi-VN": /^((\+?84)|0)((3([2-9]))|(5([25689]))|(7([0|6-9]))|(8([1-9]))|(9([0-9])))([0-9]{7})$/,
      "zh-CN": /^((\+|00)86)?(1[3-9]|9[28])\d{9}$/,
      "zh-TW": /^(\+?886\-?|0)?9\d{8}$/,
      "dz-BT": /^(\+?975|0)?(17|16|77|02)\d{6}$/
    };
    phones["en-CA"] = phones["en-US"];
    phones["fr-CA"] = phones["en-CA"];
    phones["fr-BE"] = phones["nl-BE"];
    phones["zh-HK"] = phones["en-HK"];
    phones["zh-MO"] = phones["en-MO"];
    phones["ga-IE"] = phones["en-IE"];
    phones["fr-CH"] = phones["de-CH"];
    phones["it-CH"] = phones["fr-CH"];
    function isMobilePhone(str, locale, options) {
      (0, _assertString.default)(str);
      if (options && options.strictMode && !str.startsWith("+")) {
        return false;
      }
      if (Array.isArray(locale)) {
        return locale.some(function(key2) {
          if (phones.hasOwnProperty(key2)) {
            var phone2 = phones[key2];
            if (phone2.test(str)) {
              return true;
            }
          }
          return false;
        });
      } else if (locale in phones) {
        return phones[locale].test(str);
      } else if (!locale || locale === "any") {
        for (var key in phones) {
          if (phones.hasOwnProperty(key)) {
            var phone = phones[key];
            if (phone.test(str)) {
              return true;
            }
          }
        }
        return false;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    var locales = Object.keys(phones);
    exports.locales = locales;
  }
});

// node_modules/validator/lib/isEthereumAddress.js
var require_isEthereumAddress = __commonJS({
  "node_modules/validator/lib/isEthereumAddress.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isEthereumAddress;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var eth = /^(0x)[0-9a-f]{40}$/i;
    function isEthereumAddress(str) {
      (0, _assertString.default)(str);
      return eth.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isCurrency.js
var require_isCurrency = __commonJS({
  "node_modules/validator/lib/isCurrency.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isCurrency;
    var _merge = _interopRequireDefault(require_merge());
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function currencyRegex(options) {
      var decimal_digits = "\\d{".concat(options.digits_after_decimal[0], "}");
      options.digits_after_decimal.forEach(function(digit, index) {
        if (index !== 0)
          decimal_digits = "".concat(decimal_digits, "|\\d{").concat(digit, "}");
      });
      var symbol = "(".concat(options.symbol.replace(/\W/, function(m) {
        return "\\".concat(m);
      }), ")").concat(options.require_symbol ? "" : "?"), negative = "-?", whole_dollar_amount_without_sep = "[1-9]\\d*", whole_dollar_amount_with_sep = "[1-9]\\d{0,2}(\\".concat(options.thousands_separator, "\\d{3})*"), valid_whole_dollar_amounts = ["0", whole_dollar_amount_without_sep, whole_dollar_amount_with_sep], whole_dollar_amount = "(".concat(valid_whole_dollar_amounts.join("|"), ")?"), decimal_amount = "(\\".concat(options.decimal_separator, "(").concat(decimal_digits, "))").concat(options.require_decimal ? "" : "?");
      var pattern = whole_dollar_amount + (options.allow_decimal || options.require_decimal ? decimal_amount : "");
      if (options.allow_negatives && !options.parens_for_negatives) {
        if (options.negative_sign_after_digits) {
          pattern += negative;
        } else if (options.negative_sign_before_digits) {
          pattern = negative + pattern;
        }
      }
      if (options.allow_negative_sign_placeholder) {
        pattern = "( (?!\\-))?".concat(pattern);
      } else if (options.allow_space_after_symbol) {
        pattern = " ?".concat(pattern);
      } else if (options.allow_space_after_digits) {
        pattern += "( (?!$))?";
      }
      if (options.symbol_after_digits) {
        pattern += symbol;
      } else {
        pattern = symbol + pattern;
      }
      if (options.allow_negatives) {
        if (options.parens_for_negatives) {
          pattern = "(\\(".concat(pattern, "\\)|").concat(pattern, ")");
        } else if (!(options.negative_sign_before_digits || options.negative_sign_after_digits)) {
          pattern = negative + pattern;
        }
      }
      return new RegExp("^(?!-? )(?=.*\\d)".concat(pattern, "$"));
    }
    var default_currency_options = {
      symbol: "$",
      require_symbol: false,
      allow_space_after_symbol: false,
      symbol_after_digits: false,
      allow_negatives: true,
      parens_for_negatives: false,
      negative_sign_before_digits: false,
      negative_sign_after_digits: false,
      allow_negative_sign_placeholder: false,
      thousands_separator: ",",
      decimal_separator: ".",
      allow_decimal: true,
      require_decimal: false,
      digits_after_decimal: [2],
      allow_space_after_digits: false
    };
    function isCurrency(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, default_currency_options);
      return currencyRegex(options).test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isBtcAddress.js
var require_isBtcAddress = __commonJS({
  "node_modules/validator/lib/isBtcAddress.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBtcAddress;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var bech32 = /^(bc1)[a-z0-9]{25,39}$/;
    var base58 = /^(1|3)[A-HJ-NP-Za-km-z1-9]{25,39}$/;
    function isBtcAddress(str) {
      (0, _assertString.default)(str);
      if (str.startsWith("bc1")) {
        return bech32.test(str);
      }
      return base58.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isISO8601.js
var require_isISO8601 = __commonJS({
  "node_modules/validator/lib/isISO8601.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO8601;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var iso8601 = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    var iso8601StrictSeparator = /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T]((([01]\d|2[0-3])((:?)[0-5]\d)?|24:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/;
    var isValidDate = function isValidDate2(str) {
      var ordinalMatch = str.match(/^(\d{4})-?(\d{3})([ T]{1}\.*|$)/);
      if (ordinalMatch) {
        var oYear = Number(ordinalMatch[1]);
        var oDay = Number(ordinalMatch[2]);
        if (oYear % 4 === 0 && oYear % 100 !== 0 || oYear % 400 === 0)
          return oDay <= 366;
        return oDay <= 365;
      }
      var match = str.match(/(\d{4})-?(\d{0,2})-?(\d*)/).map(Number);
      var year = match[1];
      var month = match[2];
      var day = match[3];
      var monthString = month ? "0".concat(month).slice(-2) : month;
      var dayString = day ? "0".concat(day).slice(-2) : day;
      var d = new Date("".concat(year, "-").concat(monthString || "01", "-").concat(dayString || "01"));
      if (month && day) {
        return d.getUTCFullYear() === year && d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
      }
      return true;
    };
    function isISO8601(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
      (0, _assertString.default)(str);
      var check = options.strictSeparator ? iso8601StrictSeparator.test(str) : iso8601.test(str);
      if (check && options.strict)
        return isValidDate(str);
      return check;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isRFC3339.js
var require_isRFC3339 = __commonJS({
  "node_modules/validator/lib/isRFC3339.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isRFC3339;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var dateFullYear = /[0-9]{4}/;
    var dateMonth = /(0[1-9]|1[0-2])/;
    var dateMDay = /([12]\d|0[1-9]|3[01])/;
    var timeHour = /([01][0-9]|2[0-3])/;
    var timeMinute = /[0-5][0-9]/;
    var timeSecond = /([0-5][0-9]|60)/;
    var timeSecFrac = /(\.[0-9]+)?/;
    var timeNumOffset = new RegExp("[-+]".concat(timeHour.source, ":").concat(timeMinute.source));
    var timeOffset = new RegExp("([zZ]|".concat(timeNumOffset.source, ")"));
    var partialTime = new RegExp("".concat(timeHour.source, ":").concat(timeMinute.source, ":").concat(timeSecond.source).concat(timeSecFrac.source));
    var fullDate = new RegExp("".concat(dateFullYear.source, "-").concat(dateMonth.source, "-").concat(dateMDay.source));
    var fullTime = new RegExp("".concat(partialTime.source).concat(timeOffset.source));
    var rfc3339 = new RegExp("^".concat(fullDate.source, "[ tT]").concat(fullTime.source, "$"));
    function isRFC3339(str) {
      (0, _assertString.default)(str);
      return rfc3339.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isISO31661Alpha3.js
var require_isISO31661Alpha3 = __commonJS({
  "node_modules/validator/lib/isISO31661Alpha3.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO31661Alpha3;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var validISO31661Alpha3CountriesCodes = new Set(["AFG", "ALA", "ALB", "DZA", "ASM", "AND", "AGO", "AIA", "ATA", "ATG", "ARG", "ARM", "ABW", "AUS", "AUT", "AZE", "BHS", "BHR", "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BMU", "BTN", "BOL", "BES", "BIH", "BWA", "BVT", "BRA", "IOT", "BRN", "BGR", "BFA", "BDI", "KHM", "CMR", "CAN", "CPV", "CYM", "CAF", "TCD", "CHL", "CHN", "CXR", "CCK", "COL", "COM", "COG", "COD", "COK", "CRI", "CIV", "HRV", "CUB", "CUW", "CYP", "CZE", "DNK", "DJI", "DMA", "DOM", "ECU", "EGY", "SLV", "GNQ", "ERI", "EST", "ETH", "FLK", "FRO", "FJI", "FIN", "FRA", "GUF", "PYF", "ATF", "GAB", "GMB", "GEO", "DEU", "GHA", "GIB", "GRC", "GRL", "GRD", "GLP", "GUM", "GTM", "GGY", "GIN", "GNB", "GUY", "HTI", "HMD", "VAT", "HND", "HKG", "HUN", "ISL", "IND", "IDN", "IRN", "IRQ", "IRL", "IMN", "ISR", "ITA", "JAM", "JPN", "JEY", "JOR", "KAZ", "KEN", "KIR", "PRK", "KOR", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE", "LTU", "LUX", "MAC", "MKD", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MTQ", "MRT", "MUS", "MYT", "MEX", "FSM", "MDA", "MCO", "MNG", "MNE", "MSR", "MAR", "MOZ", "MMR", "NAM", "NRU", "NPL", "NLD", "NCL", "NZL", "NIC", "NER", "NGA", "NIU", "NFK", "MNP", "NOR", "OMN", "PAK", "PLW", "PSE", "PAN", "PNG", "PRY", "PER", "PHL", "PCN", "POL", "PRT", "PRI", "QAT", "REU", "ROU", "RUS", "RWA", "BLM", "SHN", "KNA", "LCA", "MAF", "SPM", "VCT", "WSM", "SMR", "STP", "SAU", "SEN", "SRB", "SYC", "SLE", "SGP", "SXM", "SVK", "SVN", "SLB", "SOM", "ZAF", "SGS", "SSD", "ESP", "LKA", "SDN", "SUR", "SJM", "SWZ", "SWE", "CHE", "SYR", "TWN", "TJK", "TZA", "THA", "TLS", "TGO", "TKL", "TON", "TTO", "TUN", "TUR", "TKM", "TCA", "TUV", "UGA", "UKR", "ARE", "GBR", "USA", "UMI", "URY", "UZB", "VUT", "VEN", "VNM", "VGB", "VIR", "WLF", "ESH", "YEM", "ZMB", "ZWE"]);
    function isISO31661Alpha3(str) {
      (0, _assertString.default)(str);
      return validISO31661Alpha3CountriesCodes.has(str.toUpperCase());
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isISO4217.js
var require_isISO4217 = __commonJS({
  "node_modules/validator/lib/isISO4217.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isISO4217;
    exports.CurrencyCodes = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var validISO4217CurrencyCodes = new Set(["AED", "AFN", "ALL", "AMD", "ANG", "AOA", "ARS", "AUD", "AWG", "AZN", "BAM", "BBD", "BDT", "BGN", "BHD", "BIF", "BMD", "BND", "BOB", "BOV", "BRL", "BSD", "BTN", "BWP", "BYN", "BZD", "CAD", "CDF", "CHE", "CHF", "CHW", "CLF", "CLP", "CNY", "COP", "COU", "CRC", "CUC", "CUP", "CVE", "CZK", "DJF", "DKK", "DOP", "DZD", "EGP", "ERN", "ETB", "EUR", "FJD", "FKP", "GBP", "GEL", "GHS", "GIP", "GMD", "GNF", "GTQ", "GYD", "HKD", "HNL", "HRK", "HTG", "HUF", "IDR", "ILS", "INR", "IQD", "IRR", "ISK", "JMD", "JOD", "JPY", "KES", "KGS", "KHR", "KMF", "KPW", "KRW", "KWD", "KYD", "KZT", "LAK", "LBP", "LKR", "LRD", "LSL", "LYD", "MAD", "MDL", "MGA", "MKD", "MMK", "MNT", "MOP", "MRU", "MUR", "MVR", "MWK", "MXN", "MXV", "MYR", "MZN", "NAD", "NGN", "NIO", "NOK", "NPR", "NZD", "OMR", "PAB", "PEN", "PGK", "PHP", "PKR", "PLN", "PYG", "QAR", "RON", "RSD", "RUB", "RWF", "SAR", "SBD", "SCR", "SDG", "SEK", "SGD", "SHP", "SLL", "SOS", "SRD", "SSP", "STN", "SVC", "SYP", "SZL", "THB", "TJS", "TMT", "TND", "TOP", "TRY", "TTD", "TWD", "TZS", "UAH", "UGX", "USD", "USN", "UYI", "UYU", "UYW", "UZS", "VES", "VND", "VUV", "WST", "XAF", "XAG", "XAU", "XBA", "XBB", "XBC", "XBD", "XCD", "XDR", "XOF", "XPD", "XPF", "XPT", "XSU", "XTS", "XUA", "XXX", "YER", "ZAR", "ZMW", "ZWL"]);
    function isISO4217(str) {
      (0, _assertString.default)(str);
      return validISO4217CurrencyCodes.has(str.toUpperCase());
    }
    var CurrencyCodes = validISO4217CurrencyCodes;
    exports.CurrencyCodes = CurrencyCodes;
  }
});

// node_modules/validator/lib/isBase32.js
var require_isBase32 = __commonJS({
  "node_modules/validator/lib/isBase32.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBase32;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var base32 = /^[A-Z2-7]+=*$/;
    function isBase32(str) {
      (0, _assertString.default)(str);
      var len = str.length;
      if (len % 8 === 0 && base32.test(str)) {
        return true;
      }
      return false;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isBase58.js
var require_isBase58 = __commonJS({
  "node_modules/validator/lib/isBase58.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isBase58;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var base58Reg = /^[A-HJ-NP-Za-km-z1-9]*$/;
    function isBase58(str) {
      (0, _assertString.default)(str);
      if (base58Reg.test(str)) {
        return true;
      }
      return false;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isDataURI.js
var require_isDataURI = __commonJS({
  "node_modules/validator/lib/isDataURI.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isDataURI;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var validMediaType = /^[a-z]+\/[a-z0-9\-\+]+$/i;
    var validAttribute = /^[a-z\-]+=[a-z0-9\-]+$/i;
    var validData = /^[a-z0-9!\$&'\(\)\*\+,;=\-\._~:@\/\?%\s]*$/i;
    function isDataURI(str) {
      (0, _assertString.default)(str);
      var data = str.split(",");
      if (data.length < 2) {
        return false;
      }
      var attributes = data.shift().trim().split(";");
      var schemeAndMediaType = attributes.shift();
      if (schemeAndMediaType.substr(0, 5) !== "data:") {
        return false;
      }
      var mediaType = schemeAndMediaType.substr(5);
      if (mediaType !== "" && !validMediaType.test(mediaType)) {
        return false;
      }
      for (var i = 0; i < attributes.length; i++) {
        if (!(i === attributes.length - 1 && attributes[i].toLowerCase() === "base64") && !validAttribute.test(attributes[i])) {
          return false;
        }
      }
      for (var _i = 0; _i < data.length; _i++) {
        if (!validData.test(data[_i])) {
          return false;
        }
      }
      return true;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isMagnetURI.js
var require_isMagnetURI = __commonJS({
  "node_modules/validator/lib/isMagnetURI.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMagnetURI;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var magnetURI = /^magnet:\?xt(?:\.1)?=urn:(?:aich|bitprint|btih|ed2k|ed2khash|kzhash|md5|sha1|tree:tiger):[a-z0-9]{32}(?:[a-z0-9]{8})?($|&)/i;
    function isMagnetURI(url) {
      (0, _assertString.default)(url);
      return magnetURI.test(url.trim());
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isMimeType.js
var require_isMimeType = __commonJS({
  "node_modules/validator/lib/isMimeType.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isMimeType;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var mimeTypeSimple = /^(application|audio|font|image|message|model|multipart|text|video)\/[a-zA-Z0-9\.\-\+]{1,100}$/i;
    var mimeTypeText = /^text\/[a-zA-Z0-9\.\-\+]{1,100};\s?charset=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?$/i;
    var mimeTypeMultipart = /^multipart\/[a-zA-Z0-9\.\-\+]{1,100}(;\s?(boundary|charset)=("[a-zA-Z0-9\.\-\+\s]{0,70}"|[a-zA-Z0-9\.\-\+]{0,70})(\s?\([a-zA-Z0-9\.\-\+\s]{1,20}\))?){0,2}$/i;
    function isMimeType(str) {
      (0, _assertString.default)(str);
      return mimeTypeSimple.test(str) || mimeTypeText.test(str) || mimeTypeMultipart.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isLatLong.js
var require_isLatLong = __commonJS({
  "node_modules/validator/lib/isLatLong.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLatLong;
    var _assertString = _interopRequireDefault(require_assertString());
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var lat = /^\(?[+-]?(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;
    var long = /^\s?[+-]?(180(\.0+)?|1[0-7]\d(\.\d+)?|\d{1,2}(\.\d+)?)\)?$/;
    var latDMS = /^(([1-8]?\d)\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|90\D+0\D+0)\D+[NSns]?$/i;
    var longDMS = /^\s*([1-7]?\d{1,2}\D+([1-5]?\d|60)\D+([1-5]?\d|60)(\.\d+)?|180\D+0\D+0)\D+[EWew]?$/i;
    var defaultLatLongOptions = {
      checkDMS: false
    };
    function isLatLong(str, options) {
      (0, _assertString.default)(str);
      options = (0, _merge.default)(options, defaultLatLongOptions);
      if (!str.includes(","))
        return false;
      var pair = str.split(",");
      if (pair[0].startsWith("(") && !pair[1].endsWith(")") || pair[1].endsWith(")") && !pair[0].startsWith("("))
        return false;
      if (options.checkDMS) {
        return latDMS.test(pair[0]) && longDMS.test(pair[1]);
      }
      return lat.test(pair[0]) && long.test(pair[1]);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isPostalCode.js
var require_isPostalCode = __commonJS({
  "node_modules/validator/lib/isPostalCode.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isPostalCode;
    exports.locales = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var threeDigit = /^\d{3}$/;
    var fourDigit = /^\d{4}$/;
    var fiveDigit = /^\d{5}$/;
    var sixDigit = /^\d{6}$/;
    var patterns = {
      AD: /^AD\d{3}$/,
      AT: fourDigit,
      AU: fourDigit,
      AZ: /^AZ\d{4}$/,
      BE: fourDigit,
      BG: fourDigit,
      BR: /^\d{5}-\d{3}$/,
      BY: /2[1-4]{1}\d{4}$/,
      CA: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s\-]?\d[ABCEGHJ-NPRSTV-Z]\d$/i,
      CH: fourDigit,
      CN: /^(0[1-7]|1[012356]|2[0-7]|3[0-6]|4[0-7]|5[1-7]|6[1-7]|7[1-5]|8[1345]|9[09])\d{4}$/,
      CZ: /^\d{3}\s?\d{2}$/,
      DE: fiveDigit,
      DK: fourDigit,
      DO: fiveDigit,
      DZ: fiveDigit,
      EE: fiveDigit,
      ES: /^(5[0-2]{1}|[0-4]{1}\d{1})\d{3}$/,
      FI: fiveDigit,
      FR: /^\d{2}\s?\d{3}$/,
      GB: /^(gir\s?0aa|[a-z]{1,2}\d[\da-z]?\s?(\d[a-z]{2})?)$/i,
      GR: /^\d{3}\s?\d{2}$/,
      HR: /^([1-5]\d{4}$)/,
      HT: /^HT\d{4}$/,
      HU: fourDigit,
      ID: fiveDigit,
      IE: /^(?!.*(?:o))[A-Za-z]\d[\dw]\s\w{4}$/i,
      IL: /^(\d{5}|\d{7})$/,
      IN: /^((?!10|29|35|54|55|65|66|86|87|88|89)[1-9][0-9]{5})$/,
      IR: /\b(?!(\d)\1{3})[13-9]{4}[1346-9][013-9]{5}\b/,
      IS: threeDigit,
      IT: fiveDigit,
      JP: /^\d{3}\-\d{4}$/,
      KE: fiveDigit,
      KR: /^(\d{5}|\d{6})$/,
      LI: /^(948[5-9]|949[0-7])$/,
      LT: /^LT\-\d{5}$/,
      LU: fourDigit,
      LV: /^LV\-\d{4}$/,
      LK: fiveDigit,
      MX: fiveDigit,
      MT: /^[A-Za-z]{3}\s{0,1}\d{4}$/,
      MY: fiveDigit,
      NL: /^\d{4}\s?[a-z]{2}$/i,
      NO: fourDigit,
      NP: /^(10|21|22|32|33|34|44|45|56|57)\d{3}$|^(977)$/i,
      NZ: fourDigit,
      PL: /^\d{2}\-\d{3}$/,
      PR: /^00[679]\d{2}([ -]\d{4})?$/,
      PT: /^\d{4}\-\d{3}?$/,
      RO: sixDigit,
      RU: sixDigit,
      SA: fiveDigit,
      SE: /^[1-9]\d{2}\s?\d{2}$/,
      SG: sixDigit,
      SI: fourDigit,
      SK: /^\d{3}\s?\d{2}$/,
      TH: fiveDigit,
      TN: fourDigit,
      TW: /^\d{3}(\d{2})?$/,
      UA: fiveDigit,
      US: /^\d{5}(-\d{4})?$/,
      ZA: fourDigit,
      ZM: fiveDigit
    };
    var locales = Object.keys(patterns);
    exports.locales = locales;
    function isPostalCode(str, locale) {
      (0, _assertString.default)(str);
      if (locale in patterns) {
        return patterns[locale].test(str);
      } else if (locale === "any") {
        for (var key in patterns) {
          if (patterns.hasOwnProperty(key)) {
            var pattern = patterns[key];
            if (pattern.test(str)) {
              return true;
            }
          }
        }
        return false;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
  }
});

// node_modules/validator/lib/ltrim.js
var require_ltrim = __commonJS({
  "node_modules/validator/lib/ltrim.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = ltrim;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function ltrim(str, chars) {
      (0, _assertString.default)(str);
      var pattern = chars ? new RegExp("^[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "]+"), "g") : /^\s+/g;
      return str.replace(pattern, "");
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/rtrim.js
var require_rtrim = __commonJS({
  "node_modules/validator/lib/rtrim.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = rtrim;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function rtrim(str, chars) {
      (0, _assertString.default)(str);
      if (chars) {
        var pattern = new RegExp("[".concat(chars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "]+$"), "g");
        return str.replace(pattern, "");
      }
      var strIndex = str.length - 1;
      while (/\s/.test(str.charAt(strIndex))) {
        strIndex -= 1;
      }
      return str.slice(0, strIndex + 1);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/trim.js
var require_trim = __commonJS({
  "node_modules/validator/lib/trim.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = trim;
    var _rtrim = _interopRequireDefault(require_rtrim());
    var _ltrim = _interopRequireDefault(require_ltrim());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function trim(str, chars) {
      return (0, _rtrim.default)((0, _ltrim.default)(str, chars), chars);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/escape.js
var require_escape = __commonJS({
  "node_modules/validator/lib/escape.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = escape;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function escape(str) {
      (0, _assertString.default)(str);
      return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\//g, "&#x2F;").replace(/\\/g, "&#x5C;").replace(/`/g, "&#96;");
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/unescape.js
var require_unescape = __commonJS({
  "node_modules/validator/lib/unescape.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = unescape;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function unescape(str) {
      (0, _assertString.default)(str);
      return str.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x2F;/g, "/").replace(/&#x5C;/g, "\\").replace(/&#96;/g, "`").replace(/&amp;/g, "&");
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/blacklist.js
var require_blacklist = __commonJS({
  "node_modules/validator/lib/blacklist.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = blacklist;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function blacklist(str, chars) {
      (0, _assertString.default)(str);
      return str.replace(new RegExp("[".concat(chars, "]+"), "g"), "");
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/stripLow.js
var require_stripLow = __commonJS({
  "node_modules/validator/lib/stripLow.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = stripLow;
    var _assertString = _interopRequireDefault(require_assertString());
    var _blacklist = _interopRequireDefault(require_blacklist());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function stripLow(str, keep_new_lines) {
      (0, _assertString.default)(str);
      var chars = keep_new_lines ? "\\x00-\\x09\\x0B\\x0C\\x0E-\\x1F\\x7F" : "\\x00-\\x1F\\x7F";
      return (0, _blacklist.default)(str, chars);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/whitelist.js
var require_whitelist = __commonJS({
  "node_modules/validator/lib/whitelist.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = whitelist;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function whitelist(str, chars) {
      (0, _assertString.default)(str);
      return str.replace(new RegExp("[^".concat(chars, "]+"), "g"), "");
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isWhitelisted.js
var require_isWhitelisted = __commonJS({
  "node_modules/validator/lib/isWhitelisted.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isWhitelisted;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    function isWhitelisted(str, chars) {
      (0, _assertString.default)(str);
      for (var i = str.length - 1; i >= 0; i--) {
        if (chars.indexOf(str[i]) === -1) {
          return false;
        }
      }
      return true;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/normalizeEmail.js
var require_normalizeEmail = __commonJS({
  "node_modules/validator/lib/normalizeEmail.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = normalizeEmail;
    var _merge = _interopRequireDefault(require_merge());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var default_normalize_email_options = {
      all_lowercase: true,
      gmail_lowercase: true,
      gmail_remove_dots: true,
      gmail_remove_subaddress: true,
      gmail_convert_googlemaildotcom: true,
      outlookdotcom_lowercase: true,
      outlookdotcom_remove_subaddress: true,
      yahoo_lowercase: true,
      yahoo_remove_subaddress: true,
      yandex_lowercase: true,
      icloud_lowercase: true,
      icloud_remove_subaddress: true
    };
    var icloud_domains = ["icloud.com", "me.com"];
    var outlookdotcom_domains = ["hotmail.at", "hotmail.be", "hotmail.ca", "hotmail.cl", "hotmail.co.il", "hotmail.co.nz", "hotmail.co.th", "hotmail.co.uk", "hotmail.com", "hotmail.com.ar", "hotmail.com.au", "hotmail.com.br", "hotmail.com.gr", "hotmail.com.mx", "hotmail.com.pe", "hotmail.com.tr", "hotmail.com.vn", "hotmail.cz", "hotmail.de", "hotmail.dk", "hotmail.es", "hotmail.fr", "hotmail.hu", "hotmail.id", "hotmail.ie", "hotmail.in", "hotmail.it", "hotmail.jp", "hotmail.kr", "hotmail.lv", "hotmail.my", "hotmail.ph", "hotmail.pt", "hotmail.sa", "hotmail.sg", "hotmail.sk", "live.be", "live.co.uk", "live.com", "live.com.ar", "live.com.mx", "live.de", "live.es", "live.eu", "live.fr", "live.it", "live.nl", "msn.com", "outlook.at", "outlook.be", "outlook.cl", "outlook.co.il", "outlook.co.nz", "outlook.co.th", "outlook.com", "outlook.com.ar", "outlook.com.au", "outlook.com.br", "outlook.com.gr", "outlook.com.pe", "outlook.com.tr", "outlook.com.vn", "outlook.cz", "outlook.de", "outlook.dk", "outlook.es", "outlook.fr", "outlook.hu", "outlook.id", "outlook.ie", "outlook.in", "outlook.it", "outlook.jp", "outlook.kr", "outlook.lv", "outlook.my", "outlook.ph", "outlook.pt", "outlook.sa", "outlook.sg", "outlook.sk", "passport.com"];
    var yahoo_domains = ["rocketmail.com", "yahoo.ca", "yahoo.co.uk", "yahoo.com", "yahoo.de", "yahoo.fr", "yahoo.in", "yahoo.it", "ymail.com"];
    var yandex_domains = ["yandex.ru", "yandex.ua", "yandex.kz", "yandex.com", "yandex.by", "ya.ru"];
    function dotsReplacer(match) {
      if (match.length > 1) {
        return match;
      }
      return "";
    }
    function normalizeEmail(email, options) {
      options = (0, _merge.default)(options, default_normalize_email_options);
      var raw_parts = email.split("@");
      var domain = raw_parts.pop();
      var user = raw_parts.join("@");
      var parts = [user, domain];
      parts[1] = parts[1].toLowerCase();
      if (parts[1] === "gmail.com" || parts[1] === "googlemail.com") {
        if (options.gmail_remove_subaddress) {
          parts[0] = parts[0].split("+")[0];
        }
        if (options.gmail_remove_dots) {
          parts[0] = parts[0].replace(/\.+/g, dotsReplacer);
        }
        if (!parts[0].length) {
          return false;
        }
        if (options.all_lowercase || options.gmail_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
        parts[1] = options.gmail_convert_googlemaildotcom ? "gmail.com" : parts[1];
      } else if (icloud_domains.indexOf(parts[1]) >= 0) {
        if (options.icloud_remove_subaddress) {
          parts[0] = parts[0].split("+")[0];
        }
        if (!parts[0].length) {
          return false;
        }
        if (options.all_lowercase || options.icloud_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
      } else if (outlookdotcom_domains.indexOf(parts[1]) >= 0) {
        if (options.outlookdotcom_remove_subaddress) {
          parts[0] = parts[0].split("+")[0];
        }
        if (!parts[0].length) {
          return false;
        }
        if (options.all_lowercase || options.outlookdotcom_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
      } else if (yahoo_domains.indexOf(parts[1]) >= 0) {
        if (options.yahoo_remove_subaddress) {
          var components = parts[0].split("-");
          parts[0] = components.length > 1 ? components.slice(0, -1).join("-") : components[0];
        }
        if (!parts[0].length) {
          return false;
        }
        if (options.all_lowercase || options.yahoo_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
      } else if (yandex_domains.indexOf(parts[1]) >= 0) {
        if (options.all_lowercase || options.yandex_lowercase) {
          parts[0] = parts[0].toLowerCase();
        }
        parts[1] = "yandex.ru";
      } else if (options.all_lowercase) {
        parts[0] = parts[0].toLowerCase();
      }
      return parts.join("@");
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isSlug.js
var require_isSlug = __commonJS({
  "node_modules/validator/lib/isSlug.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isSlug;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var charsetRegex = /^[^\s-_](?!.*?[-_]{2,})[a-z0-9-\\][^\s]*[^-_\s]$/;
    function isSlug(str) {
      (0, _assertString.default)(str);
      return charsetRegex.test(str);
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isLicensePlate.js
var require_isLicensePlate = __commonJS({
  "node_modules/validator/lib/isLicensePlate.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isLicensePlate;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var validators = {
      "cs-CZ": function csCZ(str) {
        return /^(([ABCDEFHKIJKLMNPRSTUVXYZ]|[0-9])-?){5,8}$/.test(str);
      },
      "de-DE": function deDE(str) {
        return /^((AW|UL|AK|GA|AÖ|LF|AZ|AM|AS|ZE|AN|AB|A|KG|KH|BA|EW|BZ|HY|KM|BT|HP|B|BC|BI|BO|FN|TT|ÜB|BN|AH|BS|FR|HB|ZZ|BB|BK|BÖ|OC|OK|CW|CE|C|CO|LH|CB|KW|LC|LN|DA|DI|DE|DH|SY|NÖ|DO|DD|DU|DN|D|EI|EA|EE|FI|EM|EL|EN|PF|ED|EF|ER|AU|ZP|E|ES|NT|EU|FL|FO|FT|FF|F|FS|FD|FÜ|GE|G|GI|GF|GS|ZR|GG|GP|GR|NY|ZI|GÖ|GZ|GT|HA|HH|HM|HU|WL|HZ|WR|RN|HK|HD|HN|HS|GK|HE|HF|RZ|HI|HG|HO|HX|IK|IL|IN|J|JL|KL|KA|KS|KF|KE|KI|KT|KO|KN|KR|KC|KU|K|LD|LL|LA|L|OP|LM|LI|LB|LU|LÖ|HL|LG|MD|GN|MZ|MA|ML|MR|MY|AT|DM|MC|NZ|RM|RG|MM|ME|MB|MI|FG|DL|HC|MW|RL|MK|MG|MÜ|WS|MH|M|MS|NU|NB|ND|NM|NK|NW|NR|NI|NF|DZ|EB|OZ|TG|TO|N|OA|GM|OB|CA|EH|FW|OF|OL|OE|OG|BH|LR|OS|AA|GD|OH|KY|NP|WK|PB|PA|PE|PI|PS|P|PM|PR|RA|RV|RE|R|H|SB|WN|RS|RD|RT|BM|NE|GV|RP|SU|GL|RO|GÜ|RH|EG|RW|PN|SK|MQ|RU|SZ|RI|SL|SM|SC|HR|FZ|VS|SW|SN|CR|SE|SI|SO|LP|SG|NH|SP|IZ|ST|BF|TE|HV|OD|SR|S|AC|DW|ZW|TF|TS|TR|TÜ|UM|PZ|TP|UE|UN|UH|MN|KK|VB|V|AE|PL|RC|VG|GW|PW|VR|VK|KB|WA|WT|BE|WM|WE|AP|MO|WW|FB|WZ|WI|WB|JE|WF|WO|W|WÜ|BL|Z|GC)[- ]?[A-Z]{1,2}[- ]?\d{1,4}|(AIC|FDB|ABG|SLN|SAW|KLZ|BUL|ESB|NAB|SUL|WST|ABI|AZE|BTF|KÖT|DKB|FEU|ROT|ALZ|SMÜ|WER|AUR|NOR|DÜW|BRK|HAB|TÖL|WOR|BAD|BAR|BER|BIW|EBS|KEM|MÜB|PEG|BGL|BGD|REI|WIL|BKS|BIR|WAT|BOR|BOH|BOT|BRB|BLK|HHM|NEB|NMB|WSF|LEO|HDL|WMS|WZL|BÜS|CHA|KÖZ|ROD|WÜM|CLP|NEC|COC|ZEL|COE|CUX|DAH|LDS|DEG|DEL|RSL|DLG|DGF|LAN|HEI|MED|DON|KIB|ROK|JÜL|MON|SLE|EBE|EIC|HIG|WBS|BIT|PRÜ|LIB|EMD|WIT|ERH|HÖS|ERZ|ANA|ASZ|MAB|MEK|STL|SZB|FDS|HCH|HOR|WOL|FRG|GRA|WOS|FRI|FFB|GAP|GER|BRL|CLZ|GTH|NOH|HGW|GRZ|LÖB|NOL|WSW|DUD|HMÜ|OHA|KRU|HAL|HAM|HBS|QLB|HVL|NAU|HAS|EBN|GEO|HOH|HDH|ERK|HER|WAN|HEF|ROF|HBN|ALF|HSK|USI|NAI|REH|SAN|KÜN|ÖHR|HOL|WAR|ARN|BRG|GNT|HOG|WOH|KEH|MAI|PAR|RID|ROL|KLE|GEL|KUS|KYF|ART|SDH|LDK|DIL|MAL|VIB|LER|BNA|GHA|GRM|MTL|WUR|LEV|LIF|STE|WEL|LIP|VAI|LUP|HGN|LBZ|LWL|PCH|STB|DAN|MKK|SLÜ|MSP|TBB|MGH|MTK|BIN|MSH|EIL|HET|SGH|BID|MYK|MSE|MST|MÜR|WRN|MEI|GRH|RIE|MZG|MIL|OBB|BED|FLÖ|MOL|FRW|SEE|SRB|AIB|MOS|BCH|ILL|SOB|NMS|NEA|SEF|UFF|NEW|VOH|NDH|TDO|NWM|GDB|GVM|WIS|NOM|EIN|GAN|LAU|HEB|OHV|OSL|SFB|ERB|LOS|BSK|KEL|BSB|MEL|WTL|OAL|FÜS|MOD|OHZ|OPR|BÜR|PAF|PLÖ|CAS|GLA|REG|VIT|ECK|SIM|GOA|EMS|DIZ|GOH|RÜD|SWA|NES|KÖN|MET|LRO|BÜZ|DBR|ROS|TET|HRO|ROW|BRV|HIP|PAN|GRI|SHK|EIS|SRO|SOK|LBS|SCZ|MER|QFT|SLF|SLS|HOM|SLK|ASL|BBG|SBK|SFT|SHG|MGN|MEG|ZIG|SAD|NEN|OVI|SHA|BLB|SIG|SON|SPN|FOR|GUB|SPB|IGB|WND|STD|STA|SDL|OBG|HST|BOG|SHL|PIR|FTL|SEB|SÖM|SÜW|TIR|SAB|TUT|ANG|SDT|LÜN|LSZ|MHL|VEC|VER|VIE|OVL|ANK|OVP|SBG|UEM|UER|WLG|GMN|NVP|RDG|RÜG|DAU|FKB|WAF|WAK|SLZ|WEN|SOG|APD|WUG|GUN|ESW|WIZ|WES|DIN|BRA|BÜD|WHV|HWI|GHC|WTM|WOB|WUN|MAK|SEL|OCH|HOT|WDA)[- ]?(([A-Z][- ]?\d{1,4})|([A-Z]{2}[- ]?\d{1,3})))[- ]?(E|H)?$/.test(str);
      },
      "de-LI": function deLI(str) {
        return /^FL[- ]?\d{1,5}[UZ]?$/.test(str);
      },
      "fi-FI": function fiFI(str) {
        return /^(?=.{4,7})(([A-Z]{1,3}|[0-9]{1,3})[\s-]?([A-Z]{1,3}|[0-9]{1,5}))$/.test(str);
      },
      "pt-PT": function ptPT(str) {
        return /^([A-Z]{2}|[0-9]{2})[ -·]?([A-Z]{2}|[0-9]{2})[ -·]?([A-Z]{2}|[0-9]{2})$/.test(str);
      },
      "sq-AL": function sqAL(str) {
        return /^[A-Z]{2}[- ]?((\d{3}[- ]?(([A-Z]{2})|T))|(R[- ]?\d{3}))$/.test(str);
      },
      "pt-BR": function ptBR(str) {
        return /^[A-Z]{3}[ -]?[0-9][A-Z][0-9]{2}|[A-Z]{3}[ -]?[0-9]{4}$/.test(str);
      }
    };
    function isLicensePlate(str, locale) {
      (0, _assertString.default)(str);
      if (locale in validators) {
        return validators[locale](str);
      } else if (locale === "any") {
        for (var key in validators) {
          var validator = validators[key];
          if (validator(str)) {
            return true;
          }
        }
        return false;
      }
      throw new Error("Invalid locale '".concat(locale, "'"));
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isStrongPassword.js
var require_isStrongPassword = __commonJS({
  "node_modules/validator/lib/isStrongPassword.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isStrongPassword;
    var _merge = _interopRequireDefault(require_merge());
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var upperCaseRegex = /^[A-Z]$/;
    var lowerCaseRegex = /^[a-z]$/;
    var numberRegex = /^[0-9]$/;
    var symbolRegex = /^[-#!$@%^&*()_+|~=`{}\[\]:";'<>?,.\/ ]$/;
    var defaultOptions = {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      returnScore: false,
      pointsPerUnique: 1,
      pointsPerRepeat: 0.5,
      pointsForContainingLower: 10,
      pointsForContainingUpper: 10,
      pointsForContainingNumber: 10,
      pointsForContainingSymbol: 10
    };
    function countChars(str) {
      var result = {};
      Array.from(str).forEach(function(char) {
        var curVal = result[char];
        if (curVal) {
          result[char] += 1;
        } else {
          result[char] = 1;
        }
      });
      return result;
    }
    function analyzePassword(password) {
      var charMap = countChars(password);
      var analysis = {
        length: password.length,
        uniqueChars: Object.keys(charMap).length,
        uppercaseCount: 0,
        lowercaseCount: 0,
        numberCount: 0,
        symbolCount: 0
      };
      Object.keys(charMap).forEach(function(char) {
        if (upperCaseRegex.test(char)) {
          analysis.uppercaseCount += charMap[char];
        } else if (lowerCaseRegex.test(char)) {
          analysis.lowercaseCount += charMap[char];
        } else if (numberRegex.test(char)) {
          analysis.numberCount += charMap[char];
        } else if (symbolRegex.test(char)) {
          analysis.symbolCount += charMap[char];
        }
      });
      return analysis;
    }
    function scorePassword(analysis, scoringOptions) {
      var points = 0;
      points += analysis.uniqueChars * scoringOptions.pointsPerUnique;
      points += (analysis.length - analysis.uniqueChars) * scoringOptions.pointsPerRepeat;
      if (analysis.lowercaseCount > 0) {
        points += scoringOptions.pointsForContainingLower;
      }
      if (analysis.uppercaseCount > 0) {
        points += scoringOptions.pointsForContainingUpper;
      }
      if (analysis.numberCount > 0) {
        points += scoringOptions.pointsForContainingNumber;
      }
      if (analysis.symbolCount > 0) {
        points += scoringOptions.pointsForContainingSymbol;
      }
      return points;
    }
    function isStrongPassword(str) {
      var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      (0, _assertString.default)(str);
      var analysis = analyzePassword(str);
      options = (0, _merge.default)(options || {}, defaultOptions);
      if (options.returnScore) {
        return scorePassword(analysis, options);
      }
      return analysis.length >= options.minLength && analysis.lowercaseCount >= options.minLowercase && analysis.uppercaseCount >= options.minUppercase && analysis.numberCount >= options.minNumbers && analysis.symbolCount >= options.minSymbols;
    }
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/validator/lib/isVAT.js
var require_isVAT = __commonJS({
  "node_modules/validator/lib/isVAT.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = isVAT;
    exports.vatMatchers = void 0;
    var _assertString = _interopRequireDefault(require_assertString());
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var vatMatchers = {
      GB: /^GB((\d{3} \d{4} ([0-8][0-9]|9[0-6]))|(\d{9} \d{3})|(((GD[0-4])|(HA[5-9]))[0-9]{2}))$/,
      IT: /^(IT)?[0-9]{11}$/,
      NL: /^(NL)?[0-9]{9}B[0-9]{2}$/
    };
    exports.vatMatchers = vatMatchers;
    function isVAT(str, countryCode) {
      (0, _assertString.default)(str);
      (0, _assertString.default)(countryCode);
      if (countryCode in vatMatchers) {
        return vatMatchers[countryCode].test(str);
      }
      throw new Error("Invalid country code: '".concat(countryCode, "'"));
    }
  }
});

// node_modules/validator/index.js
var require_validator = __commonJS({
  "node_modules/validator/index.js"(exports, module2) {
    "use strict";
    function _typeof(obj) {
      "@babel/helpers - typeof";
      if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof2(obj2) {
          return typeof obj2;
        };
      } else {
        _typeof = function _typeof2(obj2) {
          return obj2 && typeof Symbol === "function" && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
        };
      }
      return _typeof(obj);
    }
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.default = void 0;
    var _toDate = _interopRequireDefault(require_toDate());
    var _toFloat = _interopRequireDefault(require_toFloat());
    var _toInt = _interopRequireDefault(require_toInt());
    var _toBoolean = _interopRequireDefault(require_toBoolean());
    var _equals = _interopRequireDefault(require_equals());
    var _contains = _interopRequireDefault(require_contains());
    var _matches = _interopRequireDefault(require_matches());
    var _isEmail = _interopRequireDefault(require_isEmail());
    var _isURL = _interopRequireDefault(require_isURL());
    var _isMACAddress = _interopRequireDefault(require_isMACAddress());
    var _isIP = _interopRequireDefault(require_isIP());
    var _isIPRange = _interopRequireDefault(require_isIPRange());
    var _isFQDN = _interopRequireDefault(require_isFQDN());
    var _isDate = _interopRequireDefault(require_isDate());
    var _isBoolean = _interopRequireDefault(require_isBoolean());
    var _isLocale = _interopRequireDefault(require_isLocale());
    var _isAlpha = _interopRequireWildcard(require_isAlpha());
    var _isAlphanumeric = _interopRequireWildcard(require_isAlphanumeric());
    var _isNumeric = _interopRequireDefault(require_isNumeric());
    var _isPassportNumber = _interopRequireDefault(require_isPassportNumber());
    var _isPort = _interopRequireDefault(require_isPort());
    var _isLowercase = _interopRequireDefault(require_isLowercase());
    var _isUppercase = _interopRequireDefault(require_isUppercase());
    var _isIMEI = _interopRequireDefault(require_isIMEI());
    var _isAscii = _interopRequireDefault(require_isAscii());
    var _isFullWidth = _interopRequireDefault(require_isFullWidth());
    var _isHalfWidth = _interopRequireDefault(require_isHalfWidth());
    var _isVariableWidth = _interopRequireDefault(require_isVariableWidth());
    var _isMultibyte = _interopRequireDefault(require_isMultibyte());
    var _isSemVer = _interopRequireDefault(require_isSemVer());
    var _isSurrogatePair = _interopRequireDefault(require_isSurrogatePair());
    var _isInt = _interopRequireDefault(require_isInt());
    var _isFloat = _interopRequireWildcard(require_isFloat());
    var _isDecimal = _interopRequireDefault(require_isDecimal());
    var _isHexadecimal = _interopRequireDefault(require_isHexadecimal());
    var _isOctal = _interopRequireDefault(require_isOctal());
    var _isDivisibleBy = _interopRequireDefault(require_isDivisibleBy());
    var _isHexColor = _interopRequireDefault(require_isHexColor());
    var _isRgbColor = _interopRequireDefault(require_isRgbColor());
    var _isHSL = _interopRequireDefault(require_isHSL());
    var _isISRC = _interopRequireDefault(require_isISRC());
    var _isIBAN = _interopRequireWildcard(require_isIBAN());
    var _isBIC = _interopRequireDefault(require_isBIC());
    var _isMD = _interopRequireDefault(require_isMD5());
    var _isHash = _interopRequireDefault(require_isHash());
    var _isJWT = _interopRequireDefault(require_isJWT());
    var _isJSON = _interopRequireDefault(require_isJSON());
    var _isEmpty = _interopRequireDefault(require_isEmpty());
    var _isLength = _interopRequireDefault(require_isLength());
    var _isByteLength = _interopRequireDefault(require_isByteLength());
    var _isUUID = _interopRequireDefault(require_isUUID());
    var _isMongoId = _interopRequireDefault(require_isMongoId());
    var _isAfter = _interopRequireDefault(require_isAfter());
    var _isBefore = _interopRequireDefault(require_isBefore());
    var _isIn = _interopRequireDefault(require_isIn());
    var _isCreditCard = _interopRequireDefault(require_isCreditCard());
    var _isIdentityCard = _interopRequireDefault(require_isIdentityCard());
    var _isEAN = _interopRequireDefault(require_isEAN());
    var _isISIN = _interopRequireDefault(require_isISIN());
    var _isISBN = _interopRequireDefault(require_isISBN());
    var _isISSN = _interopRequireDefault(require_isISSN());
    var _isTaxID = _interopRequireDefault(require_isTaxID());
    var _isMobilePhone = _interopRequireWildcard(require_isMobilePhone());
    var _isEthereumAddress = _interopRequireDefault(require_isEthereumAddress());
    var _isCurrency = _interopRequireDefault(require_isCurrency());
    var _isBtcAddress = _interopRequireDefault(require_isBtcAddress());
    var _isISO = _interopRequireDefault(require_isISO8601());
    var _isRFC = _interopRequireDefault(require_isRFC3339());
    var _isISO31661Alpha = _interopRequireDefault(require_isISO31661Alpha2());
    var _isISO31661Alpha2 = _interopRequireDefault(require_isISO31661Alpha3());
    var _isISO2 = _interopRequireDefault(require_isISO4217());
    var _isBase = _interopRequireDefault(require_isBase32());
    var _isBase2 = _interopRequireDefault(require_isBase58());
    var _isBase3 = _interopRequireDefault(require_isBase64());
    var _isDataURI = _interopRequireDefault(require_isDataURI());
    var _isMagnetURI = _interopRequireDefault(require_isMagnetURI());
    var _isMimeType = _interopRequireDefault(require_isMimeType());
    var _isLatLong = _interopRequireDefault(require_isLatLong());
    var _isPostalCode = _interopRequireWildcard(require_isPostalCode());
    var _ltrim = _interopRequireDefault(require_ltrim());
    var _rtrim = _interopRequireDefault(require_rtrim());
    var _trim = _interopRequireDefault(require_trim());
    var _escape = _interopRequireDefault(require_escape());
    var _unescape = _interopRequireDefault(require_unescape());
    var _stripLow = _interopRequireDefault(require_stripLow());
    var _whitelist = _interopRequireDefault(require_whitelist());
    var _blacklist = _interopRequireDefault(require_blacklist());
    var _isWhitelisted = _interopRequireDefault(require_isWhitelisted());
    var _normalizeEmail = _interopRequireDefault(require_normalizeEmail());
    var _isSlug = _interopRequireDefault(require_isSlug());
    var _isLicensePlate = _interopRequireDefault(require_isLicensePlate());
    var _isStrongPassword = _interopRequireDefault(require_isStrongPassword());
    var _isVAT = _interopRequireDefault(require_isVAT());
    function _getRequireWildcardCache() {
      if (typeof WeakMap !== "function")
        return null;
      var cache = new WeakMap();
      _getRequireWildcardCache = function _getRequireWildcardCache2() {
        return cache;
      };
      return cache;
    }
    function _interopRequireWildcard(obj) {
      if (obj && obj.__esModule) {
        return obj;
      }
      if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
        return { default: obj };
      }
      var cache = _getRequireWildcardCache();
      if (cache && cache.has(obj)) {
        return cache.get(obj);
      }
      var newObj = {};
      var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
          if (desc && (desc.get || desc.set)) {
            Object.defineProperty(newObj, key, desc);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
      newObj.default = obj;
      if (cache) {
        cache.set(obj, newObj);
      }
      return newObj;
    }
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : { default: obj };
    }
    var version = "13.7.0";
    var validator = {
      version,
      toDate: _toDate.default,
      toFloat: _toFloat.default,
      toInt: _toInt.default,
      toBoolean: _toBoolean.default,
      equals: _equals.default,
      contains: _contains.default,
      matches: _matches.default,
      isEmail: _isEmail.default,
      isURL: _isURL.default,
      isMACAddress: _isMACAddress.default,
      isIP: _isIP.default,
      isIPRange: _isIPRange.default,
      isFQDN: _isFQDN.default,
      isBoolean: _isBoolean.default,
      isIBAN: _isIBAN.default,
      isBIC: _isBIC.default,
      isAlpha: _isAlpha.default,
      isAlphaLocales: _isAlpha.locales,
      isAlphanumeric: _isAlphanumeric.default,
      isAlphanumericLocales: _isAlphanumeric.locales,
      isNumeric: _isNumeric.default,
      isPassportNumber: _isPassportNumber.default,
      isPort: _isPort.default,
      isLowercase: _isLowercase.default,
      isUppercase: _isUppercase.default,
      isAscii: _isAscii.default,
      isFullWidth: _isFullWidth.default,
      isHalfWidth: _isHalfWidth.default,
      isVariableWidth: _isVariableWidth.default,
      isMultibyte: _isMultibyte.default,
      isSemVer: _isSemVer.default,
      isSurrogatePair: _isSurrogatePair.default,
      isInt: _isInt.default,
      isIMEI: _isIMEI.default,
      isFloat: _isFloat.default,
      isFloatLocales: _isFloat.locales,
      isDecimal: _isDecimal.default,
      isHexadecimal: _isHexadecimal.default,
      isOctal: _isOctal.default,
      isDivisibleBy: _isDivisibleBy.default,
      isHexColor: _isHexColor.default,
      isRgbColor: _isRgbColor.default,
      isHSL: _isHSL.default,
      isISRC: _isISRC.default,
      isMD5: _isMD.default,
      isHash: _isHash.default,
      isJWT: _isJWT.default,
      isJSON: _isJSON.default,
      isEmpty: _isEmpty.default,
      isLength: _isLength.default,
      isLocale: _isLocale.default,
      isByteLength: _isByteLength.default,
      isUUID: _isUUID.default,
      isMongoId: _isMongoId.default,
      isAfter: _isAfter.default,
      isBefore: _isBefore.default,
      isIn: _isIn.default,
      isCreditCard: _isCreditCard.default,
      isIdentityCard: _isIdentityCard.default,
      isEAN: _isEAN.default,
      isISIN: _isISIN.default,
      isISBN: _isISBN.default,
      isISSN: _isISSN.default,
      isMobilePhone: _isMobilePhone.default,
      isMobilePhoneLocales: _isMobilePhone.locales,
      isPostalCode: _isPostalCode.default,
      isPostalCodeLocales: _isPostalCode.locales,
      isEthereumAddress: _isEthereumAddress.default,
      isCurrency: _isCurrency.default,
      isBtcAddress: _isBtcAddress.default,
      isISO8601: _isISO.default,
      isRFC3339: _isRFC.default,
      isISO31661Alpha2: _isISO31661Alpha.default,
      isISO31661Alpha3: _isISO31661Alpha2.default,
      isISO4217: _isISO2.default,
      isBase32: _isBase.default,
      isBase58: _isBase2.default,
      isBase64: _isBase3.default,
      isDataURI: _isDataURI.default,
      isMagnetURI: _isMagnetURI.default,
      isMimeType: _isMimeType.default,
      isLatLong: _isLatLong.default,
      ltrim: _ltrim.default,
      rtrim: _rtrim.default,
      trim: _trim.default,
      escape: _escape.default,
      unescape: _unescape.default,
      stripLow: _stripLow.default,
      whitelist: _whitelist.default,
      blacklist: _blacklist.default,
      isWhitelisted: _isWhitelisted.default,
      normalizeEmail: _normalizeEmail.default,
      toString,
      isSlug: _isSlug.default,
      isStrongPassword: _isStrongPassword.default,
      isTaxID: _isTaxID.default,
      isDate: _isDate.default,
      isLicensePlate: _isLicensePlate.default,
      isVAT: _isVAT.default,
      ibanLocales: _isIBAN.locales
    };
    var _default = validator;
    exports.default = _default;
    module2.exports = exports.default;
    module2.exports.default = exports.default;
  }
});

// node_modules/z-schema/src/FormatValidators.js
var require_FormatValidators = __commonJS({
  "node_modules/z-schema/src/FormatValidators.js"(exports, module2) {
    var validator = require_validator();
    var FormatValidators = {
      "date": function(date) {
        if (typeof date !== "string") {
          return true;
        }
        var matches = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(date);
        if (matches === null) {
          return false;
        }
        if (matches[2] < "01" || matches[2] > "12" || matches[3] < "01" || matches[3] > "31") {
          return false;
        }
        return true;
      },
      "date-time": function(dateTime) {
        if (typeof dateTime !== "string") {
          return true;
        }
        var s = dateTime.toLowerCase().split("t");
        if (!FormatValidators.date(s[0])) {
          return false;
        }
        var matches = /^([0-9]{2}):([0-9]{2}):([0-9]{2})(.[0-9]+)?(z|([+-][0-9]{2}:[0-9]{2}))$/.exec(s[1]);
        if (matches === null) {
          return false;
        }
        if (matches[1] > "23" || matches[2] > "59" || matches[3] > "59") {
          return false;
        }
        return true;
      },
      "email": function(email) {
        if (typeof email !== "string") {
          return true;
        }
        return validator.isEmail(email, { "require_tld": true });
      },
      "hostname": function(hostname) {
        if (typeof hostname !== "string") {
          return true;
        }
        var valid = /^[a-zA-Z](([-0-9a-zA-Z]+)?[0-9a-zA-Z])?(\.[a-zA-Z](([-0-9a-zA-Z]+)?[0-9a-zA-Z])?)*$/.test(hostname);
        if (valid) {
          if (hostname.length > 255) {
            return false;
          }
          var labels = hostname.split(".");
          for (var i = 0; i < labels.length; i++) {
            if (labels[i].length > 63) {
              return false;
            }
          }
        }
        return valid;
      },
      "host-name": function(hostname) {
        return FormatValidators.hostname.call(this, hostname);
      },
      "ipv4": function(ipv4) {
        if (typeof ipv4 !== "string") {
          return true;
        }
        return validator.isIP(ipv4, 4);
      },
      "ipv6": function(ipv6) {
        if (typeof ipv6 !== "string") {
          return true;
        }
        return validator.isIP(ipv6, 6);
      },
      "regex": function(str) {
        try {
          RegExp(str);
          return true;
        } catch (e) {
          return false;
        }
      },
      "uri": function(uri) {
        if (this.options.strictUris) {
          return FormatValidators["strict-uri"].apply(this, arguments);
        }
        return typeof uri !== "string" || RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?").test(uri);
      },
      "strict-uri": function(uri) {
        return typeof uri !== "string" || validator.isURL(uri);
      }
    };
    module2.exports = FormatValidators;
  }
});

// node_modules/z-schema/src/JsonValidation.js
var require_JsonValidation = __commonJS({
  "node_modules/z-schema/src/JsonValidation.js"(exports) {
    "use strict";
    var FormatValidators = require_FormatValidators();
    var Report = require_Report();
    var Utils = require_Utils();
    var shouldSkipValidate = function(options, errors) {
      return options && Array.isArray(options.includeErrors) && options.includeErrors.length > 0 && !errors.some(function(err) {
        return options.includeErrors.includes(err);
      });
    };
    var JsonValidators = {
      multipleOf: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["MULTIPLE_OF"])) {
          return;
        }
        if (typeof json !== "number") {
          return;
        }
        var stringMultipleOf = String(schema.multipleOf);
        var scale = Math.pow(10, stringMultipleOf.length - stringMultipleOf.indexOf(".") - 1);
        if (Utils.whatIs(json * scale / (schema.multipleOf * scale)) !== "integer") {
          report.addError("MULTIPLE_OF", [json, schema.multipleOf], null, schema);
        }
      },
      maximum: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["MAXIMUM", "MAXIMUM_EXCLUSIVE"])) {
          return;
        }
        if (typeof json !== "number") {
          return;
        }
        if (schema.exclusiveMaximum !== true) {
          if (json > schema.maximum) {
            report.addError("MAXIMUM", [json, schema.maximum], null, schema);
          }
        } else {
          if (json >= schema.maximum) {
            report.addError("MAXIMUM_EXCLUSIVE", [json, schema.maximum], null, schema);
          }
        }
      },
      exclusiveMaximum: function() {
      },
      minimum: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["MINIMUM", "MINIMUM_EXCLUSIVE"])) {
          return;
        }
        if (typeof json !== "number") {
          return;
        }
        if (schema.exclusiveMinimum !== true) {
          if (json < schema.minimum) {
            report.addError("MINIMUM", [json, schema.minimum], null, schema);
          }
        } else {
          if (json <= schema.minimum) {
            report.addError("MINIMUM_EXCLUSIVE", [json, schema.minimum], null, schema);
          }
        }
      },
      exclusiveMinimum: function() {
      },
      maxLength: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["MAX_LENGTH"])) {
          return;
        }
        if (typeof json !== "string") {
          return;
        }
        if (Utils.ucs2decode(json).length > schema.maxLength) {
          report.addError("MAX_LENGTH", [json.length, schema.maxLength], null, schema);
        }
      },
      minLength: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["MIN_LENGTH"])) {
          return;
        }
        if (typeof json !== "string") {
          return;
        }
        if (Utils.ucs2decode(json).length < schema.minLength) {
          report.addError("MIN_LENGTH", [json.length, schema.minLength], null, schema);
        }
      },
      pattern: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["PATTERN"])) {
          return;
        }
        if (typeof json !== "string") {
          return;
        }
        if (RegExp(schema.pattern).test(json) === false) {
          report.addError("PATTERN", [schema.pattern, json], null, schema);
        }
      },
      additionalItems: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["ARRAY_ADDITIONAL_ITEMS"])) {
          return;
        }
        if (!Array.isArray(json)) {
          return;
        }
        if (schema.additionalItems === false && Array.isArray(schema.items)) {
          if (json.length > schema.items.length) {
            report.addError("ARRAY_ADDITIONAL_ITEMS", null, null, schema);
          }
        }
      },
      items: function() {
      },
      maxItems: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["ARRAY_LENGTH_LONG"])) {
          return;
        }
        if (!Array.isArray(json)) {
          return;
        }
        if (json.length > schema.maxItems) {
          report.addError("ARRAY_LENGTH_LONG", [json.length, schema.maxItems], null, schema);
        }
      },
      minItems: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["ARRAY_LENGTH_SHORT"])) {
          return;
        }
        if (!Array.isArray(json)) {
          return;
        }
        if (json.length < schema.minItems) {
          report.addError("ARRAY_LENGTH_SHORT", [json.length, schema.minItems], null, schema);
        }
      },
      uniqueItems: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["ARRAY_UNIQUE"])) {
          return;
        }
        if (!Array.isArray(json)) {
          return;
        }
        if (schema.uniqueItems === true) {
          var matches = [];
          if (Utils.isUniqueArray(json, matches) === false) {
            report.addError("ARRAY_UNIQUE", matches, null, schema);
          }
        }
      },
      maxProperties: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["OBJECT_PROPERTIES_MAXIMUM"])) {
          return;
        }
        if (Utils.whatIs(json) !== "object") {
          return;
        }
        var keysCount = Object.keys(json).length;
        if (keysCount > schema.maxProperties) {
          report.addError("OBJECT_PROPERTIES_MAXIMUM", [keysCount, schema.maxProperties], null, schema);
        }
      },
      minProperties: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["OBJECT_PROPERTIES_MINIMUM"])) {
          return;
        }
        if (Utils.whatIs(json) !== "object") {
          return;
        }
        var keysCount = Object.keys(json).length;
        if (keysCount < schema.minProperties) {
          report.addError("OBJECT_PROPERTIES_MINIMUM", [keysCount, schema.minProperties], null, schema);
        }
      },
      required: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["OBJECT_MISSING_REQUIRED_PROPERTY"])) {
          return;
        }
        if (Utils.whatIs(json) !== "object") {
          return;
        }
        var idx = schema.required.length;
        while (idx--) {
          var requiredPropertyName = schema.required[idx];
          if (json[requiredPropertyName] === void 0) {
            report.addError("OBJECT_MISSING_REQUIRED_PROPERTY", [requiredPropertyName], null, schema);
          }
        }
      },
      additionalProperties: function(report, schema, json) {
        if (schema.properties === void 0 && schema.patternProperties === void 0) {
          return JsonValidators.properties.call(this, report, schema, json);
        }
      },
      patternProperties: function(report, schema, json) {
        if (schema.properties === void 0) {
          return JsonValidators.properties.call(this, report, schema, json);
        }
      },
      properties: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["OBJECT_ADDITIONAL_PROPERTIES"])) {
          return;
        }
        if (Utils.whatIs(json) !== "object") {
          return;
        }
        var properties = schema.properties !== void 0 ? schema.properties : {};
        var patternProperties = schema.patternProperties !== void 0 ? schema.patternProperties : {};
        if (schema.additionalProperties === false) {
          var s = Object.keys(json);
          var p = Object.keys(properties);
          var pp = Object.keys(patternProperties);
          s = Utils.difference(s, p);
          var idx = pp.length;
          while (idx--) {
            var regExp = RegExp(pp[idx]), idx2 = s.length;
            while (idx2--) {
              if (regExp.test(s[idx2]) === true) {
                s.splice(idx2, 1);
              }
            }
          }
          if (s.length > 0) {
            var idx3 = this.options.assumeAdditional.length;
            if (idx3) {
              while (idx3--) {
                var io = s.indexOf(this.options.assumeAdditional[idx3]);
                if (io !== -1) {
                  s.splice(io, 1);
                }
              }
            }
            var idx4 = s.length;
            if (idx4) {
              while (idx4--) {
                report.addError("OBJECT_ADDITIONAL_PROPERTIES", [s[idx4]], null, schema);
              }
            }
          }
        }
      },
      dependencies: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["OBJECT_DEPENDENCY_KEY"])) {
          return;
        }
        if (Utils.whatIs(json) !== "object") {
          return;
        }
        var keys = Object.keys(schema.dependencies), idx = keys.length;
        while (idx--) {
          var dependencyName = keys[idx];
          if (json[dependencyName]) {
            var dependencyDefinition = schema.dependencies[dependencyName];
            if (Utils.whatIs(dependencyDefinition) === "object") {
              exports.validate.call(this, report, dependencyDefinition, json);
            } else {
              var idx2 = dependencyDefinition.length;
              while (idx2--) {
                var requiredPropertyName = dependencyDefinition[idx2];
                if (json[requiredPropertyName] === void 0) {
                  report.addError("OBJECT_DEPENDENCY_KEY", [requiredPropertyName, dependencyName], null, schema);
                }
              }
            }
          }
        }
      },
      enum: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["ENUM_CASE_MISMATCH", "ENUM_MISMATCH"])) {
          return;
        }
        var match = false, caseInsensitiveMatch = false, idx = schema.enum.length;
        while (idx--) {
          if (Utils.areEqual(json, schema.enum[idx])) {
            match = true;
            break;
          } else if (Utils.areEqual(json, schema.enum[idx]), { caseInsensitiveComparison: true }) {
            caseInsensitiveMatch = true;
          }
        }
        if (match === false) {
          var error = caseInsensitiveMatch && this.options.enumCaseInsensitiveComparison ? "ENUM_CASE_MISMATCH" : "ENUM_MISMATCH";
          report.addError(error, [json], null, schema);
        }
      },
      type: function(report, schema, json) {
        if (shouldSkipValidate(this.validateOptions, ["INVALID_TYPE"])) {
          return;
        }
        var jsonType = Utils.whatIs(json);
        if (typeof schema.type === "string") {
          if (jsonType !== schema.type && (jsonType !== "integer" || schema.type !== "number")) {
            report.addError("INVALID_TYPE", [schema.type, jsonType], null, schema);
          }
        } else {
          if (schema.type.indexOf(jsonType) === -1 && (jsonType !== "integer" || schema.type.indexOf("number") === -1)) {
            report.addError("INVALID_TYPE", [schema.type, jsonType], null, schema);
          }
        }
      },
      allOf: function(report, schema, json) {
        var idx = schema.allOf.length;
        while (idx--) {
          var validateResult = exports.validate.call(this, report, schema.allOf[idx], json);
          if (this.options.breakOnFirstError && validateResult === false) {
            break;
          }
        }
      },
      anyOf: function(report, schema, json) {
        var subReports = [], passed = false, idx = schema.anyOf.length;
        while (idx-- && passed === false) {
          var subReport = new Report(report);
          subReports.push(subReport);
          passed = exports.validate.call(this, subReport, schema.anyOf[idx], json);
        }
        if (passed === false) {
          report.addError("ANY_OF_MISSING", void 0, subReports, schema);
        }
      },
      oneOf: function(report, schema, json) {
        var passes = 0, subReports = [], idx = schema.oneOf.length;
        while (idx--) {
          var subReport = new Report(report, { maxErrors: 1 });
          subReports.push(subReport);
          if (exports.validate.call(this, subReport, schema.oneOf[idx], json) === true) {
            passes++;
          }
        }
        if (passes === 0) {
          report.addError("ONE_OF_MISSING", void 0, subReports, schema);
        } else if (passes > 1) {
          report.addError("ONE_OF_MULTIPLE", null, null, schema);
        }
      },
      not: function(report, schema, json) {
        var subReport = new Report(report);
        if (exports.validate.call(this, subReport, schema.not, json) === true) {
          report.addError("NOT_PASSED", null, null, schema);
        }
      },
      definitions: function() {
      },
      format: function(report, schema, json) {
        var formatValidatorFn = FormatValidators[schema.format];
        if (typeof formatValidatorFn === "function") {
          if (shouldSkipValidate(this.validateOptions, ["INVALID_FORMAT"])) {
            return;
          }
          if (formatValidatorFn.length === 2) {
            var pathBeforeAsync = Utils.clone(report.path);
            report.addAsyncTask(formatValidatorFn, [json], function(result) {
              if (result !== true) {
                var backup = report.path;
                report.path = pathBeforeAsync;
                report.addError("INVALID_FORMAT", [schema.format, json], null, schema);
                report.path = backup;
              }
            });
          } else {
            if (formatValidatorFn.call(this, json) !== true) {
              report.addError("INVALID_FORMAT", [schema.format, json], null, schema);
            }
          }
        } else if (this.options.ignoreUnknownFormats !== true) {
          report.addError("UNKNOWN_FORMAT", [schema.format], null, schema);
        }
      }
    };
    var recurseArray = function(report, schema, json) {
      var idx = json.length;
      if (Array.isArray(schema.items)) {
        while (idx--) {
          if (idx < schema.items.length) {
            report.path.push(idx);
            exports.validate.call(this, report, schema.items[idx], json[idx]);
            report.path.pop();
          } else {
            if (typeof schema.additionalItems === "object") {
              report.path.push(idx);
              exports.validate.call(this, report, schema.additionalItems, json[idx]);
              report.path.pop();
            }
          }
        }
      } else if (typeof schema.items === "object") {
        while (idx--) {
          report.path.push(idx);
          exports.validate.call(this, report, schema.items, json[idx]);
          report.path.pop();
        }
      }
    };
    var recurseObject = function(report, schema, json) {
      var additionalProperties = schema.additionalProperties;
      if (additionalProperties === true || additionalProperties === void 0) {
        additionalProperties = {};
      }
      var p = schema.properties ? Object.keys(schema.properties) : [];
      var pp = schema.patternProperties ? Object.keys(schema.patternProperties) : [];
      var keys = Object.keys(json), idx = keys.length;
      while (idx--) {
        var m = keys[idx], propertyValue = json[m];
        var s = [];
        if (p.indexOf(m) !== -1) {
          s.push(schema.properties[m]);
        }
        var idx2 = pp.length;
        while (idx2--) {
          var regexString = pp[idx2];
          if (RegExp(regexString).test(m) === true) {
            s.push(schema.patternProperties[regexString]);
          }
        }
        if (s.length === 0 && additionalProperties !== false) {
          s.push(additionalProperties);
        }
        idx2 = s.length;
        while (idx2--) {
          report.path.push(m);
          exports.validate.call(this, report, s[idx2], propertyValue);
          report.path.pop();
        }
      }
    };
    exports.JsonValidators = JsonValidators;
    exports.validate = function(report, schema, json) {
      report.commonErrorMessage = "JSON_OBJECT_VALIDATION_FAILED";
      var to = Utils.whatIs(schema);
      if (to !== "object") {
        report.addError("SCHEMA_NOT_AN_OBJECT", [to], null, schema);
        return false;
      }
      var keys = Object.keys(schema);
      if (keys.length === 0) {
        return true;
      }
      var isRoot = false;
      if (!report.rootSchema) {
        report.rootSchema = schema;
        isRoot = true;
      }
      if (schema.$ref !== void 0) {
        var maxRefs = 99;
        while (schema.$ref && maxRefs > 0) {
          if (!schema.__$refResolved) {
            report.addError("REF_UNRESOLVED", [schema.$ref], null, schema);
            break;
          } else if (schema.__$refResolved === schema) {
            break;
          } else {
            schema = schema.__$refResolved;
            keys = Object.keys(schema);
          }
          maxRefs--;
        }
        if (maxRefs === 0) {
          throw new Error("Circular dependency by $ref references!");
        }
      }
      var jsonType = Utils.whatIs(json);
      if (schema.type) {
        keys.splice(keys.indexOf("type"), 1);
        JsonValidators.type.call(this, report, schema, json);
        if (report.errors.length && this.options.breakOnFirstError) {
          return false;
        }
      }
      var idx = keys.length;
      while (idx--) {
        if (JsonValidators[keys[idx]]) {
          JsonValidators[keys[idx]].call(this, report, schema, json);
          if (report.errors.length && this.options.breakOnFirstError) {
            break;
          }
        }
      }
      if (report.errors.length === 0 || this.options.breakOnFirstError === false) {
        if (jsonType === "array") {
          recurseArray.call(this, report, schema, json);
        } else if (jsonType === "object") {
          recurseObject.call(this, report, schema, json);
        }
      }
      if (typeof this.options.customValidator === "function") {
        this.options.customValidator.call(this, report, schema, json);
      }
      if (isRoot) {
        report.rootSchema = void 0;
      }
      return report.errors.length === 0;
    };
  }
});

// node_modules/lodash.isequal/index.js
var require_lodash2 = __commonJS({
  "node_modules/lodash.isequal/index.js"(exports, module2) {
    var LARGE_ARRAY_SIZE = 200;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var COMPARE_PARTIAL_FLAG = 1;
    var COMPARE_UNORDERED_FLAG = 2;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var asyncTag = "[object AsyncFunction]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var nullTag = "[object Null]";
    var objectTag = "[object Object]";
    var promiseTag = "[object Promise]";
    var proxyTag = "[object Proxy]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var undefinedTag = "[object Undefined]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module2 == "object" && module2 && !module2.nodeType && module2;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    function arraySome(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    function setToArray(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    var arrayProto = Array.prototype;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var nativeObjectToString = objectProto.toString;
    var reIsNative = RegExp("^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
    var Buffer2 = moduleExports ? root.Buffer : void 0;
    var Symbol2 = root.Symbol;
    var Uint8Array2 = root.Uint8Array;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var splice = arrayProto.splice;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
    var nativeKeys = overArg(Object.keys, Object);
    var DataView = getNative(root, "DataView");
    var Map2 = getNative(root, "Map");
    var Promise2 = getNative(root, "Promise");
    var Set2 = getNative(root, "Set");
    var WeakMap2 = getNative(root, "WeakMap");
    var nativeCreate = getNative(Object, "create");
    var dataViewCtorString = toSource(DataView);
    var mapCtorString = toSource(Map2);
    var promiseCtorString = toSource(Promise2);
    var setCtorString = toSource(Set2);
    var weakMapCtorString = toSource(WeakMap2);
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function SetCache(values) {
      var index = -1, length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
      stack.set(array, other);
      stack.set(other, array);
      while (++index < arrLength) {
        var arrValue = array[index], othValue = other[index];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== void 0) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome(other, function(othValue2, othIndex) {
            if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }
      stack["delete"](array);
      stack["delete"](other);
      return result;
    }
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;
        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
            return false;
          }
          return true;
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object, +other);
        case errorTag:
          return object.name == other.name && object.message == other.message;
        case regexpTag:
        case stringTag:
          return object == other + "";
        case mapTag:
          var convert = mapToArray;
        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);
          if (object.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack["delete"](object);
          return result;
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      }
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key], othValue = other[key];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == "constructor");
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack["delete"](object);
      stack["delete"](other);
      return result;
    }
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    var getTag = baseGetTag;
    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap2 && getTag(new WeakMap2()) != weakMapTag) {
      getTag = function(value) {
        var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;
            case mapCtorString:
              return mapTag;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (typeof value == "number" || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var isArguments = baseIsArguments(function() {
      return arguments;
    }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    var isArray = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    var isBuffer = nativeIsBuffer || stubFalse;
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    function stubArray() {
      return [];
    }
    function stubFalse() {
      return false;
    }
    module2.exports = isEqual;
  }
});

// node_modules/z-schema/src/SchemaCompilation.js
var require_SchemaCompilation = __commonJS({
  "node_modules/z-schema/src/SchemaCompilation.js"(exports) {
    "use strict";
    var Report = require_Report();
    var SchemaCache = require_SchemaCache();
    var Utils = require_Utils();
    function mergeReference(scope, ref) {
      if (Utils.isAbsoluteUri(ref)) {
        return ref;
      }
      var joinedScope = scope.join(""), isScopeAbsolute = Utils.isAbsoluteUri(joinedScope), isScopeRelative = Utils.isRelativeUri(joinedScope), isRefRelative = Utils.isRelativeUri(ref), toRemove;
      if (isScopeAbsolute && isRefRelative) {
        toRemove = joinedScope.match(/\/[^\/]*$/);
        if (toRemove) {
          joinedScope = joinedScope.slice(0, toRemove.index + 1);
        }
      } else if (isScopeRelative && isRefRelative) {
        joinedScope = "";
      } else {
        toRemove = joinedScope.match(/[^#/]+$/);
        if (toRemove) {
          joinedScope = joinedScope.slice(0, toRemove.index);
        }
      }
      var res = joinedScope + ref;
      res = res.replace(/##/, "#");
      return res;
    }
    function collectReferences(obj, results, scope, path2) {
      results = results || [];
      scope = scope || [];
      path2 = path2 || [];
      if (typeof obj !== "object" || obj === null) {
        return results;
      }
      if (typeof obj.id === "string") {
        scope.push(obj.id);
      }
      if (typeof obj.$ref === "string" && typeof obj.__$refResolved === "undefined") {
        results.push({
          ref: mergeReference(scope, obj.$ref),
          key: "$ref",
          obj,
          path: path2.slice(0)
        });
      }
      if (typeof obj.$schema === "string" && typeof obj.__$schemaResolved === "undefined") {
        results.push({
          ref: mergeReference(scope, obj.$schema),
          key: "$schema",
          obj,
          path: path2.slice(0)
        });
      }
      var idx;
      if (Array.isArray(obj)) {
        idx = obj.length;
        while (idx--) {
          path2.push(idx.toString());
          collectReferences(obj[idx], results, scope, path2);
          path2.pop();
        }
      } else {
        var keys = Object.keys(obj);
        idx = keys.length;
        while (idx--) {
          if (keys[idx].indexOf("__$") === 0) {
            continue;
          }
          path2.push(keys[idx]);
          collectReferences(obj[keys[idx]], results, scope, path2);
          path2.pop();
        }
      }
      if (typeof obj.id === "string") {
        scope.pop();
      }
      return results;
    }
    var compileArrayOfSchemasLoop = function(mainReport, arr) {
      var idx = arr.length, compiledCount = 0;
      while (idx--) {
        var report = new Report(mainReport);
        var isValid = exports.compileSchema.call(this, report, arr[idx]);
        if (isValid) {
          compiledCount++;
        }
        mainReport.errors = mainReport.errors.concat(report.errors);
      }
      return compiledCount;
    };
    function findId(arr, id) {
      var idx = arr.length;
      while (idx--) {
        if (arr[idx].id === id) {
          return arr[idx];
        }
      }
      return null;
    }
    var compileArrayOfSchemas = function(report, arr) {
      var compiled = 0, lastLoopCompiled;
      do {
        var idx = report.errors.length;
        while (idx--) {
          if (report.errors[idx].code === "UNRESOLVABLE_REFERENCE") {
            report.errors.splice(idx, 1);
          }
        }
        lastLoopCompiled = compiled;
        compiled = compileArrayOfSchemasLoop.call(this, report, arr);
        idx = arr.length;
        while (idx--) {
          var sch = arr[idx];
          if (sch.__$missingReferences) {
            var idx2 = sch.__$missingReferences.length;
            while (idx2--) {
              var refObj = sch.__$missingReferences[idx2];
              var response = findId(arr, refObj.ref);
              if (response) {
                refObj.obj["__" + refObj.key + "Resolved"] = response;
                sch.__$missingReferences.splice(idx2, 1);
              }
            }
            if (sch.__$missingReferences.length === 0) {
              delete sch.__$missingReferences;
            }
          }
        }
      } while (compiled !== arr.length && compiled !== lastLoopCompiled);
      return report.isValid();
    };
    exports.compileSchema = function(report, schema) {
      report.commonErrorMessage = "SCHEMA_COMPILATION_FAILED";
      if (typeof schema === "string") {
        var loadedSchema = SchemaCache.getSchemaByUri.call(this, report, schema);
        if (!loadedSchema) {
          report.addError("SCHEMA_NOT_REACHABLE", [schema]);
          return false;
        }
        schema = loadedSchema;
      }
      if (Array.isArray(schema)) {
        return compileArrayOfSchemas.call(this, report, schema);
      }
      if (schema.__$compiled && schema.id && SchemaCache.checkCacheForUri.call(this, schema.id) === false) {
        schema.__$compiled = void 0;
      }
      if (schema.__$compiled) {
        return true;
      }
      if (schema.id && typeof schema.id === "string") {
        SchemaCache.cacheSchemaByUri.call(this, schema.id, schema);
      }
      var isRoot = false;
      if (!report.rootSchema) {
        report.rootSchema = schema;
        isRoot = true;
      }
      var isValidExceptReferences = report.isValid();
      delete schema.__$missingReferences;
      var refs = collectReferences.call(this, schema), idx = refs.length;
      while (idx--) {
        var refObj = refs[idx];
        var response = SchemaCache.getSchemaByUri.call(this, report, refObj.ref, schema);
        if (!response) {
          var schemaReader = this.getSchemaReader();
          if (schemaReader) {
            var s = schemaReader(refObj.ref);
            if (s) {
              s.id = refObj.ref;
              var subreport = new Report(report);
              if (!exports.compileSchema.call(this, subreport, s)) {
                report.errors = report.errors.concat(subreport.errors);
              } else {
                response = SchemaCache.getSchemaByUri.call(this, report, refObj.ref, schema);
              }
            }
          }
        }
        if (!response) {
          var hasNotValid = report.hasError("REMOTE_NOT_VALID", [refObj.ref]);
          var isAbsolute = Utils.isAbsoluteUri(refObj.ref);
          var isDownloaded = false;
          var ignoreUnresolvableRemotes = this.options.ignoreUnresolvableReferences === true;
          if (isAbsolute) {
            isDownloaded = SchemaCache.checkCacheForUri.call(this, refObj.ref);
          }
          if (hasNotValid) {
          } else if (ignoreUnresolvableRemotes && isAbsolute) {
          } else if (isDownloaded) {
          } else {
            Array.prototype.push.apply(report.path, refObj.path);
            report.addError("UNRESOLVABLE_REFERENCE", [refObj.ref]);
            report.path = report.path.slice(0, -refObj.path.length);
            if (isValidExceptReferences) {
              schema.__$missingReferences = schema.__$missingReferences || [];
              schema.__$missingReferences.push(refObj);
            }
          }
        }
        refObj.obj["__" + refObj.key + "Resolved"] = response;
      }
      var isValid = report.isValid();
      if (isValid) {
        schema.__$compiled = true;
      } else {
        if (schema.id && typeof schema.id === "string") {
          SchemaCache.removeFromCacheByUri.call(this, schema.id);
        }
      }
      if (isRoot) {
        report.rootSchema = void 0;
      }
      return isValid;
    };
  }
});

// node_modules/z-schema/src/SchemaValidation.js
var require_SchemaValidation = __commonJS({
  "node_modules/z-schema/src/SchemaValidation.js"(exports) {
    "use strict";
    var FormatValidators = require_FormatValidators();
    var JsonValidation = require_JsonValidation();
    var Report = require_Report();
    var Utils = require_Utils();
    var SchemaValidators = {
      $ref: function(report, schema) {
        if (typeof schema.$ref !== "string") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["$ref", "string"]);
        }
      },
      $schema: function(report, schema) {
        if (typeof schema.$schema !== "string") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["$schema", "string"]);
        }
      },
      multipleOf: function(report, schema) {
        if (typeof schema.multipleOf !== "number") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["multipleOf", "number"]);
        } else if (schema.multipleOf <= 0) {
          report.addError("KEYWORD_MUST_BE", ["multipleOf", "strictly greater than 0"]);
        }
      },
      maximum: function(report, schema) {
        if (typeof schema.maximum !== "number") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["maximum", "number"]);
        }
      },
      exclusiveMaximum: function(report, schema) {
        if (typeof schema.exclusiveMaximum !== "boolean") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["exclusiveMaximum", "boolean"]);
        } else if (schema.maximum === void 0) {
          report.addError("KEYWORD_DEPENDENCY", ["exclusiveMaximum", "maximum"]);
        }
      },
      minimum: function(report, schema) {
        if (typeof schema.minimum !== "number") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["minimum", "number"]);
        }
      },
      exclusiveMinimum: function(report, schema) {
        if (typeof schema.exclusiveMinimum !== "boolean") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["exclusiveMinimum", "boolean"]);
        } else if (schema.minimum === void 0) {
          report.addError("KEYWORD_DEPENDENCY", ["exclusiveMinimum", "minimum"]);
        }
      },
      maxLength: function(report, schema) {
        if (Utils.whatIs(schema.maxLength) !== "integer") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["maxLength", "integer"]);
        } else if (schema.maxLength < 0) {
          report.addError("KEYWORD_MUST_BE", ["maxLength", "greater than, or equal to 0"]);
        }
      },
      minLength: function(report, schema) {
        if (Utils.whatIs(schema.minLength) !== "integer") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["minLength", "integer"]);
        } else if (schema.minLength < 0) {
          report.addError("KEYWORD_MUST_BE", ["minLength", "greater than, or equal to 0"]);
        }
      },
      pattern: function(report, schema) {
        if (typeof schema.pattern !== "string") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["pattern", "string"]);
        } else {
          try {
            RegExp(schema.pattern);
          } catch (e) {
            report.addError("KEYWORD_PATTERN", ["pattern", schema.pattern]);
          }
        }
      },
      additionalItems: function(report, schema) {
        var type = Utils.whatIs(schema.additionalItems);
        if (type !== "boolean" && type !== "object") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["additionalItems", ["boolean", "object"]]);
        } else if (type === "object") {
          report.path.push("additionalItems");
          exports.validateSchema.call(this, report, schema.additionalItems);
          report.path.pop();
        }
      },
      items: function(report, schema) {
        var type = Utils.whatIs(schema.items);
        if (type === "object") {
          report.path.push("items");
          exports.validateSchema.call(this, report, schema.items);
          report.path.pop();
        } else if (type === "array") {
          var idx = schema.items.length;
          while (idx--) {
            report.path.push("items");
            report.path.push(idx.toString());
            exports.validateSchema.call(this, report, schema.items[idx]);
            report.path.pop();
            report.path.pop();
          }
        } else {
          report.addError("KEYWORD_TYPE_EXPECTED", ["items", ["array", "object"]]);
        }
        if (this.options.forceAdditional === true && schema.additionalItems === void 0 && Array.isArray(schema.items)) {
          report.addError("KEYWORD_UNDEFINED_STRICT", ["additionalItems"]);
        }
        if (this.options.assumeAdditional && schema.additionalItems === void 0 && Array.isArray(schema.items)) {
          schema.additionalItems = false;
        }
      },
      maxItems: function(report, schema) {
        if (typeof schema.maxItems !== "number") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["maxItems", "integer"]);
        } else if (schema.maxItems < 0) {
          report.addError("KEYWORD_MUST_BE", ["maxItems", "greater than, or equal to 0"]);
        }
      },
      minItems: function(report, schema) {
        if (Utils.whatIs(schema.minItems) !== "integer") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["minItems", "integer"]);
        } else if (schema.minItems < 0) {
          report.addError("KEYWORD_MUST_BE", ["minItems", "greater than, or equal to 0"]);
        }
      },
      uniqueItems: function(report, schema) {
        if (typeof schema.uniqueItems !== "boolean") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["uniqueItems", "boolean"]);
        }
      },
      maxProperties: function(report, schema) {
        if (Utils.whatIs(schema.maxProperties) !== "integer") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["maxProperties", "integer"]);
        } else if (schema.maxProperties < 0) {
          report.addError("KEYWORD_MUST_BE", ["maxProperties", "greater than, or equal to 0"]);
        }
      },
      minProperties: function(report, schema) {
        if (Utils.whatIs(schema.minProperties) !== "integer") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["minProperties", "integer"]);
        } else if (schema.minProperties < 0) {
          report.addError("KEYWORD_MUST_BE", ["minProperties", "greater than, or equal to 0"]);
        }
      },
      required: function(report, schema) {
        if (Utils.whatIs(schema.required) !== "array") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["required", "array"]);
        } else if (schema.required.length === 0) {
          report.addError("KEYWORD_MUST_BE", ["required", "an array with at least one element"]);
        } else {
          var idx = schema.required.length;
          while (idx--) {
            if (typeof schema.required[idx] !== "string") {
              report.addError("KEYWORD_VALUE_TYPE", ["required", "string"]);
            }
          }
          if (Utils.isUniqueArray(schema.required) === false) {
            report.addError("KEYWORD_MUST_BE", ["required", "an array with unique items"]);
          }
        }
      },
      additionalProperties: function(report, schema) {
        var type = Utils.whatIs(schema.additionalProperties);
        if (type !== "boolean" && type !== "object") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["additionalProperties", ["boolean", "object"]]);
        } else if (type === "object") {
          report.path.push("additionalProperties");
          exports.validateSchema.call(this, report, schema.additionalProperties);
          report.path.pop();
        }
      },
      properties: function(report, schema) {
        if (Utils.whatIs(schema.properties) !== "object") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["properties", "object"]);
          return;
        }
        var keys = Object.keys(schema.properties), idx = keys.length;
        while (idx--) {
          var key = keys[idx], val = schema.properties[key];
          report.path.push("properties");
          report.path.push(key);
          exports.validateSchema.call(this, report, val);
          report.path.pop();
          report.path.pop();
        }
        if (this.options.forceAdditional === true && schema.additionalProperties === void 0) {
          report.addError("KEYWORD_UNDEFINED_STRICT", ["additionalProperties"]);
        }
        if (this.options.assumeAdditional && schema.additionalProperties === void 0) {
          schema.additionalProperties = false;
        }
        if (this.options.forceProperties === true && keys.length === 0) {
          report.addError("CUSTOM_MODE_FORCE_PROPERTIES", ["properties"]);
        }
      },
      patternProperties: function(report, schema) {
        if (Utils.whatIs(schema.patternProperties) !== "object") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["patternProperties", "object"]);
          return;
        }
        var keys = Object.keys(schema.patternProperties), idx = keys.length;
        while (idx--) {
          var key = keys[idx], val = schema.patternProperties[key];
          try {
            RegExp(key);
          } catch (e) {
            report.addError("KEYWORD_PATTERN", ["patternProperties", key]);
          }
          report.path.push("patternProperties");
          report.path.push(key.toString());
          exports.validateSchema.call(this, report, val);
          report.path.pop();
          report.path.pop();
        }
        if (this.options.forceProperties === true && keys.length === 0) {
          report.addError("CUSTOM_MODE_FORCE_PROPERTIES", ["patternProperties"]);
        }
      },
      dependencies: function(report, schema) {
        if (Utils.whatIs(schema.dependencies) !== "object") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["dependencies", "object"]);
        } else {
          var keys = Object.keys(schema.dependencies), idx = keys.length;
          while (idx--) {
            var schemaKey = keys[idx], schemaDependency = schema.dependencies[schemaKey], type = Utils.whatIs(schemaDependency);
            if (type === "object") {
              report.path.push("dependencies");
              report.path.push(schemaKey);
              exports.validateSchema.call(this, report, schemaDependency);
              report.path.pop();
              report.path.pop();
            } else if (type === "array") {
              var idx2 = schemaDependency.length;
              if (idx2 === 0) {
                report.addError("KEYWORD_MUST_BE", ["dependencies", "not empty array"]);
              }
              while (idx2--) {
                if (typeof schemaDependency[idx2] !== "string") {
                  report.addError("KEYWORD_VALUE_TYPE", ["dependensices", "string"]);
                }
              }
              if (Utils.isUniqueArray(schemaDependency) === false) {
                report.addError("KEYWORD_MUST_BE", ["dependencies", "an array with unique items"]);
              }
            } else {
              report.addError("KEYWORD_VALUE_TYPE", ["dependencies", "object or array"]);
            }
          }
        }
      },
      enum: function(report, schema) {
        if (Array.isArray(schema.enum) === false) {
          report.addError("KEYWORD_TYPE_EXPECTED", ["enum", "array"]);
        } else if (schema.enum.length === 0) {
          report.addError("KEYWORD_MUST_BE", ["enum", "an array with at least one element"]);
        } else if (Utils.isUniqueArray(schema.enum) === false) {
          report.addError("KEYWORD_MUST_BE", ["enum", "an array with unique elements"]);
        }
      },
      type: function(report, schema) {
        var primitiveTypes = ["array", "boolean", "integer", "number", "null", "object", "string"], primitiveTypeStr = primitiveTypes.join(","), isArray = Array.isArray(schema.type);
        if (isArray) {
          var idx = schema.type.length;
          while (idx--) {
            if (primitiveTypes.indexOf(schema.type[idx]) === -1) {
              report.addError("KEYWORD_TYPE_EXPECTED", ["type", primitiveTypeStr]);
            }
          }
          if (Utils.isUniqueArray(schema.type) === false) {
            report.addError("KEYWORD_MUST_BE", ["type", "an object with unique properties"]);
          }
        } else if (typeof schema.type === "string") {
          if (primitiveTypes.indexOf(schema.type) === -1) {
            report.addError("KEYWORD_TYPE_EXPECTED", ["type", primitiveTypeStr]);
          }
        } else {
          report.addError("KEYWORD_TYPE_EXPECTED", ["type", ["string", "array"]]);
        }
        if (this.options.noEmptyStrings === true) {
          if (schema.type === "string" || isArray && schema.type.indexOf("string") !== -1) {
            if (schema.minLength === void 0 && schema.enum === void 0 && schema.format === void 0) {
              schema.minLength = 1;
            }
          }
        }
        if (this.options.noEmptyArrays === true) {
          if (schema.type === "array" || isArray && schema.type.indexOf("array") !== -1) {
            if (schema.minItems === void 0) {
              schema.minItems = 1;
            }
          }
        }
        if (this.options.forceProperties === true) {
          if (schema.type === "object" || isArray && schema.type.indexOf("object") !== -1) {
            if (schema.properties === void 0 && schema.patternProperties === void 0) {
              report.addError("KEYWORD_UNDEFINED_STRICT", ["properties"]);
            }
          }
        }
        if (this.options.forceItems === true) {
          if (schema.type === "array" || isArray && schema.type.indexOf("array") !== -1) {
            if (schema.items === void 0) {
              report.addError("KEYWORD_UNDEFINED_STRICT", ["items"]);
            }
          }
        }
        if (this.options.forceMinItems === true) {
          if (schema.type === "array" || isArray && schema.type.indexOf("array") !== -1) {
            if (schema.minItems === void 0) {
              report.addError("KEYWORD_UNDEFINED_STRICT", ["minItems"]);
            }
          }
        }
        if (this.options.forceMaxItems === true) {
          if (schema.type === "array" || isArray && schema.type.indexOf("array") !== -1) {
            if (schema.maxItems === void 0) {
              report.addError("KEYWORD_UNDEFINED_STRICT", ["maxItems"]);
            }
          }
        }
        if (this.options.forceMinLength === true) {
          if (schema.type === "string" || isArray && schema.type.indexOf("string") !== -1) {
            if (schema.minLength === void 0 && schema.format === void 0 && schema.enum === void 0 && schema.pattern === void 0) {
              report.addError("KEYWORD_UNDEFINED_STRICT", ["minLength"]);
            }
          }
        }
        if (this.options.forceMaxLength === true) {
          if (schema.type === "string" || isArray && schema.type.indexOf("string") !== -1) {
            if (schema.maxLength === void 0 && schema.format === void 0 && schema.enum === void 0 && schema.pattern === void 0) {
              report.addError("KEYWORD_UNDEFINED_STRICT", ["maxLength"]);
            }
          }
        }
      },
      allOf: function(report, schema) {
        if (Array.isArray(schema.allOf) === false) {
          report.addError("KEYWORD_TYPE_EXPECTED", ["allOf", "array"]);
        } else if (schema.allOf.length === 0) {
          report.addError("KEYWORD_MUST_BE", ["allOf", "an array with at least one element"]);
        } else {
          var idx = schema.allOf.length;
          while (idx--) {
            report.path.push("allOf");
            report.path.push(idx.toString());
            exports.validateSchema.call(this, report, schema.allOf[idx]);
            report.path.pop();
            report.path.pop();
          }
        }
      },
      anyOf: function(report, schema) {
        if (Array.isArray(schema.anyOf) === false) {
          report.addError("KEYWORD_TYPE_EXPECTED", ["anyOf", "array"]);
        } else if (schema.anyOf.length === 0) {
          report.addError("KEYWORD_MUST_BE", ["anyOf", "an array with at least one element"]);
        } else {
          var idx = schema.anyOf.length;
          while (idx--) {
            report.path.push("anyOf");
            report.path.push(idx.toString());
            exports.validateSchema.call(this, report, schema.anyOf[idx]);
            report.path.pop();
            report.path.pop();
          }
        }
      },
      oneOf: function(report, schema) {
        if (Array.isArray(schema.oneOf) === false) {
          report.addError("KEYWORD_TYPE_EXPECTED", ["oneOf", "array"]);
        } else if (schema.oneOf.length === 0) {
          report.addError("KEYWORD_MUST_BE", ["oneOf", "an array with at least one element"]);
        } else {
          var idx = schema.oneOf.length;
          while (idx--) {
            report.path.push("oneOf");
            report.path.push(idx.toString());
            exports.validateSchema.call(this, report, schema.oneOf[idx]);
            report.path.pop();
            report.path.pop();
          }
        }
      },
      not: function(report, schema) {
        if (Utils.whatIs(schema.not) !== "object") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["not", "object"]);
        } else {
          report.path.push("not");
          exports.validateSchema.call(this, report, schema.not);
          report.path.pop();
        }
      },
      definitions: function(report, schema) {
        if (Utils.whatIs(schema.definitions) !== "object") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["definitions", "object"]);
        } else {
          var keys = Object.keys(schema.definitions), idx = keys.length;
          while (idx--) {
            var key = keys[idx], val = schema.definitions[key];
            report.path.push("definitions");
            report.path.push(key);
            exports.validateSchema.call(this, report, val);
            report.path.pop();
            report.path.pop();
          }
        }
      },
      format: function(report, schema) {
        if (typeof schema.format !== "string") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["format", "string"]);
        } else {
          if (FormatValidators[schema.format] === void 0 && this.options.ignoreUnknownFormats !== true) {
            report.addError("UNKNOWN_FORMAT", [schema.format]);
          }
        }
      },
      id: function(report, schema) {
        if (typeof schema.id !== "string") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["id", "string"]);
        }
      },
      title: function(report, schema) {
        if (typeof schema.title !== "string") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["title", "string"]);
        }
      },
      description: function(report, schema) {
        if (typeof schema.description !== "string") {
          report.addError("KEYWORD_TYPE_EXPECTED", ["description", "string"]);
        }
      },
      "default": function() {
      }
    };
    var validateArrayOfSchemas = function(report, arr) {
      var idx = arr.length;
      while (idx--) {
        exports.validateSchema.call(this, report, arr[idx]);
      }
      return report.isValid();
    };
    exports.validateSchema = function(report, schema) {
      report.commonErrorMessage = "SCHEMA_VALIDATION_FAILED";
      if (Array.isArray(schema)) {
        return validateArrayOfSchemas.call(this, report, schema);
      }
      if (schema.__$validated) {
        return true;
      }
      var hasParentSchema = schema.$schema && schema.id !== schema.$schema;
      if (hasParentSchema) {
        if (schema.__$schemaResolved && schema.__$schemaResolved !== schema) {
          var subReport = new Report(report);
          var valid = JsonValidation.validate.call(this, subReport, schema.__$schemaResolved, schema);
          if (valid === false) {
            report.addError("PARENT_SCHEMA_VALIDATION_FAILED", null, subReport);
          }
        } else {
          if (this.options.ignoreUnresolvableReferences !== true) {
            report.addError("REF_UNRESOLVED", [schema.$schema]);
          }
        }
      }
      if (this.options.noTypeless === true) {
        if (schema.type !== void 0) {
          var schemas = [];
          if (Array.isArray(schema.anyOf)) {
            schemas = schemas.concat(schema.anyOf);
          }
          if (Array.isArray(schema.oneOf)) {
            schemas = schemas.concat(schema.oneOf);
          }
          if (Array.isArray(schema.allOf)) {
            schemas = schemas.concat(schema.allOf);
          }
          schemas.forEach(function(sch) {
            if (!sch.type) {
              sch.type = schema.type;
            }
          });
        }
        if (schema.enum === void 0 && schema.type === void 0 && schema.anyOf === void 0 && schema.oneOf === void 0 && schema.not === void 0 && schema.$ref === void 0) {
          report.addError("KEYWORD_UNDEFINED_STRICT", ["type"]);
        }
      }
      var keys = Object.keys(schema), idx = keys.length;
      while (idx--) {
        var key = keys[idx];
        if (key.indexOf("__") === 0) {
          continue;
        }
        if (SchemaValidators[key] !== void 0) {
          SchemaValidators[key].call(this, report, schema);
        } else if (!hasParentSchema) {
          if (this.options.noExtraKeywords === true) {
            report.addError("KEYWORD_UNEXPECTED", [key]);
          }
        }
      }
      if (this.options.pedanticCheck === true) {
        if (schema.enum) {
          var tmpSchema = Utils.clone(schema);
          delete tmpSchema.enum;
          delete tmpSchema.default;
          report.path.push("enum");
          idx = schema.enum.length;
          while (idx--) {
            report.path.push(idx.toString());
            JsonValidation.validate.call(this, report, tmpSchema, schema.enum[idx]);
            report.path.pop();
          }
          report.path.pop();
        }
        if (schema.default) {
          report.path.push("default");
          JsonValidation.validate.call(this, report, schema, schema.default);
          report.path.pop();
        }
      }
      var isValid = report.isValid();
      if (isValid) {
        schema.__$validated = true;
      }
      return isValid;
    };
  }
});

// node_modules/z-schema/src/SchemaCache.js
var require_SchemaCache = __commonJS({
  "node_modules/z-schema/src/SchemaCache.js"(exports) {
    "use strict";
    var isequal = require_lodash2();
    var Report = require_Report();
    var SchemaCompilation = require_SchemaCompilation();
    var SchemaValidation = require_SchemaValidation();
    var Utils = require_Utils();
    function decodeJSONPointer(str) {
      return decodeURIComponent(str).replace(/~[0-1]/g, function(x) {
        return x === "~1" ? "/" : "~";
      });
    }
    function getRemotePath(uri) {
      var io = uri.indexOf("#");
      return io === -1 ? uri : uri.slice(0, io);
    }
    function getQueryPath(uri) {
      var io = uri.indexOf("#");
      var res = io === -1 ? void 0 : uri.slice(io + 1);
      return res;
    }
    function findId(schema, id) {
      if (typeof schema !== "object" || schema === null) {
        return;
      }
      if (!id) {
        return schema;
      }
      if (schema.id) {
        if (schema.id === id || schema.id[0] === "#" && schema.id.substring(1) === id) {
          return schema;
        }
      }
      var idx, result;
      if (Array.isArray(schema)) {
        idx = schema.length;
        while (idx--) {
          result = findId(schema[idx], id);
          if (result) {
            return result;
          }
        }
      } else {
        var keys = Object.keys(schema);
        idx = keys.length;
        while (idx--) {
          var k = keys[idx];
          if (k.indexOf("__$") === 0) {
            continue;
          }
          result = findId(schema[k], id);
          if (result) {
            return result;
          }
        }
      }
    }
    exports.cacheSchemaByUri = function(uri, schema) {
      var remotePath = getRemotePath(uri);
      if (remotePath) {
        this.cache[remotePath] = schema;
      }
    };
    exports.removeFromCacheByUri = function(uri) {
      var remotePath = getRemotePath(uri);
      if (remotePath) {
        delete this.cache[remotePath];
      }
    };
    exports.checkCacheForUri = function(uri) {
      var remotePath = getRemotePath(uri);
      return remotePath ? this.cache[remotePath] != null : false;
    };
    exports.getSchema = function(report, schema) {
      if (typeof schema === "object") {
        schema = exports.getSchemaByReference.call(this, report, schema);
      }
      if (typeof schema === "string") {
        schema = exports.getSchemaByUri.call(this, report, schema);
      }
      return schema;
    };
    exports.getSchemaByReference = function(report, key) {
      var i = this.referenceCache.length;
      while (i--) {
        if (isequal(this.referenceCache[i][0], key)) {
          return this.referenceCache[i][1];
        }
      }
      var schema = Utils.cloneDeep(key);
      this.referenceCache.push([key, schema]);
      return schema;
    };
    exports.getSchemaByUri = function(report, uri, root) {
      var remotePath = getRemotePath(uri), queryPath = getQueryPath(uri), result = remotePath ? this.cache[remotePath] : root;
      if (result && remotePath) {
        var compileRemote = result !== root;
        if (compileRemote) {
          report.path.push(remotePath);
          var remoteReport;
          var anscestorReport = report.getAncestor(result.id);
          if (anscestorReport) {
            remoteReport = anscestorReport;
          } else {
            remoteReport = new Report(report);
            if (SchemaCompilation.compileSchema.call(this, remoteReport, result)) {
              var savedOptions = this.options;
              try {
                this.options = result.__$validationOptions || this.options;
                SchemaValidation.validateSchema.call(this, remoteReport, result);
              } finally {
                this.options = savedOptions;
              }
            }
          }
          var remoteReportIsValid = remoteReport.isValid();
          if (!remoteReportIsValid) {
            report.addError("REMOTE_NOT_VALID", [uri], remoteReport);
          }
          report.path.pop();
          if (!remoteReportIsValid) {
            return void 0;
          }
        }
      }
      if (result && queryPath) {
        var parts = queryPath.split("/");
        for (var idx = 0, lim = parts.length; result && idx < lim; idx++) {
          var key = decodeJSONPointer(parts[idx]);
          if (idx === 0) {
            result = findId(result, key);
          } else {
            result = result[key];
          }
        }
      }
      return result;
    };
    exports.getRemotePath = getRemotePath;
  }
});

// node_modules/z-schema/src/schemas/schema.json
var require_schema = __commonJS({
  "node_modules/z-schema/src/schemas/schema.json"(exports, module2) {
    module2.exports = {
      id: "http://json-schema.org/draft-04/schema#",
      $schema: "http://json-schema.org/draft-04/schema#",
      description: "Core schema meta-schema",
      definitions: {
        schemaArray: {
          type: "array",
          minItems: 1,
          items: { $ref: "#" }
        },
        positiveInteger: {
          type: "integer",
          minimum: 0
        },
        positiveIntegerDefault0: {
          allOf: [{ $ref: "#/definitions/positiveInteger" }, { default: 0 }]
        },
        simpleTypes: {
          enum: ["array", "boolean", "integer", "null", "number", "object", "string"]
        },
        stringArray: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          uniqueItems: true
        }
      },
      type: "object",
      properties: {
        id: {
          type: "string",
          format: "uri"
        },
        $schema: {
          type: "string",
          format: "uri"
        },
        title: {
          type: "string"
        },
        description: {
          type: "string"
        },
        default: {},
        multipleOf: {
          type: "number",
          minimum: 0,
          exclusiveMinimum: true
        },
        maximum: {
          type: "number"
        },
        exclusiveMaximum: {
          type: "boolean",
          default: false
        },
        minimum: {
          type: "number"
        },
        exclusiveMinimum: {
          type: "boolean",
          default: false
        },
        maxLength: { $ref: "#/definitions/positiveInteger" },
        minLength: { $ref: "#/definitions/positiveIntegerDefault0" },
        pattern: {
          type: "string",
          format: "regex"
        },
        additionalItems: {
          anyOf: [
            { type: "boolean" },
            { $ref: "#" }
          ],
          default: {}
        },
        items: {
          anyOf: [
            { $ref: "#" },
            { $ref: "#/definitions/schemaArray" }
          ],
          default: {}
        },
        maxItems: { $ref: "#/definitions/positiveInteger" },
        minItems: { $ref: "#/definitions/positiveIntegerDefault0" },
        uniqueItems: {
          type: "boolean",
          default: false
        },
        maxProperties: { $ref: "#/definitions/positiveInteger" },
        minProperties: { $ref: "#/definitions/positiveIntegerDefault0" },
        required: { $ref: "#/definitions/stringArray" },
        additionalProperties: {
          anyOf: [
            { type: "boolean" },
            { $ref: "#" }
          ],
          default: {}
        },
        definitions: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        properties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        patternProperties: {
          type: "object",
          additionalProperties: { $ref: "#" },
          default: {}
        },
        dependencies: {
          type: "object",
          additionalProperties: {
            anyOf: [
              { $ref: "#" },
              { $ref: "#/definitions/stringArray" }
            ]
          }
        },
        enum: {
          type: "array",
          minItems: 1,
          uniqueItems: true
        },
        type: {
          anyOf: [
            { $ref: "#/definitions/simpleTypes" },
            {
              type: "array",
              items: { $ref: "#/definitions/simpleTypes" },
              minItems: 1,
              uniqueItems: true
            }
          ]
        },
        format: { type: "string" },
        allOf: { $ref: "#/definitions/schemaArray" },
        anyOf: { $ref: "#/definitions/schemaArray" },
        oneOf: { $ref: "#/definitions/schemaArray" },
        not: { $ref: "#" }
      },
      dependencies: {
        exclusiveMaximum: ["maximum"],
        exclusiveMinimum: ["minimum"]
      },
      default: {}
    };
  }
});

// node_modules/z-schema/src/schemas/hyper-schema.json
var require_hyper_schema = __commonJS({
  "node_modules/z-schema/src/schemas/hyper-schema.json"(exports, module2) {
    module2.exports = {
      $schema: "http://json-schema.org/draft-04/hyper-schema#",
      id: "http://json-schema.org/draft-04/hyper-schema#",
      title: "JSON Hyper-Schema",
      allOf: [
        {
          $ref: "http://json-schema.org/draft-04/schema#"
        }
      ],
      properties: {
        additionalItems: {
          anyOf: [
            {
              type: "boolean"
            },
            {
              $ref: "#"
            }
          ]
        },
        additionalProperties: {
          anyOf: [
            {
              type: "boolean"
            },
            {
              $ref: "#"
            }
          ]
        },
        dependencies: {
          additionalProperties: {
            anyOf: [
              {
                $ref: "#"
              },
              {
                type: "array"
              }
            ]
          }
        },
        items: {
          anyOf: [
            {
              $ref: "#"
            },
            {
              $ref: "#/definitions/schemaArray"
            }
          ]
        },
        definitions: {
          additionalProperties: {
            $ref: "#"
          }
        },
        patternProperties: {
          additionalProperties: {
            $ref: "#"
          }
        },
        properties: {
          additionalProperties: {
            $ref: "#"
          }
        },
        allOf: {
          $ref: "#/definitions/schemaArray"
        },
        anyOf: {
          $ref: "#/definitions/schemaArray"
        },
        oneOf: {
          $ref: "#/definitions/schemaArray"
        },
        not: {
          $ref: "#"
        },
        links: {
          type: "array",
          items: {
            $ref: "#/definitions/linkDescription"
          }
        },
        fragmentResolution: {
          type: "string"
        },
        media: {
          type: "object",
          properties: {
            type: {
              description: "A media type, as described in RFC 2046",
              type: "string"
            },
            binaryEncoding: {
              description: "A content encoding scheme, as described in RFC 2045",
              type: "string"
            }
          }
        },
        pathStart: {
          description: "Instances' URIs must start with this value for this schema to apply to them",
          type: "string",
          format: "uri"
        }
      },
      definitions: {
        schemaArray: {
          type: "array",
          items: {
            $ref: "#"
          }
        },
        linkDescription: {
          title: "Link Description Object",
          type: "object",
          required: ["href", "rel"],
          properties: {
            href: {
              description: "a URI template, as defined by RFC 6570, with the addition of the $, ( and ) characters for pre-processing",
              type: "string"
            },
            rel: {
              description: "relation to the target resource of the link",
              type: "string"
            },
            title: {
              description: "a title for the link",
              type: "string"
            },
            targetSchema: {
              description: "JSON Schema describing the link target",
              $ref: "#"
            },
            mediaType: {
              description: "media type (as defined by RFC 2046) describing the link target",
              type: "string"
            },
            method: {
              description: 'method for requesting the target of the link (e.g. for HTTP this might be "GET" or "DELETE")',
              type: "string"
            },
            encType: {
              description: "The media type in which to submit data along with the request",
              type: "string",
              default: "application/json"
            },
            schema: {
              description: "Schema describing the data to submit along with the request",
              $ref: "#"
            }
          }
        }
      }
    };
  }
});

// node_modules/z-schema/src/ZSchema.js
var require_ZSchema = __commonJS({
  "node_modules/z-schema/src/ZSchema.js"(exports, module2) {
    "use strict";
    require_Polyfills();
    var get = require_lodash();
    var Report = require_Report();
    var FormatValidators = require_FormatValidators();
    var JsonValidation = require_JsonValidation();
    var SchemaCache = require_SchemaCache();
    var SchemaCompilation = require_SchemaCompilation();
    var SchemaValidation = require_SchemaValidation();
    var Utils = require_Utils();
    var Draft4Schema = require_schema();
    var Draft4HyperSchema = require_hyper_schema();
    var defaultOptions = {
      asyncTimeout: 2e3,
      forceAdditional: false,
      assumeAdditional: false,
      enumCaseInsensitiveComparison: false,
      forceItems: false,
      forceMinItems: false,
      forceMaxItems: false,
      forceMinLength: false,
      forceMaxLength: false,
      forceProperties: false,
      ignoreUnresolvableReferences: false,
      noExtraKeywords: false,
      noTypeless: false,
      noEmptyStrings: false,
      noEmptyArrays: false,
      strictUris: false,
      strictMode: false,
      reportPathAsArray: false,
      breakOnFirstError: false,
      pedanticCheck: false,
      ignoreUnknownFormats: false,
      customValidator: null
    };
    function normalizeOptions(options) {
      var normalized;
      if (typeof options === "object") {
        var keys = Object.keys(options), idx = keys.length, key;
        while (idx--) {
          key = keys[idx];
          if (defaultOptions[key] === void 0) {
            throw new Error("Unexpected option passed to constructor: " + key);
          }
        }
        keys = Object.keys(defaultOptions);
        idx = keys.length;
        while (idx--) {
          key = keys[idx];
          if (options[key] === void 0) {
            options[key] = Utils.clone(defaultOptions[key]);
          }
        }
        normalized = options;
      } else {
        normalized = Utils.clone(defaultOptions);
      }
      if (normalized.strictMode === true) {
        normalized.forceAdditional = true;
        normalized.forceItems = true;
        normalized.forceMaxLength = true;
        normalized.forceProperties = true;
        normalized.noExtraKeywords = true;
        normalized.noTypeless = true;
        normalized.noEmptyStrings = true;
        normalized.noEmptyArrays = true;
      }
      return normalized;
    }
    function ZSchema(options) {
      this.cache = {};
      this.referenceCache = [];
      this.validateOptions = {};
      this.options = normalizeOptions(options);
      var metaschemaOptions = normalizeOptions({});
      this.setRemoteReference("http://json-schema.org/draft-04/schema", Draft4Schema, metaschemaOptions);
      this.setRemoteReference("http://json-schema.org/draft-04/hyper-schema", Draft4HyperSchema, metaschemaOptions);
    }
    ZSchema.prototype.compileSchema = function(schema) {
      var report = new Report(this.options);
      schema = SchemaCache.getSchema.call(this, report, schema);
      SchemaCompilation.compileSchema.call(this, report, schema);
      this.lastReport = report;
      return report.isValid();
    };
    ZSchema.prototype.validateSchema = function(schema) {
      if (Array.isArray(schema) && schema.length === 0) {
        throw new Error(".validateSchema was called with an empty array");
      }
      var report = new Report(this.options);
      schema = SchemaCache.getSchema.call(this, report, schema);
      var compiled = SchemaCompilation.compileSchema.call(this, report, schema);
      if (compiled) {
        SchemaValidation.validateSchema.call(this, report, schema);
      }
      this.lastReport = report;
      return report.isValid();
    };
    ZSchema.prototype.validate = function(json, schema, options, callback) {
      if (Utils.whatIs(options) === "function") {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }
      this.validateOptions = options;
      var whatIs = Utils.whatIs(schema);
      if (whatIs !== "string" && whatIs !== "object") {
        var e = new Error("Invalid .validate call - schema must be a string or object but " + whatIs + " was passed!");
        if (callback) {
          process.nextTick(function() {
            callback(e, false);
          });
          return;
        }
        throw e;
      }
      var foundError = false;
      var report = new Report(this.options);
      report.json = json;
      if (typeof schema === "string") {
        var schemaName = schema;
        schema = SchemaCache.getSchema.call(this, report, schemaName);
        if (!schema) {
          throw new Error("Schema with id '" + schemaName + "' wasn't found in the validator cache!");
        }
      } else {
        schema = SchemaCache.getSchema.call(this, report, schema);
      }
      var compiled = false;
      if (!foundError) {
        compiled = SchemaCompilation.compileSchema.call(this, report, schema);
      }
      if (!compiled) {
        this.lastReport = report;
        foundError = true;
      }
      var validated = false;
      if (!foundError) {
        validated = SchemaValidation.validateSchema.call(this, report, schema);
      }
      if (!validated) {
        this.lastReport = report;
        foundError = true;
      }
      if (options.schemaPath) {
        report.rootSchema = schema;
        schema = get(schema, options.schemaPath);
        if (!schema) {
          throw new Error("Schema path '" + options.schemaPath + "' wasn't found in the schema!");
        }
      }
      if (!foundError) {
        JsonValidation.validate.call(this, report, schema, json);
      }
      if (callback) {
        report.processAsyncTasks(this.options.asyncTimeout, callback);
        return;
      } else if (report.asyncTasks.length > 0) {
        throw new Error("This validation has async tasks and cannot be done in sync mode, please provide callback argument.");
      }
      this.lastReport = report;
      return report.isValid();
    };
    ZSchema.prototype.getLastError = function() {
      if (this.lastReport.errors.length === 0) {
        return null;
      }
      var e = new Error();
      e.name = "z-schema validation error";
      e.message = this.lastReport.commonErrorMessage;
      e.details = this.lastReport.errors;
      return e;
    };
    ZSchema.prototype.getLastErrors = function() {
      return this.lastReport && this.lastReport.errors.length > 0 ? this.lastReport.errors : null;
    };
    ZSchema.prototype.getMissingReferences = function(arr) {
      arr = arr || this.lastReport.errors;
      var res = [], idx = arr.length;
      while (idx--) {
        var error = arr[idx];
        if (error.code === "UNRESOLVABLE_REFERENCE") {
          var reference = error.params[0];
          if (res.indexOf(reference) === -1) {
            res.push(reference);
          }
        }
        if (error.inner) {
          res = res.concat(this.getMissingReferences(error.inner));
        }
      }
      return res;
    };
    ZSchema.prototype.getMissingRemoteReferences = function() {
      var missingReferences = this.getMissingReferences(), missingRemoteReferences = [], idx = missingReferences.length;
      while (idx--) {
        var remoteReference = SchemaCache.getRemotePath(missingReferences[idx]);
        if (remoteReference && missingRemoteReferences.indexOf(remoteReference) === -1) {
          missingRemoteReferences.push(remoteReference);
        }
      }
      return missingRemoteReferences;
    };
    ZSchema.prototype.setRemoteReference = function(uri, schema, validationOptions) {
      if (typeof schema === "string") {
        schema = JSON.parse(schema);
      } else {
        schema = Utils.cloneDeep(schema);
      }
      if (validationOptions) {
        schema.__$validationOptions = normalizeOptions(validationOptions);
      }
      SchemaCache.cacheSchemaByUri.call(this, uri, schema);
    };
    ZSchema.prototype.getResolvedSchema = function(schema) {
      var report = new Report(this.options);
      schema = SchemaCache.getSchema.call(this, report, schema);
      schema = Utils.cloneDeep(schema);
      var visited = [];
      var cleanup = function(schema2) {
        var key, typeOf = Utils.whatIs(schema2);
        if (typeOf !== "object" && typeOf !== "array") {
          return;
        }
        if (schema2.___$visited) {
          return;
        }
        schema2.___$visited = true;
        visited.push(schema2);
        if (schema2.$ref && schema2.__$refResolved) {
          var from = schema2.__$refResolved;
          var to = schema2;
          delete schema2.$ref;
          delete schema2.__$refResolved;
          for (key in from) {
            if (from.hasOwnProperty(key)) {
              to[key] = from[key];
            }
          }
        }
        for (key in schema2) {
          if (schema2.hasOwnProperty(key)) {
            if (key.indexOf("__$") === 0) {
              delete schema2[key];
            } else {
              cleanup(schema2[key]);
            }
          }
        }
      };
      cleanup(schema);
      visited.forEach(function(s) {
        delete s.___$visited;
      });
      this.lastReport = report;
      if (report.isValid()) {
        return schema;
      } else {
        throw this.getLastError();
      }
    };
    ZSchema.prototype.setSchemaReader = function(schemaReader) {
      return ZSchema.setSchemaReader(schemaReader);
    };
    ZSchema.prototype.getSchemaReader = function() {
      return ZSchema.schemaReader;
    };
    ZSchema.schemaReader = void 0;
    ZSchema.setSchemaReader = function(schemaReader) {
      ZSchema.schemaReader = schemaReader;
    };
    ZSchema.registerFormat = function(formatName, validatorFunction) {
      FormatValidators[formatName] = validatorFunction;
    };
    ZSchema.unregisterFormat = function(formatName) {
      delete FormatValidators[formatName];
    };
    ZSchema.getRegisteredFormats = function() {
      return Object.keys(FormatValidators);
    };
    ZSchema.getDefaultOptions = function() {
      return Utils.cloneDeep(defaultOptions);
    };
    ZSchema.schemaSymbol = Utils.schemaSymbol;
    ZSchema.jsonSymbol = Utils.jsonSymbol;
    module2.exports = ZSchema;
  }
});

// node_modules/@apidevtools/openapi-schemas/schemas/v1.2/apiDeclaration.json
var require_apiDeclaration = __commonJS({
  "node_modules/@apidevtools/openapi-schemas/schemas/v1.2/apiDeclaration.json"(exports, module2) {
    module2.exports = {
      id: "https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v1.2/apiDeclaration.json#",
      $schema: "http://json-schema.org/draft-04/schema#",
      type: "object",
      required: ["swaggerVersion", "basePath", "apis"],
      properties: {
        swaggerVersion: { enum: ["1.2"] },
        apiVersion: { type: "string" },
        basePath: {
          type: "string",
          format: "uri",
          pattern: "^https?://"
        },
        resourcePath: {
          type: "string",
          format: "uri",
          pattern: "^/"
        },
        apis: {
          type: "array",
          items: { $ref: "#/definitions/apiObject" }
        },
        models: {
          type: "object",
          additionalProperties: {
            $ref: "modelsObject.json#"
          }
        },
        produces: { $ref: "#/definitions/mimeTypeArray" },
        consumes: { $ref: "#/definitions/mimeTypeArray" },
        authorizations: { $ref: "authorizationObject.json#" }
      },
      additionalProperties: false,
      definitions: {
        apiObject: {
          type: "object",
          required: ["path", "operations"],
          properties: {
            path: {
              type: "string",
              format: "uri-template",
              pattern: "^/"
            },
            description: { type: "string" },
            operations: {
              type: "array",
              items: { $ref: "operationObject.json#" }
            }
          },
          additionalProperties: false
        },
        mimeTypeArray: {
          type: "array",
          items: {
            type: "string",
            format: "mime-type"
          },
          uniqueItems: true
        }
      }
    };
  }
});

// node_modules/@apidevtools/openapi-schemas/schemas/v2.0/schema.json
var require_schema2 = __commonJS({
  "node_modules/@apidevtools/openapi-schemas/schemas/v2.0/schema.json"(exports, module2) {
    module2.exports = {
      title: "A JSON Schema for Swagger 2.0 API.",
      id: "http://swagger.io/v2/schema.json#",
      $schema: "http://json-schema.org/draft-04/schema#",
      type: "object",
      required: [
        "swagger",
        "info",
        "paths"
      ],
      additionalProperties: false,
      patternProperties: {
        "^x-": {
          $ref: "#/definitions/vendorExtension"
        }
      },
      properties: {
        swagger: {
          type: "string",
          enum: [
            "2.0"
          ],
          description: "The Swagger version of this document."
        },
        info: {
          $ref: "#/definitions/info"
        },
        host: {
          type: "string",
          pattern: "^[^{}/ :\\\\]+(?::\\d+)?$",
          description: "The host (name or ip) of the API. Example: 'swagger.io'"
        },
        basePath: {
          type: "string",
          pattern: "^/",
          description: "The base path to the API. Example: '/api'."
        },
        schemes: {
          $ref: "#/definitions/schemesList"
        },
        consumes: {
          description: "A list of MIME types accepted by the API.",
          allOf: [
            {
              $ref: "#/definitions/mediaTypeList"
            }
          ]
        },
        produces: {
          description: "A list of MIME types the API can produce.",
          allOf: [
            {
              $ref: "#/definitions/mediaTypeList"
            }
          ]
        },
        paths: {
          $ref: "#/definitions/paths"
        },
        definitions: {
          $ref: "#/definitions/definitions"
        },
        parameters: {
          $ref: "#/definitions/parameterDefinitions"
        },
        responses: {
          $ref: "#/definitions/responseDefinitions"
        },
        security: {
          $ref: "#/definitions/security"
        },
        securityDefinitions: {
          $ref: "#/definitions/securityDefinitions"
        },
        tags: {
          type: "array",
          items: {
            $ref: "#/definitions/tag"
          },
          uniqueItems: true
        },
        externalDocs: {
          $ref: "#/definitions/externalDocs"
        }
      },
      definitions: {
        info: {
          type: "object",
          description: "General information about the API.",
          required: [
            "version",
            "title"
          ],
          additionalProperties: false,
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          properties: {
            title: {
              type: "string",
              description: "A unique and precise title of the API."
            },
            version: {
              type: "string",
              description: "A semantic version number of the API."
            },
            description: {
              type: "string",
              description: "A longer description of the API. Should be different from the title.  GitHub Flavored Markdown is allowed."
            },
            termsOfService: {
              type: "string",
              description: "The terms of service for the API."
            },
            contact: {
              $ref: "#/definitions/contact"
            },
            license: {
              $ref: "#/definitions/license"
            }
          }
        },
        contact: {
          type: "object",
          description: "Contact information for the owners of the API.",
          additionalProperties: false,
          properties: {
            name: {
              type: "string",
              description: "The identifying name of the contact person/organization."
            },
            url: {
              type: "string",
              description: "The URL pointing to the contact information.",
              format: "uri"
            },
            email: {
              type: "string",
              description: "The email address of the contact person/organization.",
              format: "email"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        license: {
          type: "object",
          required: [
            "name"
          ],
          additionalProperties: false,
          properties: {
            name: {
              type: "string",
              description: "The name of the license type. It's encouraged to use an OSI compatible license."
            },
            url: {
              type: "string",
              description: "The URL pointing to the license.",
              format: "uri"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        paths: {
          type: "object",
          description: "Relative paths to the individual endpoints. They must be relative to the 'basePath'.",
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            },
            "^/": {
              $ref: "#/definitions/pathItem"
            }
          },
          additionalProperties: false
        },
        definitions: {
          type: "object",
          additionalProperties: {
            $ref: "#/definitions/schema"
          },
          description: "One or more JSON objects describing the schemas being consumed and produced by the API."
        },
        parameterDefinitions: {
          type: "object",
          additionalProperties: {
            $ref: "#/definitions/parameter"
          },
          description: "One or more JSON representations for parameters"
        },
        responseDefinitions: {
          type: "object",
          additionalProperties: {
            $ref: "#/definitions/response"
          },
          description: "One or more JSON representations for responses"
        },
        externalDocs: {
          type: "object",
          additionalProperties: false,
          description: "information about external documentation",
          required: [
            "url"
          ],
          properties: {
            description: {
              type: "string"
            },
            url: {
              type: "string",
              format: "uri"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        examples: {
          type: "object",
          additionalProperties: true
        },
        mimeType: {
          type: "string",
          description: "The MIME type of the HTTP message."
        },
        operation: {
          type: "object",
          required: [
            "responses"
          ],
          additionalProperties: false,
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          properties: {
            tags: {
              type: "array",
              items: {
                type: "string"
              },
              uniqueItems: true
            },
            summary: {
              type: "string",
              description: "A brief summary of the operation."
            },
            description: {
              type: "string",
              description: "A longer description of the operation, GitHub Flavored Markdown is allowed."
            },
            externalDocs: {
              $ref: "#/definitions/externalDocs"
            },
            operationId: {
              type: "string",
              description: "A unique identifier of the operation."
            },
            produces: {
              description: "A list of MIME types the API can produce.",
              allOf: [
                {
                  $ref: "#/definitions/mediaTypeList"
                }
              ]
            },
            consumes: {
              description: "A list of MIME types the API can consume.",
              allOf: [
                {
                  $ref: "#/definitions/mediaTypeList"
                }
              ]
            },
            parameters: {
              $ref: "#/definitions/parametersList"
            },
            responses: {
              $ref: "#/definitions/responses"
            },
            schemes: {
              $ref: "#/definitions/schemesList"
            },
            deprecated: {
              type: "boolean",
              default: false
            },
            security: {
              $ref: "#/definitions/security"
            }
          }
        },
        pathItem: {
          type: "object",
          additionalProperties: false,
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          properties: {
            $ref: {
              type: "string"
            },
            get: {
              $ref: "#/definitions/operation"
            },
            put: {
              $ref: "#/definitions/operation"
            },
            post: {
              $ref: "#/definitions/operation"
            },
            delete: {
              $ref: "#/definitions/operation"
            },
            options: {
              $ref: "#/definitions/operation"
            },
            head: {
              $ref: "#/definitions/operation"
            },
            patch: {
              $ref: "#/definitions/operation"
            },
            parameters: {
              $ref: "#/definitions/parametersList"
            }
          }
        },
        responses: {
          type: "object",
          description: "Response objects names can either be any valid HTTP status code or 'default'.",
          minProperties: 1,
          additionalProperties: false,
          patternProperties: {
            "^([0-9]{3})$|^(default)$": {
              $ref: "#/definitions/responseValue"
            },
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          not: {
            type: "object",
            additionalProperties: false,
            patternProperties: {
              "^x-": {
                $ref: "#/definitions/vendorExtension"
              }
            }
          }
        },
        responseValue: {
          oneOf: [
            {
              $ref: "#/definitions/response"
            },
            {
              $ref: "#/definitions/jsonReference"
            }
          ]
        },
        response: {
          type: "object",
          required: [
            "description"
          ],
          properties: {
            description: {
              type: "string"
            },
            schema: {
              oneOf: [
                {
                  $ref: "#/definitions/schema"
                },
                {
                  $ref: "#/definitions/fileSchema"
                }
              ]
            },
            headers: {
              $ref: "#/definitions/headers"
            },
            examples: {
              $ref: "#/definitions/examples"
            }
          },
          additionalProperties: false,
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        headers: {
          type: "object",
          additionalProperties: {
            $ref: "#/definitions/header"
          }
        },
        header: {
          type: "object",
          additionalProperties: false,
          required: [
            "type"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "integer",
                "boolean",
                "array"
              ]
            },
            format: {
              type: "string"
            },
            items: {
              $ref: "#/definitions/primitivesItems"
            },
            collectionFormat: {
              $ref: "#/definitions/collectionFormat"
            },
            default: {
              $ref: "#/definitions/default"
            },
            maximum: {
              $ref: "#/definitions/maximum"
            },
            exclusiveMaximum: {
              $ref: "#/definitions/exclusiveMaximum"
            },
            minimum: {
              $ref: "#/definitions/minimum"
            },
            exclusiveMinimum: {
              $ref: "#/definitions/exclusiveMinimum"
            },
            maxLength: {
              $ref: "#/definitions/maxLength"
            },
            minLength: {
              $ref: "#/definitions/minLength"
            },
            pattern: {
              $ref: "#/definitions/pattern"
            },
            maxItems: {
              $ref: "#/definitions/maxItems"
            },
            minItems: {
              $ref: "#/definitions/minItems"
            },
            uniqueItems: {
              $ref: "#/definitions/uniqueItems"
            },
            enum: {
              $ref: "#/definitions/enum"
            },
            multipleOf: {
              $ref: "#/definitions/multipleOf"
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        vendorExtension: {
          description: "Any property starting with x- is valid.",
          additionalProperties: true,
          additionalItems: true
        },
        bodyParameter: {
          type: "object",
          required: [
            "name",
            "in",
            "schema"
          ],
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          properties: {
            description: {
              type: "string",
              description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
            },
            name: {
              type: "string",
              description: "The name of the parameter."
            },
            in: {
              type: "string",
              description: "Determines the location of the parameter.",
              enum: [
                "body"
              ]
            },
            required: {
              type: "boolean",
              description: "Determines whether or not this parameter is required or optional.",
              default: false
            },
            schema: {
              $ref: "#/definitions/schema"
            }
          },
          additionalProperties: false
        },
        headerParameterSubSchema: {
          additionalProperties: false,
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          properties: {
            required: {
              type: "boolean",
              description: "Determines whether or not this parameter is required or optional.",
              default: false
            },
            in: {
              type: "string",
              description: "Determines the location of the parameter.",
              enum: [
                "header"
              ]
            },
            description: {
              type: "string",
              description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
            },
            name: {
              type: "string",
              description: "The name of the parameter."
            },
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "boolean",
                "integer",
                "array"
              ]
            },
            format: {
              type: "string"
            },
            items: {
              $ref: "#/definitions/primitivesItems"
            },
            collectionFormat: {
              $ref: "#/definitions/collectionFormat"
            },
            default: {
              $ref: "#/definitions/default"
            },
            maximum: {
              $ref: "#/definitions/maximum"
            },
            exclusiveMaximum: {
              $ref: "#/definitions/exclusiveMaximum"
            },
            minimum: {
              $ref: "#/definitions/minimum"
            },
            exclusiveMinimum: {
              $ref: "#/definitions/exclusiveMinimum"
            },
            maxLength: {
              $ref: "#/definitions/maxLength"
            },
            minLength: {
              $ref: "#/definitions/minLength"
            },
            pattern: {
              $ref: "#/definitions/pattern"
            },
            maxItems: {
              $ref: "#/definitions/maxItems"
            },
            minItems: {
              $ref: "#/definitions/minItems"
            },
            uniqueItems: {
              $ref: "#/definitions/uniqueItems"
            },
            enum: {
              $ref: "#/definitions/enum"
            },
            multipleOf: {
              $ref: "#/definitions/multipleOf"
            }
          }
        },
        queryParameterSubSchema: {
          additionalProperties: false,
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          properties: {
            required: {
              type: "boolean",
              description: "Determines whether or not this parameter is required or optional.",
              default: false
            },
            in: {
              type: "string",
              description: "Determines the location of the parameter.",
              enum: [
                "query"
              ]
            },
            description: {
              type: "string",
              description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
            },
            name: {
              type: "string",
              description: "The name of the parameter."
            },
            allowEmptyValue: {
              type: "boolean",
              default: false,
              description: "allows sending a parameter by name only or with an empty value."
            },
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "boolean",
                "integer",
                "array"
              ]
            },
            format: {
              type: "string"
            },
            items: {
              $ref: "#/definitions/primitivesItems"
            },
            collectionFormat: {
              $ref: "#/definitions/collectionFormatWithMulti"
            },
            default: {
              $ref: "#/definitions/default"
            },
            maximum: {
              $ref: "#/definitions/maximum"
            },
            exclusiveMaximum: {
              $ref: "#/definitions/exclusiveMaximum"
            },
            minimum: {
              $ref: "#/definitions/minimum"
            },
            exclusiveMinimum: {
              $ref: "#/definitions/exclusiveMinimum"
            },
            maxLength: {
              $ref: "#/definitions/maxLength"
            },
            minLength: {
              $ref: "#/definitions/minLength"
            },
            pattern: {
              $ref: "#/definitions/pattern"
            },
            maxItems: {
              $ref: "#/definitions/maxItems"
            },
            minItems: {
              $ref: "#/definitions/minItems"
            },
            uniqueItems: {
              $ref: "#/definitions/uniqueItems"
            },
            enum: {
              $ref: "#/definitions/enum"
            },
            multipleOf: {
              $ref: "#/definitions/multipleOf"
            }
          }
        },
        formDataParameterSubSchema: {
          additionalProperties: false,
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          properties: {
            required: {
              type: "boolean",
              description: "Determines whether or not this parameter is required or optional.",
              default: false
            },
            in: {
              type: "string",
              description: "Determines the location of the parameter.",
              enum: [
                "formData"
              ]
            },
            description: {
              type: "string",
              description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
            },
            name: {
              type: "string",
              description: "The name of the parameter."
            },
            allowEmptyValue: {
              type: "boolean",
              default: false,
              description: "allows sending a parameter by name only or with an empty value."
            },
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "boolean",
                "integer",
                "array",
                "file"
              ]
            },
            format: {
              type: "string"
            },
            items: {
              $ref: "#/definitions/primitivesItems"
            },
            collectionFormat: {
              $ref: "#/definitions/collectionFormatWithMulti"
            },
            default: {
              $ref: "#/definitions/default"
            },
            maximum: {
              $ref: "#/definitions/maximum"
            },
            exclusiveMaximum: {
              $ref: "#/definitions/exclusiveMaximum"
            },
            minimum: {
              $ref: "#/definitions/minimum"
            },
            exclusiveMinimum: {
              $ref: "#/definitions/exclusiveMinimum"
            },
            maxLength: {
              $ref: "#/definitions/maxLength"
            },
            minLength: {
              $ref: "#/definitions/minLength"
            },
            pattern: {
              $ref: "#/definitions/pattern"
            },
            maxItems: {
              $ref: "#/definitions/maxItems"
            },
            minItems: {
              $ref: "#/definitions/minItems"
            },
            uniqueItems: {
              $ref: "#/definitions/uniqueItems"
            },
            enum: {
              $ref: "#/definitions/enum"
            },
            multipleOf: {
              $ref: "#/definitions/multipleOf"
            }
          }
        },
        pathParameterSubSchema: {
          additionalProperties: false,
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          required: [
            "required"
          ],
          properties: {
            required: {
              type: "boolean",
              enum: [
                true
              ],
              description: "Determines whether or not this parameter is required or optional."
            },
            in: {
              type: "string",
              description: "Determines the location of the parameter.",
              enum: [
                "path"
              ]
            },
            description: {
              type: "string",
              description: "A brief description of the parameter. This could contain examples of use.  GitHub Flavored Markdown is allowed."
            },
            name: {
              type: "string",
              description: "The name of the parameter."
            },
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "boolean",
                "integer",
                "array"
              ]
            },
            format: {
              type: "string"
            },
            items: {
              $ref: "#/definitions/primitivesItems"
            },
            collectionFormat: {
              $ref: "#/definitions/collectionFormat"
            },
            default: {
              $ref: "#/definitions/default"
            },
            maximum: {
              $ref: "#/definitions/maximum"
            },
            exclusiveMaximum: {
              $ref: "#/definitions/exclusiveMaximum"
            },
            minimum: {
              $ref: "#/definitions/minimum"
            },
            exclusiveMinimum: {
              $ref: "#/definitions/exclusiveMinimum"
            },
            maxLength: {
              $ref: "#/definitions/maxLength"
            },
            minLength: {
              $ref: "#/definitions/minLength"
            },
            pattern: {
              $ref: "#/definitions/pattern"
            },
            maxItems: {
              $ref: "#/definitions/maxItems"
            },
            minItems: {
              $ref: "#/definitions/minItems"
            },
            uniqueItems: {
              $ref: "#/definitions/uniqueItems"
            },
            enum: {
              $ref: "#/definitions/enum"
            },
            multipleOf: {
              $ref: "#/definitions/multipleOf"
            }
          }
        },
        nonBodyParameter: {
          type: "object",
          required: [
            "name",
            "in",
            "type"
          ],
          oneOf: [
            {
              $ref: "#/definitions/headerParameterSubSchema"
            },
            {
              $ref: "#/definitions/formDataParameterSubSchema"
            },
            {
              $ref: "#/definitions/queryParameterSubSchema"
            },
            {
              $ref: "#/definitions/pathParameterSubSchema"
            }
          ]
        },
        parameter: {
          oneOf: [
            {
              $ref: "#/definitions/bodyParameter"
            },
            {
              $ref: "#/definitions/nonBodyParameter"
            }
          ]
        },
        schema: {
          type: "object",
          description: "A deterministic version of a JSON Schema object.",
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          properties: {
            $ref: {
              type: "string"
            },
            format: {
              type: "string"
            },
            title: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/title"
            },
            description: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/description"
            },
            default: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/default"
            },
            multipleOf: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/multipleOf"
            },
            maximum: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/maximum"
            },
            exclusiveMaximum: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/exclusiveMaximum"
            },
            minimum: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/minimum"
            },
            exclusiveMinimum: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/exclusiveMinimum"
            },
            maxLength: {
              $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
            },
            minLength: {
              $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
            },
            pattern: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/pattern"
            },
            maxItems: {
              $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
            },
            minItems: {
              $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
            },
            uniqueItems: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/uniqueItems"
            },
            maxProperties: {
              $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
            },
            minProperties: {
              $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
            },
            required: {
              $ref: "http://json-schema.org/draft-04/schema#/definitions/stringArray"
            },
            enum: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/enum"
            },
            additionalProperties: {
              anyOf: [
                {
                  $ref: "#/definitions/schema"
                },
                {
                  type: "boolean"
                }
              ],
              default: {}
            },
            type: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/type"
            },
            items: {
              anyOf: [
                {
                  $ref: "#/definitions/schema"
                },
                {
                  type: "array",
                  minItems: 1,
                  items: {
                    $ref: "#/definitions/schema"
                  }
                }
              ],
              default: {}
            },
            allOf: {
              type: "array",
              minItems: 1,
              items: {
                $ref: "#/definitions/schema"
              }
            },
            properties: {
              type: "object",
              additionalProperties: {
                $ref: "#/definitions/schema"
              },
              default: {}
            },
            discriminator: {
              type: "string"
            },
            readOnly: {
              type: "boolean",
              default: false
            },
            xml: {
              $ref: "#/definitions/xml"
            },
            externalDocs: {
              $ref: "#/definitions/externalDocs"
            },
            example: {}
          },
          additionalProperties: false
        },
        fileSchema: {
          type: "object",
          description: "A deterministic version of a JSON Schema object.",
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          },
          required: [
            "type"
          ],
          properties: {
            format: {
              type: "string"
            },
            title: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/title"
            },
            description: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/description"
            },
            default: {
              $ref: "http://json-schema.org/draft-04/schema#/properties/default"
            },
            required: {
              $ref: "http://json-schema.org/draft-04/schema#/definitions/stringArray"
            },
            type: {
              type: "string",
              enum: [
                "file"
              ]
            },
            readOnly: {
              type: "boolean",
              default: false
            },
            externalDocs: {
              $ref: "#/definitions/externalDocs"
            },
            example: {}
          },
          additionalProperties: false
        },
        primitivesItems: {
          type: "object",
          additionalProperties: false,
          properties: {
            type: {
              type: "string",
              enum: [
                "string",
                "number",
                "integer",
                "boolean",
                "array"
              ]
            },
            format: {
              type: "string"
            },
            items: {
              $ref: "#/definitions/primitivesItems"
            },
            collectionFormat: {
              $ref: "#/definitions/collectionFormat"
            },
            default: {
              $ref: "#/definitions/default"
            },
            maximum: {
              $ref: "#/definitions/maximum"
            },
            exclusiveMaximum: {
              $ref: "#/definitions/exclusiveMaximum"
            },
            minimum: {
              $ref: "#/definitions/minimum"
            },
            exclusiveMinimum: {
              $ref: "#/definitions/exclusiveMinimum"
            },
            maxLength: {
              $ref: "#/definitions/maxLength"
            },
            minLength: {
              $ref: "#/definitions/minLength"
            },
            pattern: {
              $ref: "#/definitions/pattern"
            },
            maxItems: {
              $ref: "#/definitions/maxItems"
            },
            minItems: {
              $ref: "#/definitions/minItems"
            },
            uniqueItems: {
              $ref: "#/definitions/uniqueItems"
            },
            enum: {
              $ref: "#/definitions/enum"
            },
            multipleOf: {
              $ref: "#/definitions/multipleOf"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        security: {
          type: "array",
          items: {
            $ref: "#/definitions/securityRequirement"
          },
          uniqueItems: true
        },
        securityRequirement: {
          type: "object",
          additionalProperties: {
            type: "array",
            items: {
              type: "string"
            },
            uniqueItems: true
          }
        },
        xml: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: {
              type: "string"
            },
            namespace: {
              type: "string"
            },
            prefix: {
              type: "string"
            },
            attribute: {
              type: "boolean",
              default: false
            },
            wrapped: {
              type: "boolean",
              default: false
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        tag: {
          type: "object",
          additionalProperties: false,
          required: [
            "name"
          ],
          properties: {
            name: {
              type: "string"
            },
            description: {
              type: "string"
            },
            externalDocs: {
              $ref: "#/definitions/externalDocs"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        securityDefinitions: {
          type: "object",
          additionalProperties: {
            oneOf: [
              {
                $ref: "#/definitions/basicAuthenticationSecurity"
              },
              {
                $ref: "#/definitions/apiKeySecurity"
              },
              {
                $ref: "#/definitions/oauth2ImplicitSecurity"
              },
              {
                $ref: "#/definitions/oauth2PasswordSecurity"
              },
              {
                $ref: "#/definitions/oauth2ApplicationSecurity"
              },
              {
                $ref: "#/definitions/oauth2AccessCodeSecurity"
              }
            ]
          }
        },
        basicAuthenticationSecurity: {
          type: "object",
          additionalProperties: false,
          required: [
            "type"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "basic"
              ]
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        apiKeySecurity: {
          type: "object",
          additionalProperties: false,
          required: [
            "type",
            "name",
            "in"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "apiKey"
              ]
            },
            name: {
              type: "string"
            },
            in: {
              type: "string",
              enum: [
                "header",
                "query"
              ]
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        oauth2ImplicitSecurity: {
          type: "object",
          additionalProperties: false,
          required: [
            "type",
            "flow",
            "authorizationUrl"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "oauth2"
              ]
            },
            flow: {
              type: "string",
              enum: [
                "implicit"
              ]
            },
            scopes: {
              $ref: "#/definitions/oauth2Scopes"
            },
            authorizationUrl: {
              type: "string",
              format: "uri"
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        oauth2PasswordSecurity: {
          type: "object",
          additionalProperties: false,
          required: [
            "type",
            "flow",
            "tokenUrl"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "oauth2"
              ]
            },
            flow: {
              type: "string",
              enum: [
                "password"
              ]
            },
            scopes: {
              $ref: "#/definitions/oauth2Scopes"
            },
            tokenUrl: {
              type: "string",
              format: "uri"
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        oauth2ApplicationSecurity: {
          type: "object",
          additionalProperties: false,
          required: [
            "type",
            "flow",
            "tokenUrl"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "oauth2"
              ]
            },
            flow: {
              type: "string",
              enum: [
                "application"
              ]
            },
            scopes: {
              $ref: "#/definitions/oauth2Scopes"
            },
            tokenUrl: {
              type: "string",
              format: "uri"
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        oauth2AccessCodeSecurity: {
          type: "object",
          additionalProperties: false,
          required: [
            "type",
            "flow",
            "authorizationUrl",
            "tokenUrl"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "oauth2"
              ]
            },
            flow: {
              type: "string",
              enum: [
                "accessCode"
              ]
            },
            scopes: {
              $ref: "#/definitions/oauth2Scopes"
            },
            authorizationUrl: {
              type: "string",
              format: "uri"
            },
            tokenUrl: {
              type: "string",
              format: "uri"
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {
              $ref: "#/definitions/vendorExtension"
            }
          }
        },
        oauth2Scopes: {
          type: "object",
          additionalProperties: {
            type: "string"
          }
        },
        mediaTypeList: {
          type: "array",
          items: {
            $ref: "#/definitions/mimeType"
          },
          uniqueItems: true
        },
        parametersList: {
          type: "array",
          description: "The parameters needed to send a valid API call.",
          additionalItems: false,
          items: {
            oneOf: [
              {
                $ref: "#/definitions/parameter"
              },
              {
                $ref: "#/definitions/jsonReference"
              }
            ]
          },
          uniqueItems: true
        },
        schemesList: {
          type: "array",
          description: "The transfer protocol of the API.",
          items: {
            type: "string",
            enum: [
              "http",
              "https",
              "ws",
              "wss"
            ]
          },
          uniqueItems: true
        },
        collectionFormat: {
          type: "string",
          enum: [
            "csv",
            "ssv",
            "tsv",
            "pipes"
          ],
          default: "csv"
        },
        collectionFormatWithMulti: {
          type: "string",
          enum: [
            "csv",
            "ssv",
            "tsv",
            "pipes",
            "multi"
          ],
          default: "csv"
        },
        title: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/title"
        },
        description: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/description"
        },
        default: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/default"
        },
        multipleOf: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/multipleOf"
        },
        maximum: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/maximum"
        },
        exclusiveMaximum: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/exclusiveMaximum"
        },
        minimum: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/minimum"
        },
        exclusiveMinimum: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/exclusiveMinimum"
        },
        maxLength: {
          $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
        },
        minLength: {
          $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
        },
        pattern: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/pattern"
        },
        maxItems: {
          $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveInteger"
        },
        minItems: {
          $ref: "http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0"
        },
        uniqueItems: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/uniqueItems"
        },
        enum: {
          $ref: "http://json-schema.org/draft-04/schema#/properties/enum"
        },
        jsonReference: {
          type: "object",
          required: [
            "$ref"
          ],
          additionalProperties: false,
          properties: {
            $ref: {
              type: "string"
            }
          }
        }
      }
    };
  }
});

// node_modules/@apidevtools/openapi-schemas/schemas/v3.0/schema.json
var require_schema3 = __commonJS({
  "node_modules/@apidevtools/openapi-schemas/schemas/v3.0/schema.json"(exports, module2) {
    module2.exports = {
      id: "https://spec.openapis.org/oas/3.0/schema/2019-04-02",
      $schema: "http://json-schema.org/draft-04/schema#",
      description: "Validation schema for OpenAPI Specification 3.0.X.",
      type: "object",
      required: [
        "openapi",
        "info",
        "paths"
      ],
      properties: {
        openapi: {
          type: "string",
          pattern: "^3\\.0\\.\\d(-.+)?$"
        },
        info: {
          $ref: "#/definitions/Info"
        },
        externalDocs: {
          $ref: "#/definitions/ExternalDocumentation"
        },
        servers: {
          type: "array",
          items: {
            $ref: "#/definitions/Server"
          }
        },
        security: {
          type: "array",
          items: {
            $ref: "#/definitions/SecurityRequirement"
          }
        },
        tags: {
          type: "array",
          items: {
            $ref: "#/definitions/Tag"
          },
          uniqueItems: true
        },
        paths: {
          $ref: "#/definitions/Paths"
        },
        components: {
          $ref: "#/definitions/Components"
        }
      },
      patternProperties: {
        "^x-": {}
      },
      additionalProperties: false,
      definitions: {
        Reference: {
          type: "object",
          required: [
            "$ref"
          ],
          patternProperties: {
            "^\\$ref$": {
              type: "string",
              format: "uri-reference"
            }
          }
        },
        Info: {
          type: "object",
          required: [
            "title",
            "version"
          ],
          properties: {
            title: {
              type: "string"
            },
            description: {
              type: "string"
            },
            termsOfService: {
              type: "string",
              format: "uri-reference"
            },
            contact: {
              $ref: "#/definitions/Contact"
            },
            license: {
              $ref: "#/definitions/License"
            },
            version: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        Contact: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            url: {
              type: "string",
              format: "uri-reference"
            },
            email: {
              type: "string",
              format: "email"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        License: {
          type: "object",
          required: [
            "name"
          ],
          properties: {
            name: {
              type: "string"
            },
            url: {
              type: "string",
              format: "uri-reference"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        Server: {
          type: "object",
          required: [
            "url"
          ],
          properties: {
            url: {
              type: "string"
            },
            description: {
              type: "string"
            },
            variables: {
              type: "object",
              additionalProperties: {
                $ref: "#/definitions/ServerVariable"
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        ServerVariable: {
          type: "object",
          required: [
            "default"
          ],
          properties: {
            enum: {
              type: "array",
              items: {
                type: "string"
              }
            },
            default: {
              type: "string"
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        Components: {
          type: "object",
          properties: {
            schemas: {
              type: "object",
              patternProperties: {
                "^[a-zA-Z0-9\\.\\-_]+$": {
                  oneOf: [
                    {
                      $ref: "#/definitions/Schema"
                    },
                    {
                      $ref: "#/definitions/Reference"
                    }
                  ]
                }
              }
            },
            responses: {
              type: "object",
              patternProperties: {
                "^[a-zA-Z0-9\\.\\-_]+$": {
                  oneOf: [
                    {
                      $ref: "#/definitions/Reference"
                    },
                    {
                      $ref: "#/definitions/Response"
                    }
                  ]
                }
              }
            },
            parameters: {
              type: "object",
              patternProperties: {
                "^[a-zA-Z0-9\\.\\-_]+$": {
                  oneOf: [
                    {
                      $ref: "#/definitions/Reference"
                    },
                    {
                      $ref: "#/definitions/Parameter"
                    }
                  ]
                }
              }
            },
            examples: {
              type: "object",
              patternProperties: {
                "^[a-zA-Z0-9\\.\\-_]+$": {
                  oneOf: [
                    {
                      $ref: "#/definitions/Reference"
                    },
                    {
                      $ref: "#/definitions/Example"
                    }
                  ]
                }
              }
            },
            requestBodies: {
              type: "object",
              patternProperties: {
                "^[a-zA-Z0-9\\.\\-_]+$": {
                  oneOf: [
                    {
                      $ref: "#/definitions/Reference"
                    },
                    {
                      $ref: "#/definitions/RequestBody"
                    }
                  ]
                }
              }
            },
            headers: {
              type: "object",
              patternProperties: {
                "^[a-zA-Z0-9\\.\\-_]+$": {
                  oneOf: [
                    {
                      $ref: "#/definitions/Reference"
                    },
                    {
                      $ref: "#/definitions/Header"
                    }
                  ]
                }
              }
            },
            securitySchemes: {
              type: "object",
              patternProperties: {
                "^[a-zA-Z0-9\\.\\-_]+$": {
                  oneOf: [
                    {
                      $ref: "#/definitions/Reference"
                    },
                    {
                      $ref: "#/definitions/SecurityScheme"
                    }
                  ]
                }
              }
            },
            links: {
              type: "object",
              patternProperties: {
                "^[a-zA-Z0-9\\.\\-_]+$": {
                  oneOf: [
                    {
                      $ref: "#/definitions/Reference"
                    },
                    {
                      $ref: "#/definitions/Link"
                    }
                  ]
                }
              }
            },
            callbacks: {
              type: "object",
              patternProperties: {
                "^[a-zA-Z0-9\\.\\-_]+$": {
                  oneOf: [
                    {
                      $ref: "#/definitions/Reference"
                    },
                    {
                      $ref: "#/definitions/Callback"
                    }
                  ]
                }
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        Schema: {
          type: "object",
          properties: {
            title: {
              type: "string"
            },
            multipleOf: {
              type: "number",
              minimum: 0,
              exclusiveMinimum: true
            },
            maximum: {
              type: "number"
            },
            exclusiveMaximum: {
              type: "boolean",
              default: false
            },
            minimum: {
              type: "number"
            },
            exclusiveMinimum: {
              type: "boolean",
              default: false
            },
            maxLength: {
              type: "integer",
              minimum: 0
            },
            minLength: {
              type: "integer",
              minimum: 0,
              default: 0
            },
            pattern: {
              type: "string",
              format: "regex"
            },
            maxItems: {
              type: "integer",
              minimum: 0
            },
            minItems: {
              type: "integer",
              minimum: 0,
              default: 0
            },
            uniqueItems: {
              type: "boolean",
              default: false
            },
            maxProperties: {
              type: "integer",
              minimum: 0
            },
            minProperties: {
              type: "integer",
              minimum: 0,
              default: 0
            },
            required: {
              type: "array",
              items: {
                type: "string"
              },
              minItems: 1,
              uniqueItems: true
            },
            enum: {
              type: "array",
              items: {},
              minItems: 1,
              uniqueItems: false
            },
            type: {
              type: "string",
              enum: [
                "array",
                "boolean",
                "integer",
                "number",
                "object",
                "string"
              ]
            },
            not: {
              oneOf: [
                {
                  $ref: "#/definitions/Schema"
                },
                {
                  $ref: "#/definitions/Reference"
                }
              ]
            },
            allOf: {
              type: "array",
              items: {
                oneOf: [
                  {
                    $ref: "#/definitions/Schema"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            },
            oneOf: {
              type: "array",
              items: {
                oneOf: [
                  {
                    $ref: "#/definitions/Schema"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            },
            anyOf: {
              type: "array",
              items: {
                oneOf: [
                  {
                    $ref: "#/definitions/Schema"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            },
            items: {
              oneOf: [
                {
                  $ref: "#/definitions/Schema"
                },
                {
                  $ref: "#/definitions/Reference"
                }
              ]
            },
            properties: {
              type: "object",
              additionalProperties: {
                oneOf: [
                  {
                    $ref: "#/definitions/Schema"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            },
            additionalProperties: {
              oneOf: [
                {
                  $ref: "#/definitions/Schema"
                },
                {
                  $ref: "#/definitions/Reference"
                },
                {
                  type: "boolean"
                }
              ],
              default: true
            },
            description: {
              type: "string"
            },
            format: {
              type: "string"
            },
            default: {},
            nullable: {
              type: "boolean",
              default: false
            },
            discriminator: {
              $ref: "#/definitions/Discriminator"
            },
            readOnly: {
              type: "boolean",
              default: false
            },
            writeOnly: {
              type: "boolean",
              default: false
            },
            example: {},
            externalDocs: {
              $ref: "#/definitions/ExternalDocumentation"
            },
            deprecated: {
              type: "boolean",
              default: false
            },
            xml: {
              $ref: "#/definitions/XML"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        Discriminator: {
          type: "object",
          required: [
            "propertyName"
          ],
          properties: {
            propertyName: {
              type: "string"
            },
            mapping: {
              type: "object",
              additionalProperties: {
                type: "string"
              }
            }
          }
        },
        XML: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            namespace: {
              type: "string",
              format: "uri"
            },
            prefix: {
              type: "string"
            },
            attribute: {
              type: "boolean",
              default: false
            },
            wrapped: {
              type: "boolean",
              default: false
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        Response: {
          type: "object",
          required: [
            "description"
          ],
          properties: {
            description: {
              type: "string"
            },
            headers: {
              type: "object",
              additionalProperties: {
                oneOf: [
                  {
                    $ref: "#/definitions/Header"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            },
            content: {
              type: "object",
              additionalProperties: {
                $ref: "#/definitions/MediaType"
              }
            },
            links: {
              type: "object",
              additionalProperties: {
                oneOf: [
                  {
                    $ref: "#/definitions/Link"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        MediaType: {
          type: "object",
          properties: {
            schema: {
              oneOf: [
                {
                  $ref: "#/definitions/Schema"
                },
                {
                  $ref: "#/definitions/Reference"
                }
              ]
            },
            example: {},
            examples: {
              type: "object",
              additionalProperties: {
                oneOf: [
                  {
                    $ref: "#/definitions/Example"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            },
            encoding: {
              type: "object",
              additionalProperties: {
                $ref: "#/definitions/Encoding"
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false,
          allOf: [
            {
              $ref: "#/definitions/ExampleXORExamples"
            }
          ]
        },
        Example: {
          type: "object",
          properties: {
            summary: {
              type: "string"
            },
            description: {
              type: "string"
            },
            value: {},
            externalValue: {
              type: "string",
              format: "uri-reference"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        Header: {
          type: "object",
          properties: {
            description: {
              type: "string"
            },
            required: {
              type: "boolean",
              default: false
            },
            deprecated: {
              type: "boolean",
              default: false
            },
            allowEmptyValue: {
              type: "boolean",
              default: false
            },
            style: {
              type: "string",
              enum: [
                "simple"
              ],
              default: "simple"
            },
            explode: {
              type: "boolean"
            },
            allowReserved: {
              type: "boolean",
              default: false
            },
            schema: {
              oneOf: [
                {
                  $ref: "#/definitions/Schema"
                },
                {
                  $ref: "#/definitions/Reference"
                }
              ]
            },
            content: {
              type: "object",
              additionalProperties: {
                $ref: "#/definitions/MediaType"
              },
              minProperties: 1,
              maxProperties: 1
            },
            example: {},
            examples: {
              type: "object",
              additionalProperties: {
                oneOf: [
                  {
                    $ref: "#/definitions/Example"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false,
          allOf: [
            {
              $ref: "#/definitions/ExampleXORExamples"
            },
            {
              $ref: "#/definitions/SchemaXORContent"
            }
          ]
        },
        Paths: {
          type: "object",
          patternProperties: {
            "^\\/": {
              $ref: "#/definitions/PathItem"
            },
            "^x-": {}
          },
          additionalProperties: false
        },
        PathItem: {
          type: "object",
          properties: {
            $ref: {
              type: "string"
            },
            summary: {
              type: "string"
            },
            description: {
              type: "string"
            },
            servers: {
              type: "array",
              items: {
                $ref: "#/definitions/Server"
              }
            },
            parameters: {
              type: "array",
              items: {
                oneOf: [
                  {
                    $ref: "#/definitions/Parameter"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              },
              uniqueItems: true
            }
          },
          patternProperties: {
            "^(get|put|post|delete|options|head|patch|trace)$": {
              $ref: "#/definitions/Operation"
            },
            "^x-": {}
          },
          additionalProperties: false
        },
        Operation: {
          type: "object",
          required: [
            "responses"
          ],
          properties: {
            tags: {
              type: "array",
              items: {
                type: "string"
              }
            },
            summary: {
              type: "string"
            },
            description: {
              type: "string"
            },
            externalDocs: {
              $ref: "#/definitions/ExternalDocumentation"
            },
            operationId: {
              type: "string"
            },
            parameters: {
              type: "array",
              items: {
                oneOf: [
                  {
                    $ref: "#/definitions/Parameter"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              },
              uniqueItems: true
            },
            requestBody: {
              oneOf: [
                {
                  $ref: "#/definitions/RequestBody"
                },
                {
                  $ref: "#/definitions/Reference"
                }
              ]
            },
            responses: {
              $ref: "#/definitions/Responses"
            },
            callbacks: {
              type: "object",
              additionalProperties: {
                oneOf: [
                  {
                    $ref: "#/definitions/Callback"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            },
            deprecated: {
              type: "boolean",
              default: false
            },
            security: {
              type: "array",
              items: {
                $ref: "#/definitions/SecurityRequirement"
              }
            },
            servers: {
              type: "array",
              items: {
                $ref: "#/definitions/Server"
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        Responses: {
          type: "object",
          properties: {
            default: {
              oneOf: [
                {
                  $ref: "#/definitions/Response"
                },
                {
                  $ref: "#/definitions/Reference"
                }
              ]
            }
          },
          patternProperties: {
            "^[1-5](?:\\d{2}|XX)$": {
              oneOf: [
                {
                  $ref: "#/definitions/Response"
                },
                {
                  $ref: "#/definitions/Reference"
                }
              ]
            },
            "^x-": {}
          },
          minProperties: 1,
          additionalProperties: false
        },
        SecurityRequirement: {
          type: "object",
          additionalProperties: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        Tag: {
          type: "object",
          required: [
            "name"
          ],
          properties: {
            name: {
              type: "string"
            },
            description: {
              type: "string"
            },
            externalDocs: {
              $ref: "#/definitions/ExternalDocumentation"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        ExternalDocumentation: {
          type: "object",
          required: [
            "url"
          ],
          properties: {
            description: {
              type: "string"
            },
            url: {
              type: "string",
              format: "uri-reference"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        ExampleXORExamples: {
          description: "Example and examples are mutually exclusive",
          not: {
            required: [
              "example",
              "examples"
            ]
          }
        },
        SchemaXORContent: {
          description: "Schema and content are mutually exclusive, at least one is required",
          not: {
            required: [
              "schema",
              "content"
            ]
          },
          oneOf: [
            {
              required: [
                "schema"
              ]
            },
            {
              required: [
                "content"
              ],
              description: "Some properties are not allowed if content is present",
              allOf: [
                {
                  not: {
                    required: [
                      "style"
                    ]
                  }
                },
                {
                  not: {
                    required: [
                      "explode"
                    ]
                  }
                },
                {
                  not: {
                    required: [
                      "allowReserved"
                    ]
                  }
                },
                {
                  not: {
                    required: [
                      "example"
                    ]
                  }
                },
                {
                  not: {
                    required: [
                      "examples"
                    ]
                  }
                }
              ]
            }
          ]
        },
        Parameter: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            in: {
              type: "string"
            },
            description: {
              type: "string"
            },
            required: {
              type: "boolean",
              default: false
            },
            deprecated: {
              type: "boolean",
              default: false
            },
            allowEmptyValue: {
              type: "boolean",
              default: false
            },
            style: {
              type: "string"
            },
            explode: {
              type: "boolean"
            },
            allowReserved: {
              type: "boolean",
              default: false
            },
            schema: {
              oneOf: [
                {
                  $ref: "#/definitions/Schema"
                },
                {
                  $ref: "#/definitions/Reference"
                }
              ]
            },
            content: {
              type: "object",
              additionalProperties: {
                $ref: "#/definitions/MediaType"
              },
              minProperties: 1,
              maxProperties: 1
            },
            example: {},
            examples: {
              type: "object",
              additionalProperties: {
                oneOf: [
                  {
                    $ref: "#/definitions/Example"
                  },
                  {
                    $ref: "#/definitions/Reference"
                  }
                ]
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false,
          required: [
            "name",
            "in"
          ],
          allOf: [
            {
              $ref: "#/definitions/ExampleXORExamples"
            },
            {
              $ref: "#/definitions/SchemaXORContent"
            },
            {
              $ref: "#/definitions/ParameterLocation"
            }
          ]
        },
        ParameterLocation: {
          description: "Parameter location",
          oneOf: [
            {
              description: "Parameter in path",
              required: [
                "required"
              ],
              properties: {
                in: {
                  enum: [
                    "path"
                  ]
                },
                style: {
                  enum: [
                    "matrix",
                    "label",
                    "simple"
                  ],
                  default: "simple"
                },
                required: {
                  enum: [
                    true
                  ]
                }
              }
            },
            {
              description: "Parameter in query",
              properties: {
                in: {
                  enum: [
                    "query"
                  ]
                },
                style: {
                  enum: [
                    "form",
                    "spaceDelimited",
                    "pipeDelimited",
                    "deepObject"
                  ],
                  default: "form"
                }
              }
            },
            {
              description: "Parameter in header",
              properties: {
                in: {
                  enum: [
                    "header"
                  ]
                },
                style: {
                  enum: [
                    "simple"
                  ],
                  default: "simple"
                }
              }
            },
            {
              description: "Parameter in cookie",
              properties: {
                in: {
                  enum: [
                    "cookie"
                  ]
                },
                style: {
                  enum: [
                    "form"
                  ],
                  default: "form"
                }
              }
            }
          ]
        },
        RequestBody: {
          type: "object",
          required: [
            "content"
          ],
          properties: {
            description: {
              type: "string"
            },
            content: {
              type: "object",
              additionalProperties: {
                $ref: "#/definitions/MediaType"
              }
            },
            required: {
              type: "boolean",
              default: false
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        SecurityScheme: {
          oneOf: [
            {
              $ref: "#/definitions/APIKeySecurityScheme"
            },
            {
              $ref: "#/definitions/HTTPSecurityScheme"
            },
            {
              $ref: "#/definitions/OAuth2SecurityScheme"
            },
            {
              $ref: "#/definitions/OpenIdConnectSecurityScheme"
            }
          ]
        },
        APIKeySecurityScheme: {
          type: "object",
          required: [
            "type",
            "name",
            "in"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "apiKey"
              ]
            },
            name: {
              type: "string"
            },
            in: {
              type: "string",
              enum: [
                "header",
                "query",
                "cookie"
              ]
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        HTTPSecurityScheme: {
          type: "object",
          required: [
            "scheme",
            "type"
          ],
          properties: {
            scheme: {
              type: "string"
            },
            bearerFormat: {
              type: "string"
            },
            description: {
              type: "string"
            },
            type: {
              type: "string",
              enum: [
                "http"
              ]
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false,
          oneOf: [
            {
              description: "Bearer",
              properties: {
                scheme: {
                  enum: [
                    "bearer"
                  ]
                }
              }
            },
            {
              description: "Non Bearer",
              not: {
                required: [
                  "bearerFormat"
                ]
              },
              properties: {
                scheme: {
                  not: {
                    enum: [
                      "bearer"
                    ]
                  }
                }
              }
            }
          ]
        },
        OAuth2SecurityScheme: {
          type: "object",
          required: [
            "type",
            "flows"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "oauth2"
              ]
            },
            flows: {
              $ref: "#/definitions/OAuthFlows"
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        OpenIdConnectSecurityScheme: {
          type: "object",
          required: [
            "type",
            "openIdConnectUrl"
          ],
          properties: {
            type: {
              type: "string",
              enum: [
                "openIdConnect"
              ]
            },
            openIdConnectUrl: {
              type: "string",
              format: "uri-reference"
            },
            description: {
              type: "string"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        OAuthFlows: {
          type: "object",
          properties: {
            implicit: {
              $ref: "#/definitions/ImplicitOAuthFlow"
            },
            password: {
              $ref: "#/definitions/PasswordOAuthFlow"
            },
            clientCredentials: {
              $ref: "#/definitions/ClientCredentialsFlow"
            },
            authorizationCode: {
              $ref: "#/definitions/AuthorizationCodeOAuthFlow"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        ImplicitOAuthFlow: {
          type: "object",
          required: [
            "authorizationUrl",
            "scopes"
          ],
          properties: {
            authorizationUrl: {
              type: "string",
              format: "uri-reference"
            },
            refreshUrl: {
              type: "string",
              format: "uri-reference"
            },
            scopes: {
              type: "object",
              additionalProperties: {
                type: "string"
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        PasswordOAuthFlow: {
          type: "object",
          required: [
            "tokenUrl"
          ],
          properties: {
            tokenUrl: {
              type: "string",
              format: "uri-reference"
            },
            refreshUrl: {
              type: "string",
              format: "uri-reference"
            },
            scopes: {
              type: "object",
              additionalProperties: {
                type: "string"
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        ClientCredentialsFlow: {
          type: "object",
          required: [
            "tokenUrl"
          ],
          properties: {
            tokenUrl: {
              type: "string",
              format: "uri-reference"
            },
            refreshUrl: {
              type: "string",
              format: "uri-reference"
            },
            scopes: {
              type: "object",
              additionalProperties: {
                type: "string"
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        AuthorizationCodeOAuthFlow: {
          type: "object",
          required: [
            "authorizationUrl",
            "tokenUrl"
          ],
          properties: {
            authorizationUrl: {
              type: "string",
              format: "uri-reference"
            },
            tokenUrl: {
              type: "string",
              format: "uri-reference"
            },
            refreshUrl: {
              type: "string",
              format: "uri-reference"
            },
            scopes: {
              type: "object",
              additionalProperties: {
                type: "string"
              }
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false
        },
        Link: {
          type: "object",
          properties: {
            operationId: {
              type: "string"
            },
            operationRef: {
              type: "string",
              format: "uri-reference"
            },
            parameters: {
              type: "object",
              additionalProperties: {}
            },
            requestBody: {},
            description: {
              type: "string"
            },
            server: {
              $ref: "#/definitions/Server"
            }
          },
          patternProperties: {
            "^x-": {}
          },
          additionalProperties: false,
          not: {
            description: "Operation Id and Operation Ref are mutually exclusive",
            required: [
              "operationId",
              "operationRef"
            ]
          }
        },
        Callback: {
          type: "object",
          additionalProperties: {
            $ref: "#/definitions/PathItem"
          },
          patternProperties: {
            "^x-": {}
          }
        },
        Encoding: {
          type: "object",
          properties: {
            contentType: {
              type: "string"
            },
            headers: {
              type: "object",
              additionalProperties: {
                $ref: "#/definitions/Header"
              }
            },
            style: {
              type: "string",
              enum: [
                "form",
                "spaceDelimited",
                "pipeDelimited",
                "deepObject"
              ]
            },
            explode: {
              type: "boolean"
            },
            allowReserved: {
              type: "boolean",
              default: false
            }
          },
          additionalProperties: false
        }
      }
    };
  }
});

// node_modules/@apidevtools/openapi-schemas/schemas/v3.1/schema.json
var require_schema4 = __commonJS({
  "node_modules/@apidevtools/openapi-schemas/schemas/v3.1/schema.json"(exports, module2) {
    module2.exports = {
      $id: "https://spec.openapis.org/oas/3.1/schema/2021-04-15",
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {
        openapi: {
          type: "string",
          pattern: "^3\\.1\\.\\d+(-.+)?$"
        },
        info: {
          $ref: "#/$defs/info"
        },
        jsonSchemaDialect: {
          $ref: "#/$defs/uri",
          default: "https://spec.openapis.org/oas/3.1/dialect/base"
        },
        servers: {
          type: "array",
          items: {
            $ref: "#/$defs/server"
          }
        },
        paths: {
          $ref: "#/$defs/paths"
        },
        webhooks: {
          type: "object",
          additionalProperties: {
            $ref: "#/$defs/path-item-or-reference"
          }
        },
        components: {
          $ref: "#/$defs/components"
        },
        security: {
          type: "array",
          items: {
            $ref: "#/$defs/security-requirement"
          }
        },
        tags: {
          type: "array",
          items: {
            $ref: "#/$defs/tag"
          }
        },
        externalDocs: {
          $ref: "#/$defs/external-documentation"
        }
      },
      required: [
        "openapi",
        "info"
      ],
      anyOf: [
        {
          required: [
            "paths"
          ]
        },
        {
          required: [
            "components"
          ]
        },
        {
          required: [
            "webhooks"
          ]
        }
      ],
      $ref: "#/$defs/specification-extensions",
      unevaluatedProperties: false,
      $defs: {
        info: {
          type: "object",
          properties: {
            title: {
              type: "string"
            },
            summary: {
              type: "string"
            },
            description: {
              type: "string"
            },
            termsOfService: {
              type: "string"
            },
            contact: {
              $ref: "#/$defs/contact"
            },
            license: {
              $ref: "#/$defs/license"
            },
            version: {
              type: "string"
            }
          },
          required: [
            "title",
            "version"
          ],
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        contact: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            url: {
              type: "string"
            },
            email: {
              type: "string"
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        license: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            identifier: {
              type: "string"
            },
            url: {
              $ref: "#/$defs/uri"
            }
          },
          required: [
            "name"
          ],
          oneOf: [
            {
              required: [
                "identifier"
              ]
            },
            {
              required: [
                "url"
              ]
            }
          ],
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        server: {
          type: "object",
          properties: {
            url: {
              $ref: "#/$defs/uri"
            },
            description: {
              type: "string"
            },
            variables: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/server-variable"
              }
            }
          },
          required: [
            "url"
          ],
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "server-variable": {
          type: "object",
          properties: {
            enum: {
              type: "array",
              items: {
                type: "string"
              },
              minItems: 1
            },
            default: {
              type: "string"
            },
            descriptions: {
              type: "string"
            }
          },
          required: [
            "default"
          ],
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        components: {
          type: "object",
          properties: {
            schemas: {
              type: "object",
              additionalProperties: {
                $dynamicRef: "#meta"
              }
            },
            responses: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/response-or-reference"
              }
            },
            parameters: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/parameter-or-reference"
              }
            },
            examples: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/example-or-reference"
              }
            },
            requestBodies: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/request-body-or-reference"
              }
            },
            headers: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/header-or-reference"
              }
            },
            securitySchemes: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/security-scheme-or-reference"
              }
            },
            links: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/link-or-reference"
              }
            },
            callbacks: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/callbacks-or-reference"
              }
            },
            pathItems: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/path-item-or-reference"
              }
            }
          },
          patternProperties: {
            "^(schemas|responses|parameters|examples|requestBodies|headers|securitySchemes|links|callbacks|pathItems)$": {
              $comment: "Enumerating all of the property names in the regex above is necessary for unevaluatedProperties to work as expected",
              propertyNames: {
                pattern: "^[a-zA-Z0-9._-]+$"
              }
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        paths: {
          type: "object",
          patternProperties: {
            "^/": {
              $ref: "#/$defs/path-item"
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "path-item": {
          type: "object",
          properties: {
            summary: {
              type: "string"
            },
            description: {
              type: "string"
            },
            servers: {
              type: "array",
              items: {
                $ref: "#/$defs/server"
              }
            },
            parameters: {
              type: "array",
              items: {
                $ref: "#/$defs/parameter-or-reference"
              }
            }
          },
          patternProperties: {
            "^(get|put|post|delete|options|head|patch|trace)$": {
              $ref: "#/$defs/operation"
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "path-item-or-reference": {
          if: {
            required: [
              "$ref"
            ]
          },
          then: {
            $ref: "#/$defs/reference"
          },
          else: {
            $ref: "#/$defs/path-item"
          }
        },
        operation: {
          type: "object",
          properties: {
            tags: {
              type: "array",
              items: {
                type: "string"
              }
            },
            summary: {
              type: "string"
            },
            description: {
              type: "string"
            },
            externalDocs: {
              $ref: "#/$defs/external-documentation"
            },
            operationId: {
              type: "string"
            },
            parameters: {
              type: "array",
              items: {
                $ref: "#/$defs/parameter-or-reference"
              }
            },
            requestBody: {
              $ref: "#/$defs/request-body-or-reference"
            },
            responses: {
              $ref: "#/$defs/responses"
            },
            callbacks: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/callbacks-or-reference"
              }
            },
            deprecated: {
              default: false,
              type: "boolean"
            },
            security: {
              type: "array",
              items: {
                $ref: "#/$defs/security-requirement"
              }
            },
            servers: {
              type: "array",
              items: {
                $ref: "#/$defs/server"
              }
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "external-documentation": {
          type: "object",
          properties: {
            description: {
              type: "string"
            },
            url: {
              $ref: "#/$defs/uri"
            }
          },
          required: [
            "url"
          ],
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        parameter: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            in: {
              enum: [
                "query",
                "header",
                "path",
                "cookie"
              ]
            },
            description: {
              type: "string"
            },
            required: {
              default: false,
              type: "boolean"
            },
            deprecated: {
              default: false,
              type: "boolean"
            },
            allowEmptyValue: {
              default: false,
              type: "boolean"
            },
            schema: {
              $dynamicRef: "#meta"
            },
            content: {
              $ref: "#/$defs/content"
            }
          },
          required: [
            "in"
          ],
          oneOf: [
            {
              required: [
                "schema"
              ]
            },
            {
              required: [
                "content"
              ]
            }
          ],
          dependentSchemas: {
            schema: {
              properties: {
                style: {
                  type: "string"
                },
                explode: {
                  type: "boolean"
                },
                allowReserved: {
                  default: false,
                  type: "boolean"
                }
              },
              allOf: [
                {
                  $ref: "#/$defs/examples"
                },
                {
                  $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-path"
                },
                {
                  $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-header"
                },
                {
                  $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-query"
                },
                {
                  $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-cookie"
                },
                {
                  $ref: "#/$defs/parameter/dependentSchemas/schema/$defs/styles-for-form"
                }
              ],
              $defs: {
                "styles-for-path": {
                  if: {
                    properties: {
                      in: {
                        const: "path"
                      }
                    },
                    required: [
                      "in"
                    ]
                  },
                  then: {
                    properties: {
                      style: {
                        default: "simple",
                        enum: [
                          "matrix",
                          "label",
                          "simple"
                        ]
                      },
                      required: {
                        const: true
                      }
                    },
                    required: [
                      "required"
                    ]
                  }
                },
                "styles-for-header": {
                  if: {
                    properties: {
                      in: {
                        const: "header"
                      }
                    },
                    required: [
                      "in"
                    ]
                  },
                  then: {
                    properties: {
                      style: {
                        default: "simple",
                        enum: [
                          "simple"
                        ]
                      }
                    }
                  }
                },
                "styles-for-query": {
                  if: {
                    properties: {
                      in: {
                        const: "query"
                      }
                    },
                    required: [
                      "in"
                    ]
                  },
                  then: {
                    properties: {
                      style: {
                        default: "form",
                        enum: [
                          "form",
                          "spaceDelimited",
                          "pipeDelimited",
                          "deepObject"
                        ]
                      }
                    }
                  }
                },
                "styles-for-cookie": {
                  if: {
                    properties: {
                      in: {
                        const: "cookie"
                      }
                    },
                    required: [
                      "in"
                    ]
                  },
                  then: {
                    properties: {
                      style: {
                        default: "form",
                        enum: [
                          "form"
                        ]
                      }
                    }
                  }
                },
                "styles-for-form": {
                  if: {
                    properties: {
                      style: {
                        const: "form"
                      }
                    },
                    required: [
                      "style"
                    ]
                  },
                  then: {
                    properties: {
                      explode: {
                        default: true
                      }
                    }
                  },
                  else: {
                    properties: {
                      explode: {
                        default: false
                      }
                    }
                  }
                }
              }
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "parameter-or-reference": {
          if: {
            required: [
              "$ref"
            ]
          },
          then: {
            $ref: "#/$defs/reference"
          },
          else: {
            $ref: "#/$defs/parameter"
          }
        },
        "request-body": {
          type: "object",
          properties: {
            description: {
              type: "string"
            },
            content: {
              $ref: "#/$defs/content"
            },
            required: {
              default: false,
              type: "boolean"
            }
          },
          required: [
            "content"
          ],
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "request-body-or-reference": {
          if: {
            required: [
              "$ref"
            ]
          },
          then: {
            $ref: "#/$defs/reference"
          },
          else: {
            $ref: "#/$defs/request-body"
          }
        },
        content: {
          type: "object",
          additionalProperties: {
            $ref: "#/$defs/media-type"
          },
          propertyNames: {
            format: "media-range"
          }
        },
        "media-type": {
          type: "object",
          properties: {
            schema: {
              $dynamicRef: "#meta"
            },
            encoding: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/encoding"
              }
            }
          },
          allOf: [
            {
              $ref: "#/$defs/specification-extensions"
            },
            {
              $ref: "#/$defs/examples"
            }
          ],
          unevaluatedProperties: false
        },
        encoding: {
          type: "object",
          properties: {
            contentType: {
              type: "string",
              format: "media-range"
            },
            headers: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/header-or-reference"
              }
            },
            style: {
              default: "form",
              enum: [
                "form",
                "spaceDelimited",
                "pipeDelimited",
                "deepObject"
              ]
            },
            explode: {
              type: "boolean"
            },
            allowReserved: {
              default: false,
              type: "boolean"
            }
          },
          allOf: [
            {
              $ref: "#/$defs/specification-extensions"
            },
            {
              $ref: "#/$defs/encoding/$defs/explode-default"
            }
          ],
          unevaluatedProperties: false,
          $defs: {
            "explode-default": {
              if: {
                properties: {
                  style: {
                    const: "form"
                  }
                },
                required: [
                  "style"
                ]
              },
              then: {
                properties: {
                  explode: {
                    default: true
                  }
                }
              },
              else: {
                properties: {
                  explode: {
                    default: false
                  }
                }
              }
            }
          }
        },
        responses: {
          type: "object",
          properties: {
            default: {
              $ref: "#/$defs/response-or-reference"
            }
          },
          patternProperties: {
            "^[1-5][0-9X]{2}$": {
              $ref: "#/$defs/response-or-reference"
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        response: {
          type: "object",
          properties: {
            description: {
              type: "string"
            },
            headers: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/header-or-reference"
              }
            },
            content: {
              $ref: "#/$defs/content"
            },
            links: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/link-or-reference"
              }
            }
          },
          required: [
            "description"
          ],
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "response-or-reference": {
          if: {
            required: [
              "$ref"
            ]
          },
          then: {
            $ref: "#/$defs/reference"
          },
          else: {
            $ref: "#/$defs/response"
          }
        },
        callbacks: {
          type: "object",
          $ref: "#/$defs/specification-extensions",
          additionalProperties: {
            $ref: "#/$defs/path-item-or-reference"
          }
        },
        "callbacks-or-reference": {
          if: {
            required: [
              "$ref"
            ]
          },
          then: {
            $ref: "#/$defs/reference"
          },
          else: {
            $ref: "#/$defs/callbacks"
          }
        },
        example: {
          type: "object",
          properties: {
            summary: {
              type: "string"
            },
            description: {
              type: "string"
            },
            value: true,
            externalValue: {
              $ref: "#/$defs/uri"
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "example-or-reference": {
          if: {
            required: [
              "$ref"
            ]
          },
          then: {
            $ref: "#/$defs/reference"
          },
          else: {
            $ref: "#/$defs/example"
          }
        },
        link: {
          type: "object",
          properties: {
            operationRef: {
              $ref: "#/$defs/uri"
            },
            operationId: true,
            parameters: {
              $ref: "#/$defs/map-of-strings"
            },
            requestBody: true,
            description: {
              type: "string"
            },
            body: {
              $ref: "#/$defs/server"
            }
          },
          oneOf: [
            {
              required: [
                "operationRef"
              ]
            },
            {
              required: [
                "operationId"
              ]
            }
          ],
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "link-or-reference": {
          if: {
            required: [
              "$ref"
            ]
          },
          then: {
            $ref: "#/$defs/reference"
          },
          else: {
            $ref: "#/$defs/link"
          }
        },
        header: {
          type: "object",
          properties: {
            description: {
              type: "string"
            },
            required: {
              default: false,
              type: "boolean"
            },
            deprecated: {
              default: false,
              type: "boolean"
            },
            allowEmptyValue: {
              default: false,
              type: "boolean"
            }
          },
          dependentSchemas: {
            schema: {
              properties: {
                style: {
                  default: "simple",
                  enum: [
                    "simple"
                  ]
                },
                explode: {
                  default: false,
                  type: "boolean"
                },
                allowReserved: {
                  default: false,
                  type: "boolean"
                },
                schema: {
                  $dynamicRef: "#meta"
                }
              },
              $ref: "#/$defs/examples"
            },
            content: {
              properties: {
                content: {
                  $ref: "#/$defs/content"
                }
              }
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        "header-or-reference": {
          if: {
            required: [
              "$ref"
            ]
          },
          then: {
            $ref: "#/$defs/reference"
          },
          else: {
            $ref: "#/$defs/header"
          }
        },
        tag: {
          type: "object",
          properties: {
            name: {
              type: "string"
            },
            description: {
              type: "string"
            },
            externalDocs: {
              $ref: "#/$defs/external-documentation"
            }
          },
          required: [
            "name"
          ],
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false
        },
        reference: {
          type: "object",
          properties: {
            $ref: {
              $ref: "#/$defs/uri"
            },
            summary: {
              type: "string"
            },
            description: {
              type: "string"
            }
          },
          unevaluatedProperties: false
        },
        schema: {
          $dynamicAnchor: "meta",
          type: [
            "object",
            "boolean"
          ]
        },
        "security-scheme": {
          type: "object",
          properties: {
            type: {
              enum: [
                "apiKey",
                "http",
                "mutualTLS",
                "oauth2",
                "openIdConnect"
              ]
            },
            description: {
              type: "string"
            }
          },
          required: [
            "type"
          ],
          allOf: [
            {
              $ref: "#/$defs/specification-extensions"
            },
            {
              $ref: "#/$defs/security-scheme/$defs/type-apikey"
            },
            {
              $ref: "#/$defs/security-scheme/$defs/type-http"
            },
            {
              $ref: "#/$defs/security-scheme/$defs/type-http-bearer"
            },
            {
              $ref: "#/$defs/security-scheme/$defs/type-oauth2"
            },
            {
              $ref: "#/$defs/security-scheme/$defs/type-oidc"
            }
          ],
          unevaluatedProperties: false,
          $defs: {
            "type-apikey": {
              if: {
                properties: {
                  type: {
                    const: "apiKey"
                  }
                },
                required: [
                  "type"
                ]
              },
              then: {
                properties: {
                  name: {
                    type: "string"
                  },
                  in: {
                    enum: [
                      "query",
                      "header",
                      "cookie"
                    ]
                  }
                },
                required: [
                  "name",
                  "in"
                ]
              }
            },
            "type-http": {
              if: {
                properties: {
                  type: {
                    const: "http"
                  }
                },
                required: [
                  "type"
                ]
              },
              then: {
                properties: {
                  scheme: {
                    type: "string"
                  }
                },
                required: [
                  "scheme"
                ]
              }
            },
            "type-http-bearer": {
              if: {
                properties: {
                  type: {
                    const: "http"
                  },
                  scheme: {
                    const: "bearer"
                  }
                },
                required: [
                  "type",
                  "scheme"
                ]
              },
              then: {
                properties: {
                  bearerFormat: {
                    type: "string"
                  }
                },
                required: [
                  "scheme"
                ]
              }
            },
            "type-oauth2": {
              if: {
                properties: {
                  type: {
                    const: "oauth2"
                  }
                },
                required: [
                  "type"
                ]
              },
              then: {
                properties: {
                  flows: {
                    $ref: "#/$defs/oauth-flows"
                  }
                },
                required: [
                  "flows"
                ]
              }
            },
            "type-oidc": {
              if: {
                properties: {
                  type: {
                    const: "openIdConnect"
                  }
                },
                required: [
                  "type"
                ]
              },
              then: {
                properties: {
                  openIdConnectUrl: {
                    $ref: "#/$defs/uri"
                  }
                },
                required: [
                  "openIdConnectUrl"
                ]
              }
            }
          }
        },
        "security-scheme-or-reference": {
          if: {
            required: [
              "$ref"
            ]
          },
          then: {
            $ref: "#/$defs/reference"
          },
          else: {
            $ref: "#/$defs/security-scheme"
          }
        },
        "oauth-flows": {
          type: "object",
          properties: {
            implicit: {
              $ref: "#/$defs/oauth-flows/$defs/implicit"
            },
            password: {
              $ref: "#/$defs/oauth-flows/$defs/password"
            },
            clientCredentials: {
              $ref: "#/$defs/oauth-flows/$defs/client-credentials"
            },
            authorizationCode: {
              $ref: "#/$defs/oauth-flows/$defs/authorization-code"
            }
          },
          $ref: "#/$defs/specification-extensions",
          unevaluatedProperties: false,
          $defs: {
            implicit: {
              type: "object",
              properties: {
                authorizationUrl: {
                  type: "string"
                },
                refreshUrl: {
                  type: "string"
                },
                scopes: {
                  $ref: "#/$defs/map-of-strings"
                }
              },
              required: [
                "authorizationUrl",
                "scopes"
              ],
              $ref: "#/$defs/specification-extensions",
              unevaluatedProperties: false
            },
            password: {
              type: "object",
              properties: {
                tokenUrl: {
                  type: "string"
                },
                refreshUrl: {
                  type: "string"
                },
                scopes: {
                  $ref: "#/$defs/map-of-strings"
                }
              },
              required: [
                "tokenUrl",
                "scopes"
              ],
              $ref: "#/$defs/specification-extensions",
              unevaluatedProperties: false
            },
            "client-credentials": {
              type: "object",
              properties: {
                tokenUrl: {
                  type: "string"
                },
                refreshUrl: {
                  type: "string"
                },
                scopes: {
                  $ref: "#/$defs/map-of-strings"
                }
              },
              required: [
                "tokenUrl",
                "scopes"
              ],
              $ref: "#/$defs/specification-extensions",
              unevaluatedProperties: false
            },
            "authorization-code": {
              type: "object",
              properties: {
                authorizationUrl: {
                  type: "string"
                },
                tokenUrl: {
                  type: "string"
                },
                refreshUrl: {
                  type: "string"
                },
                scopes: {
                  $ref: "#/$defs/map-of-strings"
                }
              },
              required: [
                "authorizationUrl",
                "tokenUrl",
                "scopes"
              ],
              $ref: "#/$defs/specification-extensions",
              unevaluatedProperties: false
            }
          }
        },
        "security-requirement": {
          type: "object",
          additionalProperties: {
            type: "array",
            items: {
              type: "string"
            }
          }
        },
        "specification-extensions": {
          patternProperties: {
            "^x-": true
          }
        },
        examples: {
          properties: {
            example: true,
            examples: {
              type: "object",
              additionalProperties: {
                $ref: "#/$defs/example-or-reference"
              }
            }
          }
        },
        uri: {
          type: "string",
          format: "uri"
        },
        "map-of-strings": {
          type: "object",
          additionalProperties: {
            type: "string"
          }
        }
      }
    };
  }
});

// node_modules/@apidevtools/openapi-schemas/lib/index.js
var require_lib = __commonJS({
  "node_modules/@apidevtools/openapi-schemas/lib/index.js"(exports, module2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.openapi = exports.openapiV31 = exports.openapiV3 = exports.openapiV2 = exports.openapiV1 = void 0;
    exports.openapiV1 = require_apiDeclaration();
    exports.openapiV2 = require_schema2();
    exports.openapiV3 = require_schema3();
    exports.openapiV31 = require_schema4();
    exports.openapi = {
      v1: exports.openapiV1,
      v2: exports.openapiV2,
      v3: exports.openapiV3,
      v31: exports.openapiV31
    };
    exports.default = exports.openapi;
    if (typeof module2 === "object" && typeof module2.exports === "object") {
      module2.exports = Object.assign(module2.exports.default, module2.exports);
    }
  }
});

// node_modules/@apidevtools/swagger-parser/lib/validators/schema.js
var require_schema5 = __commonJS({
  "node_modules/@apidevtools/swagger-parser/lib/validators/schema.js"(exports, module2) {
    "use strict";
    var util = require_util();
    var { ono } = require_cjs();
    var ZSchema = require_ZSchema();
    var { openapi } = require_lib();
    module2.exports = validateSchema;
    var zSchema = initializeZSchema();
    function validateSchema(api) {
      let schema = api.swagger ? openapi.v2 : openapi.v3;
      let isValid = zSchema.validate(api, schema);
      if (!isValid) {
        let err = zSchema.getLastError();
        let message = "Swagger schema validation failed. \n" + formatZSchemaError(err.details);
        throw ono.syntax(err, { details: err.details }, message);
      }
    }
    function initializeZSchema() {
      delete openapi.v2.id;
      delete openapi.v3.id;
      ZSchema.registerFormat("uri-reference", (value) => value.trim().length > 0);
      return new ZSchema({
        breakOnFirstError: true,
        noExtraKeywords: true,
        ignoreUnknownFormats: false,
        reportPathAsArray: true
      });
    }
    function formatZSchemaError(errors, indent) {
      indent = indent || "  ";
      let message = "";
      for (let error of errors) {
        message += util.format(`${indent}${error.message} at #/${error.path.join("/")}
`);
        if (error.inner) {
          message += formatZSchemaError(error.inner, indent + "  ");
        }
      }
      return message;
    }
  }
});

// node_modules/@apidevtools/swagger-methods/lib/index.js
var require_lib2 = __commonJS({
  "node_modules/@apidevtools/swagger-methods/lib/index.js"(exports, module2) {
    "use strict";
    module2.exports = [
      "get",
      "put",
      "post",
      "delete",
      "options",
      "head",
      "patch"
    ];
  }
});

// node_modules/@apidevtools/swagger-parser/lib/validators/spec.js
var require_spec = __commonJS({
  "node_modules/@apidevtools/swagger-parser/lib/validators/spec.js"(exports, module2) {
    "use strict";
    var util = require_util();
    var { ono } = require_cjs();
    var swaggerMethods = require_lib2();
    var primitiveTypes = ["array", "boolean", "integer", "number", "string"];
    var schemaTypes = ["array", "boolean", "integer", "number", "string", "object", "null", void 0];
    module2.exports = validateSpec;
    function validateSpec(api) {
      if (api.openapi) {
        return;
      }
      let paths = Object.keys(api.paths || {});
      let operationIds = [];
      for (let pathName of paths) {
        let path2 = api.paths[pathName];
        let pathId = "/paths" + pathName;
        if (path2 && pathName.indexOf("/") === 0) {
          validatePath(api, path2, pathId, operationIds);
        }
      }
      let definitions = Object.keys(api.definitions || {});
      for (let definitionName of definitions) {
        let definition = api.definitions[definitionName];
        let definitionId = "/definitions/" + definitionName;
        validateRequiredPropertiesExist(definition, definitionId);
      }
    }
    function validatePath(api, path2, pathId, operationIds) {
      for (let operationName of swaggerMethods) {
        let operation = path2[operationName];
        let operationId = pathId + "/" + operationName;
        if (operation) {
          let declaredOperationId = operation.operationId;
          if (declaredOperationId) {
            if (operationIds.indexOf(declaredOperationId) === -1) {
              operationIds.push(declaredOperationId);
            } else {
              throw ono.syntax(`Validation failed. Duplicate operation id '${declaredOperationId}'`);
            }
          }
          validateParameters(api, path2, pathId, operation, operationId);
          let responses = Object.keys(operation.responses || {});
          for (let responseName of responses) {
            let response = operation.responses[responseName];
            let responseId = operationId + "/responses/" + responseName;
            validateResponse(responseName, response || {}, responseId);
          }
        }
      }
    }
    function validateParameters(api, path2, pathId, operation, operationId) {
      let pathParams = path2.parameters || [];
      let operationParams = operation.parameters || [];
      try {
        checkForDuplicates(pathParams);
      } catch (e) {
        throw ono.syntax(e, `Validation failed. ${pathId} has duplicate parameters`);
      }
      try {
        checkForDuplicates(operationParams);
      } catch (e) {
        throw ono.syntax(e, `Validation failed. ${operationId} has duplicate parameters`);
      }
      let params = pathParams.reduce((combinedParams, value) => {
        let duplicate = combinedParams.some((param) => {
          return param.in === value.in && param.name === value.name;
        });
        if (!duplicate) {
          combinedParams.push(value);
        }
        return combinedParams;
      }, operationParams.slice());
      validateBodyParameters(params, operationId);
      validatePathParameters(params, pathId, operationId);
      validateParameterTypes(params, api, operation, operationId);
    }
    function validateBodyParameters(params, operationId) {
      let bodyParams = params.filter((param) => {
        return param.in === "body";
      });
      let formParams = params.filter((param) => {
        return param.in === "formData";
      });
      if (bodyParams.length > 1) {
        throw ono.syntax(`Validation failed. ${operationId} has ${bodyParams.length} body parameters. Only one is allowed.`);
      } else if (bodyParams.length > 0 && formParams.length > 0) {
        throw ono.syntax(`Validation failed. ${operationId} has body parameters and formData parameters. Only one or the other is allowed.`);
      }
    }
    function validatePathParameters(params, pathId, operationId) {
      let placeholders = pathId.match(util.swaggerParamRegExp) || [];
      for (let i = 0; i < placeholders.length; i++) {
        for (let j = i + 1; j < placeholders.length; j++) {
          if (placeholders[i] === placeholders[j]) {
            throw ono.syntax(`Validation failed. ${operationId} has multiple path placeholders named ${placeholders[i]}`);
          }
        }
      }
      params = params.filter((param) => {
        return param.in === "path";
      });
      for (let param of params) {
        if (param.required !== true) {
          throw ono.syntax(`Validation failed. Path parameters cannot be optional. Set required=true for the "${param.name}" parameter at ${operationId}`);
        }
        let match = placeholders.indexOf("{" + param.name + "}");
        if (match === -1) {
          throw ono.syntax(`Validation failed. ${operationId} has a path parameter named "${param.name}", but there is no corresponding {${param.name}} in the path string`);
        }
        placeholders.splice(match, 1);
      }
      if (placeholders.length > 0) {
        throw ono.syntax(`Validation failed. ${operationId} is missing path parameter(s) for ${placeholders}`);
      }
    }
    function validateParameterTypes(params, api, operation, operationId) {
      for (let param of params) {
        let parameterId = operationId + "/parameters/" + param.name;
        let schema, validTypes;
        switch (param.in) {
          case "body":
            schema = param.schema;
            validTypes = schemaTypes;
            break;
          case "formData":
            schema = param;
            validTypes = primitiveTypes.concat("file");
            break;
          default:
            schema = param;
            validTypes = primitiveTypes;
        }
        validateSchema(schema, parameterId, validTypes);
        validateRequiredPropertiesExist(schema, parameterId);
        if (schema.type === "file") {
          let formData = /multipart\/(.*\+)?form-data/;
          let urlEncoded = /application\/(.*\+)?x-www-form-urlencoded/;
          let consumes = operation.consumes || api.consumes || [];
          let hasValidMimeType = consumes.some((consume) => {
            return formData.test(consume) || urlEncoded.test(consume);
          });
          if (!hasValidMimeType) {
            throw ono.syntax(`Validation failed. ${operationId} has a file parameter, so it must consume multipart/form-data or application/x-www-form-urlencoded`);
          }
        }
      }
    }
    function checkForDuplicates(params) {
      for (let i = 0; i < params.length - 1; i++) {
        let outer = params[i];
        for (let j = i + 1; j < params.length; j++) {
          let inner = params[j];
          if (outer.name === inner.name && outer.in === inner.in) {
            throw ono.syntax(`Validation failed. Found multiple ${outer.in} parameters named "${outer.name}"`);
          }
        }
      }
    }
    function validateResponse(code, response, responseId) {
      if (code !== "default" && (code < 100 || code > 599)) {
        throw ono.syntax(`Validation failed. ${responseId} has an invalid response code (${code})`);
      }
      let headers = Object.keys(response.headers || {});
      for (let headerName of headers) {
        let header = response.headers[headerName];
        let headerId = responseId + "/headers/" + headerName;
        validateSchema(header, headerId, primitiveTypes);
      }
      if (response.schema) {
        let validTypes = schemaTypes.concat("file");
        if (validTypes.indexOf(response.schema.type) === -1) {
          throw ono.syntax(`Validation failed. ${responseId} has an invalid response schema type (${response.schema.type})`);
        } else {
          validateSchema(response.schema, responseId + "/schema", validTypes);
        }
      }
    }
    function validateSchema(schema, schemaId, validTypes) {
      if (validTypes.indexOf(schema.type) === -1) {
        throw ono.syntax(`Validation failed. ${schemaId} has an invalid type (${schema.type})`);
      }
      if (schema.type === "array" && !schema.items) {
        throw ono.syntax(`Validation failed. ${schemaId} is an array, so it must include an "items" schema`);
      }
    }
    function validateRequiredPropertiesExist(schema, schemaId) {
      function collectProperties(schemaObj, props) {
        if (schemaObj.properties) {
          for (let property in schemaObj.properties) {
            if (schemaObj.properties.hasOwnProperty(property)) {
              props[property] = schemaObj.properties[property];
            }
          }
        }
        if (schemaObj.allOf) {
          for (let parent of schemaObj.allOf) {
            collectProperties(parent, props);
          }
        }
      }
      if (schema.required && Array.isArray(schema.required)) {
        let props = {};
        collectProperties(schema, props);
        for (let requiredProperty of schema.required) {
          if (!props[requiredProperty]) {
            throw ono.syntax(`Validation failed. Property '${requiredProperty}' listed as required but does not exist in '${schemaId}'`);
          }
        }
      }
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/util/url.js
var require_url = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/util/url.js"(exports, module2) {
    "use strict";
    var isWindows = /^win/.test(process.platform);
    var forwardSlashPattern = /\//g;
    var protocolPattern = /^(\w{2,}):\/\//i;
    var url = module2.exports;
    var jsonPointerSlash = /~1/g;
    var jsonPointerTilde = /~0/g;
    var urlEncodePatterns = [
      /\?/g,
      "%3F",
      /\#/g,
      "%23"
    ];
    var urlDecodePatterns = [
      /\%23/g,
      "#",
      /\%24/g,
      "$",
      /\%26/g,
      "&",
      /\%2C/g,
      ",",
      /\%40/g,
      "@"
    ];
    exports.parse = require("url").parse;
    exports.resolve = require("url").resolve;
    exports.cwd = function cwd() {
      if (process.browser) {
        return location.href;
      }
      let path2 = process.cwd();
      let lastChar = path2.slice(-1);
      if (lastChar === "/" || lastChar === "\\") {
        return path2;
      } else {
        return path2 + "/";
      }
    };
    exports.getProtocol = function getProtocol(path2) {
      let match = protocolPattern.exec(path2);
      if (match) {
        return match[1].toLowerCase();
      }
    };
    exports.getExtension = function getExtension(path2) {
      let lastDot = path2.lastIndexOf(".");
      if (lastDot >= 0) {
        return url.stripQuery(path2.substr(lastDot).toLowerCase());
      }
      return "";
    };
    exports.stripQuery = function stripQuery(path2) {
      let queryIndex = path2.indexOf("?");
      if (queryIndex >= 0) {
        path2 = path2.substr(0, queryIndex);
      }
      return path2;
    };
    exports.getHash = function getHash(path2) {
      let hashIndex = path2.indexOf("#");
      if (hashIndex >= 0) {
        return path2.substr(hashIndex);
      }
      return "#";
    };
    exports.stripHash = function stripHash(path2) {
      let hashIndex = path2.indexOf("#");
      if (hashIndex >= 0) {
        path2 = path2.substr(0, hashIndex);
      }
      return path2;
    };
    exports.isHttp = function isHttp(path2) {
      let protocol = url.getProtocol(path2);
      if (protocol === "http" || protocol === "https") {
        return true;
      } else if (protocol === void 0) {
        return process.browser;
      } else {
        return false;
      }
    };
    exports.isFileSystemPath = function isFileSystemPath(path2) {
      if (process.browser) {
        return false;
      }
      let protocol = url.getProtocol(path2);
      return protocol === void 0 || protocol === "file";
    };
    exports.fromFileSystemPath = function fromFileSystemPath(path2) {
      if (isWindows) {
        path2 = path2.replace(/\\/g, "/");
      }
      path2 = encodeURI(path2);
      for (let i = 0; i < urlEncodePatterns.length; i += 2) {
        path2 = path2.replace(urlEncodePatterns[i], urlEncodePatterns[i + 1]);
      }
      return path2;
    };
    exports.toFileSystemPath = function toFileSystemPath(path2, keepFileProtocol) {
      path2 = decodeURI(path2);
      for (let i = 0; i < urlDecodePatterns.length; i += 2) {
        path2 = path2.replace(urlDecodePatterns[i], urlDecodePatterns[i + 1]);
      }
      let isFileUrl = path2.substr(0, 7).toLowerCase() === "file://";
      if (isFileUrl) {
        path2 = path2[7] === "/" ? path2.substr(8) : path2.substr(7);
        if (isWindows && path2[1] === "/") {
          path2 = path2[0] + ":" + path2.substr(1);
        }
        if (keepFileProtocol) {
          path2 = "file:///" + path2;
        } else {
          isFileUrl = false;
          path2 = isWindows ? path2 : "/" + path2;
        }
      }
      if (isWindows && !isFileUrl) {
        path2 = path2.replace(forwardSlashPattern, "\\");
        if (path2.substr(1, 2) === ":\\") {
          path2 = path2[0].toUpperCase() + path2.substr(1);
        }
      }
      return path2;
    };
    exports.safePointerToPath = function safePointerToPath(pointer) {
      if (pointer.length <= 1 || pointer[0] !== "#" || pointer[1] !== "/") {
        return [];
      }
      return pointer.slice(2).split("/").map((value) => {
        return decodeURIComponent(value).replace(jsonPointerSlash, "/").replace(jsonPointerTilde, "~");
      });
    };
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/util/errors.js
var require_errors = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/util/errors.js"(exports) {
    "use strict";
    var { Ono } = require_cjs();
    var { stripHash, toFileSystemPath } = require_url();
    var JSONParserError = exports.JSONParserError = class JSONParserError extends Error {
      constructor(message, source) {
        super();
        this.code = "EUNKNOWN";
        this.message = message;
        this.source = source;
        this.path = null;
        Ono.extend(this);
      }
      get footprint() {
        return `${this.path}+${this.source}+${this.code}+${this.message}`;
      }
    };
    setErrorName(JSONParserError);
    var JSONParserErrorGroup = exports.JSONParserErrorGroup = class JSONParserErrorGroup2 extends Error {
      constructor(parser) {
        super();
        this.files = parser;
        this.message = `${this.errors.length} error${this.errors.length > 1 ? "s" : ""} occurred while reading '${toFileSystemPath(parser.$refs._root$Ref.path)}'`;
        Ono.extend(this);
      }
      static getParserErrors(parser) {
        const errors = [];
        for (const $ref of Object.values(parser.$refs._$refs)) {
          if ($ref.errors) {
            errors.push(...$ref.errors);
          }
        }
        return errors;
      }
      get errors() {
        return JSONParserErrorGroup2.getParserErrors(this.files);
      }
    };
    setErrorName(JSONParserErrorGroup);
    var ParserError = exports.ParserError = class ParserError extends JSONParserError {
      constructor(message, source) {
        super(`Error parsing ${source}: ${message}`, source);
        this.code = "EPARSER";
      }
    };
    setErrorName(ParserError);
    var UnmatchedParserError = exports.UnmatchedParserError = class UnmatchedParserError extends JSONParserError {
      constructor(source) {
        super(`Could not find parser for "${source}"`, source);
        this.code = "EUNMATCHEDPARSER";
      }
    };
    setErrorName(UnmatchedParserError);
    var ResolverError = exports.ResolverError = class ResolverError extends JSONParserError {
      constructor(ex, source) {
        super(ex.message || `Error reading file "${source}"`, source);
        this.code = "ERESOLVER";
        if ("code" in ex) {
          this.ioErrorCode = String(ex.code);
        }
      }
    };
    setErrorName(ResolverError);
    var UnmatchedResolverError = exports.UnmatchedResolverError = class UnmatchedResolverError extends JSONParserError {
      constructor(source) {
        super(`Could not find resolver for "${source}"`, source);
        this.code = "EUNMATCHEDRESOLVER";
      }
    };
    setErrorName(UnmatchedResolverError);
    var MissingPointerError = exports.MissingPointerError = class MissingPointerError extends JSONParserError {
      constructor(token, path2) {
        super(`Token "${token}" does not exist.`, stripHash(path2));
        this.code = "EMISSINGPOINTER";
      }
    };
    setErrorName(MissingPointerError);
    var InvalidPointerError = exports.InvalidPointerError = class InvalidPointerError extends JSONParserError {
      constructor(pointer, path2) {
        super(`Invalid $ref pointer "${pointer}". Pointers must begin with "#/"`, stripHash(path2));
        this.code = "EINVALIDPOINTER";
      }
    };
    setErrorName(InvalidPointerError);
    function setErrorName(err) {
      Object.defineProperty(err.prototype, "name", {
        value: err.name,
        enumerable: true
      });
    }
    exports.isHandledError = function(err) {
      return err instanceof JSONParserError || err instanceof JSONParserErrorGroup;
    };
    exports.normalizeError = function(err) {
      if (err.path === null) {
        err.path = [];
      }
      return err;
    };
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/parsers/json.js
var require_json = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/parsers/json.js"(exports, module2) {
    "use strict";
    var { ParserError } = require_errors();
    module2.exports = {
      order: 100,
      allowEmpty: true,
      canParse: ".json",
      async parse(file) {
        let data = file.data;
        if (Buffer.isBuffer(data)) {
          data = data.toString();
        }
        if (typeof data === "string") {
          if (data.trim().length === 0) {
            return;
          } else {
            try {
              return JSON.parse(data);
            } catch (e) {
              throw new ParserError(e.message, file.url);
            }
          }
        } else {
          return data;
        }
      }
    };
  }
});

// node_modules/js-yaml/lib/common.js
var require_common = __commonJS({
  "node_modules/js-yaml/lib/common.js"(exports, module2) {
    "use strict";
    function isNothing(subject) {
      return typeof subject === "undefined" || subject === null;
    }
    function isObject(subject) {
      return typeof subject === "object" && subject !== null;
    }
    function toArray(sequence) {
      if (Array.isArray(sequence))
        return sequence;
      else if (isNothing(sequence))
        return [];
      return [sequence];
    }
    function extend(target, source) {
      var index, length, key, sourceKeys;
      if (source) {
        sourceKeys = Object.keys(source);
        for (index = 0, length = sourceKeys.length; index < length; index += 1) {
          key = sourceKeys[index];
          target[key] = source[key];
        }
      }
      return target;
    }
    function repeat(string, count) {
      var result = "", cycle;
      for (cycle = 0; cycle < count; cycle += 1) {
        result += string;
      }
      return result;
    }
    function isNegativeZero(number) {
      return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
    }
    module2.exports.isNothing = isNothing;
    module2.exports.isObject = isObject;
    module2.exports.toArray = toArray;
    module2.exports.repeat = repeat;
    module2.exports.isNegativeZero = isNegativeZero;
    module2.exports.extend = extend;
  }
});

// node_modules/js-yaml/lib/exception.js
var require_exception = __commonJS({
  "node_modules/js-yaml/lib/exception.js"(exports, module2) {
    "use strict";
    function formatError(exception, compact) {
      var where = "", message = exception.reason || "(unknown reason)";
      if (!exception.mark)
        return message;
      if (exception.mark.name) {
        where += 'in "' + exception.mark.name + '" ';
      }
      where += "(" + (exception.mark.line + 1) + ":" + (exception.mark.column + 1) + ")";
      if (!compact && exception.mark.snippet) {
        where += "\n\n" + exception.mark.snippet;
      }
      return message + " " + where;
    }
    function YAMLException(reason, mark) {
      Error.call(this);
      this.name = "YAMLException";
      this.reason = reason;
      this.mark = mark;
      this.message = formatError(this, false);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      } else {
        this.stack = new Error().stack || "";
      }
    }
    YAMLException.prototype = Object.create(Error.prototype);
    YAMLException.prototype.constructor = YAMLException;
    YAMLException.prototype.toString = function toString2(compact) {
      return this.name + ": " + formatError(this, compact);
    };
    module2.exports = YAMLException;
  }
});

// node_modules/js-yaml/lib/snippet.js
var require_snippet = __commonJS({
  "node_modules/js-yaml/lib/snippet.js"(exports, module2) {
    "use strict";
    var common = require_common();
    function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
      var head = "";
      var tail = "";
      var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
      if (position - lineStart > maxHalfLength) {
        head = " ... ";
        lineStart = position - maxHalfLength + head.length;
      }
      if (lineEnd - position > maxHalfLength) {
        tail = " ...";
        lineEnd = position + maxHalfLength - tail.length;
      }
      return {
        str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
        pos: position - lineStart + head.length
      };
    }
    function padStart(string, max) {
      return common.repeat(" ", max - string.length) + string;
    }
    function makeSnippet(mark, options) {
      options = Object.create(options || null);
      if (!mark.buffer)
        return null;
      if (!options.maxLength)
        options.maxLength = 79;
      if (typeof options.indent !== "number")
        options.indent = 1;
      if (typeof options.linesBefore !== "number")
        options.linesBefore = 3;
      if (typeof options.linesAfter !== "number")
        options.linesAfter = 2;
      var re = /\r?\n|\r|\0/g;
      var lineStarts = [0];
      var lineEnds = [];
      var match;
      var foundLineNo = -1;
      while (match = re.exec(mark.buffer)) {
        lineEnds.push(match.index);
        lineStarts.push(match.index + match[0].length);
        if (mark.position <= match.index && foundLineNo < 0) {
          foundLineNo = lineStarts.length - 2;
        }
      }
      if (foundLineNo < 0)
        foundLineNo = lineStarts.length - 1;
      var result = "", i, line;
      var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
      var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);
      for (i = 1; i <= options.linesBefore; i++) {
        if (foundLineNo - i < 0)
          break;
        line = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
        result = common.repeat(" ", options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
      }
      line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
      result += common.repeat(" ", options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
      result += common.repeat("-", options.indent + lineNoLength + 3 + line.pos) + "^\n";
      for (i = 1; i <= options.linesAfter; i++) {
        if (foundLineNo + i >= lineEnds.length)
          break;
        line = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
        result += common.repeat(" ", options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
      }
      return result.replace(/\n$/, "");
    }
    module2.exports = makeSnippet;
  }
});

// node_modules/js-yaml/lib/type.js
var require_type = __commonJS({
  "node_modules/js-yaml/lib/type.js"(exports, module2) {
    "use strict";
    var YAMLException = require_exception();
    var TYPE_CONSTRUCTOR_OPTIONS = [
      "kind",
      "multi",
      "resolve",
      "construct",
      "instanceOf",
      "predicate",
      "represent",
      "representName",
      "defaultStyle",
      "styleAliases"
    ];
    var YAML_NODE_KINDS = [
      "scalar",
      "sequence",
      "mapping"
    ];
    function compileStyleAliases(map) {
      var result = {};
      if (map !== null) {
        Object.keys(map).forEach(function(style) {
          map[style].forEach(function(alias) {
            result[String(alias)] = style;
          });
        });
      }
      return result;
    }
    function Type(tag, options) {
      options = options || {};
      Object.keys(options).forEach(function(name) {
        if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
          throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
        }
      });
      this.options = options;
      this.tag = tag;
      this.kind = options["kind"] || null;
      this.resolve = options["resolve"] || function() {
        return true;
      };
      this.construct = options["construct"] || function(data) {
        return data;
      };
      this.instanceOf = options["instanceOf"] || null;
      this.predicate = options["predicate"] || null;
      this.represent = options["represent"] || null;
      this.representName = options["representName"] || null;
      this.defaultStyle = options["defaultStyle"] || null;
      this.multi = options["multi"] || false;
      this.styleAliases = compileStyleAliases(options["styleAliases"] || null);
      if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
        throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
      }
    }
    module2.exports = Type;
  }
});

// node_modules/js-yaml/lib/schema.js
var require_schema6 = __commonJS({
  "node_modules/js-yaml/lib/schema.js"(exports, module2) {
    "use strict";
    var YAMLException = require_exception();
    var Type = require_type();
    function compileList(schema, name) {
      var result = [];
      schema[name].forEach(function(currentType) {
        var newIndex = result.length;
        result.forEach(function(previousType, previousIndex) {
          if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
            newIndex = previousIndex;
          }
        });
        result[newIndex] = currentType;
      });
      return result;
    }
    function compileMap() {
      var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;
      function collectType(type) {
        if (type.multi) {
          result.multi[type.kind].push(type);
          result.multi["fallback"].push(type);
        } else {
          result[type.kind][type.tag] = result["fallback"][type.tag] = type;
        }
      }
      for (index = 0, length = arguments.length; index < length; index += 1) {
        arguments[index].forEach(collectType);
      }
      return result;
    }
    function Schema(definition) {
      return this.extend(definition);
    }
    Schema.prototype.extend = function extend(definition) {
      var implicit = [];
      var explicit = [];
      if (definition instanceof Type) {
        explicit.push(definition);
      } else if (Array.isArray(definition)) {
        explicit = explicit.concat(definition);
      } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
        if (definition.implicit)
          implicit = implicit.concat(definition.implicit);
        if (definition.explicit)
          explicit = explicit.concat(definition.explicit);
      } else {
        throw new YAMLException("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
      }
      implicit.forEach(function(type) {
        if (!(type instanceof Type)) {
          throw new YAMLException("Specified list of YAML types (or a single Type object) contains a non-Type object.");
        }
        if (type.loadKind && type.loadKind !== "scalar") {
          throw new YAMLException("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
        }
        if (type.multi) {
          throw new YAMLException("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
        }
      });
      explicit.forEach(function(type) {
        if (!(type instanceof Type)) {
          throw new YAMLException("Specified list of YAML types (or a single Type object) contains a non-Type object.");
        }
      });
      var result = Object.create(Schema.prototype);
      result.implicit = (this.implicit || []).concat(implicit);
      result.explicit = (this.explicit || []).concat(explicit);
      result.compiledImplicit = compileList(result, "implicit");
      result.compiledExplicit = compileList(result, "explicit");
      result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
      return result;
    };
    module2.exports = Schema;
  }
});

// node_modules/js-yaml/lib/type/str.js
var require_str = __commonJS({
  "node_modules/js-yaml/lib/type/str.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    module2.exports = new Type("tag:yaml.org,2002:str", {
      kind: "scalar",
      construct: function(data) {
        return data !== null ? data : "";
      }
    });
  }
});

// node_modules/js-yaml/lib/type/seq.js
var require_seq = __commonJS({
  "node_modules/js-yaml/lib/type/seq.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    module2.exports = new Type("tag:yaml.org,2002:seq", {
      kind: "sequence",
      construct: function(data) {
        return data !== null ? data : [];
      }
    });
  }
});

// node_modules/js-yaml/lib/type/map.js
var require_map = __commonJS({
  "node_modules/js-yaml/lib/type/map.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    module2.exports = new Type("tag:yaml.org,2002:map", {
      kind: "mapping",
      construct: function(data) {
        return data !== null ? data : {};
      }
    });
  }
});

// node_modules/js-yaml/lib/schema/failsafe.js
var require_failsafe = __commonJS({
  "node_modules/js-yaml/lib/schema/failsafe.js"(exports, module2) {
    "use strict";
    var Schema = require_schema6();
    module2.exports = new Schema({
      explicit: [
        require_str(),
        require_seq(),
        require_map()
      ]
    });
  }
});

// node_modules/js-yaml/lib/type/null.js
var require_null = __commonJS({
  "node_modules/js-yaml/lib/type/null.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    function resolveYamlNull(data) {
      if (data === null)
        return true;
      var max = data.length;
      return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
    }
    function constructYamlNull() {
      return null;
    }
    function isNull(object) {
      return object === null;
    }
    module2.exports = new Type("tag:yaml.org,2002:null", {
      kind: "scalar",
      resolve: resolveYamlNull,
      construct: constructYamlNull,
      predicate: isNull,
      represent: {
        canonical: function() {
          return "~";
        },
        lowercase: function() {
          return "null";
        },
        uppercase: function() {
          return "NULL";
        },
        camelcase: function() {
          return "Null";
        },
        empty: function() {
          return "";
        }
      },
      defaultStyle: "lowercase"
    });
  }
});

// node_modules/js-yaml/lib/type/bool.js
var require_bool = __commonJS({
  "node_modules/js-yaml/lib/type/bool.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    function resolveYamlBoolean(data) {
      if (data === null)
        return false;
      var max = data.length;
      return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
    }
    function constructYamlBoolean(data) {
      return data === "true" || data === "True" || data === "TRUE";
    }
    function isBoolean(object) {
      return Object.prototype.toString.call(object) === "[object Boolean]";
    }
    module2.exports = new Type("tag:yaml.org,2002:bool", {
      kind: "scalar",
      resolve: resolveYamlBoolean,
      construct: constructYamlBoolean,
      predicate: isBoolean,
      represent: {
        lowercase: function(object) {
          return object ? "true" : "false";
        },
        uppercase: function(object) {
          return object ? "TRUE" : "FALSE";
        },
        camelcase: function(object) {
          return object ? "True" : "False";
        }
      },
      defaultStyle: "lowercase"
    });
  }
});

// node_modules/js-yaml/lib/type/int.js
var require_int = __commonJS({
  "node_modules/js-yaml/lib/type/int.js"(exports, module2) {
    "use strict";
    var common = require_common();
    var Type = require_type();
    function isHexCode(c) {
      return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
    }
    function isOctCode(c) {
      return 48 <= c && c <= 55;
    }
    function isDecCode(c) {
      return 48 <= c && c <= 57;
    }
    function resolveYamlInteger(data) {
      if (data === null)
        return false;
      var max = data.length, index = 0, hasDigits = false, ch;
      if (!max)
        return false;
      ch = data[index];
      if (ch === "-" || ch === "+") {
        ch = data[++index];
      }
      if (ch === "0") {
        if (index + 1 === max)
          return true;
        ch = data[++index];
        if (ch === "b") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_")
              continue;
            if (ch !== "0" && ch !== "1")
              return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
        if (ch === "x") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_")
              continue;
            if (!isHexCode(data.charCodeAt(index)))
              return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
        if (ch === "o") {
          index++;
          for (; index < max; index++) {
            ch = data[index];
            if (ch === "_")
              continue;
            if (!isOctCode(data.charCodeAt(index)))
              return false;
            hasDigits = true;
          }
          return hasDigits && ch !== "_";
        }
      }
      if (ch === "_")
        return false;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isDecCode(data.charCodeAt(index))) {
          return false;
        }
        hasDigits = true;
      }
      if (!hasDigits || ch === "_")
        return false;
      return true;
    }
    function constructYamlInteger(data) {
      var value = data, sign = 1, ch;
      if (value.indexOf("_") !== -1) {
        value = value.replace(/_/g, "");
      }
      ch = value[0];
      if (ch === "-" || ch === "+") {
        if (ch === "-")
          sign = -1;
        value = value.slice(1);
        ch = value[0];
      }
      if (value === "0")
        return 0;
      if (ch === "0") {
        if (value[1] === "b")
          return sign * parseInt(value.slice(2), 2);
        if (value[1] === "x")
          return sign * parseInt(value.slice(2), 16);
        if (value[1] === "o")
          return sign * parseInt(value.slice(2), 8);
      }
      return sign * parseInt(value, 10);
    }
    function isInteger(object) {
      return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common.isNegativeZero(object));
    }
    module2.exports = new Type("tag:yaml.org,2002:int", {
      kind: "scalar",
      resolve: resolveYamlInteger,
      construct: constructYamlInteger,
      predicate: isInteger,
      represent: {
        binary: function(obj) {
          return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
        },
        octal: function(obj) {
          return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
        },
        decimal: function(obj) {
          return obj.toString(10);
        },
        hexadecimal: function(obj) {
          return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
        }
      },
      defaultStyle: "decimal",
      styleAliases: {
        binary: [2, "bin"],
        octal: [8, "oct"],
        decimal: [10, "dec"],
        hexadecimal: [16, "hex"]
      }
    });
  }
});

// node_modules/js-yaml/lib/type/float.js
var require_float = __commonJS({
  "node_modules/js-yaml/lib/type/float.js"(exports, module2) {
    "use strict";
    var common = require_common();
    var Type = require_type();
    var YAML_FLOAT_PATTERN = new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");
    function resolveYamlFloat(data) {
      if (data === null)
        return false;
      if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === "_") {
        return false;
      }
      return true;
    }
    function constructYamlFloat(data) {
      var value, sign;
      value = data.replace(/_/g, "").toLowerCase();
      sign = value[0] === "-" ? -1 : 1;
      if ("+-".indexOf(value[0]) >= 0) {
        value = value.slice(1);
      }
      if (value === ".inf") {
        return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
      } else if (value === ".nan") {
        return NaN;
      }
      return sign * parseFloat(value, 10);
    }
    var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
    function representYamlFloat(object, style) {
      var res;
      if (isNaN(object)) {
        switch (style) {
          case "lowercase":
            return ".nan";
          case "uppercase":
            return ".NAN";
          case "camelcase":
            return ".NaN";
        }
      } else if (Number.POSITIVE_INFINITY === object) {
        switch (style) {
          case "lowercase":
            return ".inf";
          case "uppercase":
            return ".INF";
          case "camelcase":
            return ".Inf";
        }
      } else if (Number.NEGATIVE_INFINITY === object) {
        switch (style) {
          case "lowercase":
            return "-.inf";
          case "uppercase":
            return "-.INF";
          case "camelcase":
            return "-.Inf";
        }
      } else if (common.isNegativeZero(object)) {
        return "-0.0";
      }
      res = object.toString(10);
      return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
    }
    function isFloat(object) {
      return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common.isNegativeZero(object));
    }
    module2.exports = new Type("tag:yaml.org,2002:float", {
      kind: "scalar",
      resolve: resolveYamlFloat,
      construct: constructYamlFloat,
      predicate: isFloat,
      represent: representYamlFloat,
      defaultStyle: "lowercase"
    });
  }
});

// node_modules/js-yaml/lib/schema/json.js
var require_json2 = __commonJS({
  "node_modules/js-yaml/lib/schema/json.js"(exports, module2) {
    "use strict";
    module2.exports = require_failsafe().extend({
      implicit: [
        require_null(),
        require_bool(),
        require_int(),
        require_float()
      ]
    });
  }
});

// node_modules/js-yaml/lib/schema/core.js
var require_core = __commonJS({
  "node_modules/js-yaml/lib/schema/core.js"(exports, module2) {
    "use strict";
    module2.exports = require_json2();
  }
});

// node_modules/js-yaml/lib/type/timestamp.js
var require_timestamp = __commonJS({
  "node_modules/js-yaml/lib/type/timestamp.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    var YAML_DATE_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$");
    var YAML_TIMESTAMP_REGEXP = new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");
    function resolveYamlTimestamp(data) {
      if (data === null)
        return false;
      if (YAML_DATE_REGEXP.exec(data) !== null)
        return true;
      if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
        return true;
      return false;
    }
    function constructYamlTimestamp(data) {
      var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
      match = YAML_DATE_REGEXP.exec(data);
      if (match === null)
        match = YAML_TIMESTAMP_REGEXP.exec(data);
      if (match === null)
        throw new Error("Date resolve error");
      year = +match[1];
      month = +match[2] - 1;
      day = +match[3];
      if (!match[4]) {
        return new Date(Date.UTC(year, month, day));
      }
      hour = +match[4];
      minute = +match[5];
      second = +match[6];
      if (match[7]) {
        fraction = match[7].slice(0, 3);
        while (fraction.length < 3) {
          fraction += "0";
        }
        fraction = +fraction;
      }
      if (match[9]) {
        tz_hour = +match[10];
        tz_minute = +(match[11] || 0);
        delta = (tz_hour * 60 + tz_minute) * 6e4;
        if (match[9] === "-")
          delta = -delta;
      }
      date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
      if (delta)
        date.setTime(date.getTime() - delta);
      return date;
    }
    function representYamlTimestamp(object) {
      return object.toISOString();
    }
    module2.exports = new Type("tag:yaml.org,2002:timestamp", {
      kind: "scalar",
      resolve: resolveYamlTimestamp,
      construct: constructYamlTimestamp,
      instanceOf: Date,
      represent: representYamlTimestamp
    });
  }
});

// node_modules/js-yaml/lib/type/merge.js
var require_merge2 = __commonJS({
  "node_modules/js-yaml/lib/type/merge.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    function resolveYamlMerge(data) {
      return data === "<<" || data === null;
    }
    module2.exports = new Type("tag:yaml.org,2002:merge", {
      kind: "scalar",
      resolve: resolveYamlMerge
    });
  }
});

// node_modules/js-yaml/lib/type/binary.js
var require_binary = __commonJS({
  "node_modules/js-yaml/lib/type/binary.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
    function resolveYamlBinary(data) {
      if (data === null)
        return false;
      var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        code = map.indexOf(data.charAt(idx));
        if (code > 64)
          continue;
        if (code < 0)
          return false;
        bitlen += 6;
      }
      return bitlen % 8 === 0;
    }
    function constructYamlBinary(data) {
      var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map = BASE64_MAP, bits = 0, result = [];
      for (idx = 0; idx < max; idx++) {
        if (idx % 4 === 0 && idx) {
          result.push(bits >> 16 & 255);
          result.push(bits >> 8 & 255);
          result.push(bits & 255);
        }
        bits = bits << 6 | map.indexOf(input.charAt(idx));
      }
      tailbits = max % 4 * 6;
      if (tailbits === 0) {
        result.push(bits >> 16 & 255);
        result.push(bits >> 8 & 255);
        result.push(bits & 255);
      } else if (tailbits === 18) {
        result.push(bits >> 10 & 255);
        result.push(bits >> 2 & 255);
      } else if (tailbits === 12) {
        result.push(bits >> 4 & 255);
      }
      return new Uint8Array(result);
    }
    function representYamlBinary(object) {
      var result = "", bits = 0, idx, tail, max = object.length, map = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        if (idx % 3 === 0 && idx) {
          result += map[bits >> 18 & 63];
          result += map[bits >> 12 & 63];
          result += map[bits >> 6 & 63];
          result += map[bits & 63];
        }
        bits = (bits << 8) + object[idx];
      }
      tail = max % 3;
      if (tail === 0) {
        result += map[bits >> 18 & 63];
        result += map[bits >> 12 & 63];
        result += map[bits >> 6 & 63];
        result += map[bits & 63];
      } else if (tail === 2) {
        result += map[bits >> 10 & 63];
        result += map[bits >> 4 & 63];
        result += map[bits << 2 & 63];
        result += map[64];
      } else if (tail === 1) {
        result += map[bits >> 2 & 63];
        result += map[bits << 4 & 63];
        result += map[64];
        result += map[64];
      }
      return result;
    }
    function isBinary(obj) {
      return Object.prototype.toString.call(obj) === "[object Uint8Array]";
    }
    module2.exports = new Type("tag:yaml.org,2002:binary", {
      kind: "scalar",
      resolve: resolveYamlBinary,
      construct: constructYamlBinary,
      predicate: isBinary,
      represent: representYamlBinary
    });
  }
});

// node_modules/js-yaml/lib/type/omap.js
var require_omap = __commonJS({
  "node_modules/js-yaml/lib/type/omap.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var _toString = Object.prototype.toString;
    function resolveYamlOmap(data) {
      if (data === null)
        return true;
      var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        pairHasKey = false;
        if (_toString.call(pair) !== "[object Object]")
          return false;
        for (pairKey in pair) {
          if (_hasOwnProperty.call(pair, pairKey)) {
            if (!pairHasKey)
              pairHasKey = true;
            else
              return false;
          }
        }
        if (!pairHasKey)
          return false;
        if (objectKeys.indexOf(pairKey) === -1)
          objectKeys.push(pairKey);
        else
          return false;
      }
      return true;
    }
    function constructYamlOmap(data) {
      return data !== null ? data : [];
    }
    module2.exports = new Type("tag:yaml.org,2002:omap", {
      kind: "sequence",
      resolve: resolveYamlOmap,
      construct: constructYamlOmap
    });
  }
});

// node_modules/js-yaml/lib/type/pairs.js
var require_pairs = __commonJS({
  "node_modules/js-yaml/lib/type/pairs.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    var _toString = Object.prototype.toString;
    function resolveYamlPairs(data) {
      if (data === null)
        return true;
      var index, length, pair, keys, result, object = data;
      result = new Array(object.length);
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        if (_toString.call(pair) !== "[object Object]")
          return false;
        keys = Object.keys(pair);
        if (keys.length !== 1)
          return false;
        result[index] = [keys[0], pair[keys[0]]];
      }
      return true;
    }
    function constructYamlPairs(data) {
      if (data === null)
        return [];
      var index, length, pair, keys, result, object = data;
      result = new Array(object.length);
      for (index = 0, length = object.length; index < length; index += 1) {
        pair = object[index];
        keys = Object.keys(pair);
        result[index] = [keys[0], pair[keys[0]]];
      }
      return result;
    }
    module2.exports = new Type("tag:yaml.org,2002:pairs", {
      kind: "sequence",
      resolve: resolveYamlPairs,
      construct: constructYamlPairs
    });
  }
});

// node_modules/js-yaml/lib/type/set.js
var require_set = __commonJS({
  "node_modules/js-yaml/lib/type/set.js"(exports, module2) {
    "use strict";
    var Type = require_type();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    function resolveYamlSet(data) {
      if (data === null)
        return true;
      var key, object = data;
      for (key in object) {
        if (_hasOwnProperty.call(object, key)) {
          if (object[key] !== null)
            return false;
        }
      }
      return true;
    }
    function constructYamlSet(data) {
      return data !== null ? data : {};
    }
    module2.exports = new Type("tag:yaml.org,2002:set", {
      kind: "mapping",
      resolve: resolveYamlSet,
      construct: constructYamlSet
    });
  }
});

// node_modules/js-yaml/lib/schema/default.js
var require_default = __commonJS({
  "node_modules/js-yaml/lib/schema/default.js"(exports, module2) {
    "use strict";
    module2.exports = require_core().extend({
      implicit: [
        require_timestamp(),
        require_merge2()
      ],
      explicit: [
        require_binary(),
        require_omap(),
        require_pairs(),
        require_set()
      ]
    });
  }
});

// node_modules/js-yaml/lib/loader.js
var require_loader = __commonJS({
  "node_modules/js-yaml/lib/loader.js"(exports, module2) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var makeSnippet = require_snippet();
    var DEFAULT_SCHEMA = require_default();
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var CONTEXT_FLOW_IN = 1;
    var CONTEXT_FLOW_OUT = 2;
    var CONTEXT_BLOCK_IN = 3;
    var CONTEXT_BLOCK_OUT = 4;
    var CHOMPING_CLIP = 1;
    var CHOMPING_STRIP = 2;
    var CHOMPING_KEEP = 3;
    var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
    var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
    var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
    var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
    var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
    function _class(obj) {
      return Object.prototype.toString.call(obj);
    }
    function is_EOL(c) {
      return c === 10 || c === 13;
    }
    function is_WHITE_SPACE(c) {
      return c === 9 || c === 32;
    }
    function is_WS_OR_EOL(c) {
      return c === 9 || c === 32 || c === 10 || c === 13;
    }
    function is_FLOW_INDICATOR(c) {
      return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
    }
    function fromHexCode(c) {
      var lc;
      if (48 <= c && c <= 57) {
        return c - 48;
      }
      lc = c | 32;
      if (97 <= lc && lc <= 102) {
        return lc - 97 + 10;
      }
      return -1;
    }
    function escapedHexLen(c) {
      if (c === 120) {
        return 2;
      }
      if (c === 117) {
        return 4;
      }
      if (c === 85) {
        return 8;
      }
      return 0;
    }
    function fromDecimalCode(c) {
      if (48 <= c && c <= 57) {
        return c - 48;
      }
      return -1;
    }
    function simpleEscapeSequence(c) {
      return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
    }
    function charFromCodepoint(c) {
      if (c <= 65535) {
        return String.fromCharCode(c);
      }
      return String.fromCharCode((c - 65536 >> 10) + 55296, (c - 65536 & 1023) + 56320);
    }
    var simpleEscapeCheck = new Array(256);
    var simpleEscapeMap = new Array(256);
    for (i = 0; i < 256; i++) {
      simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
      simpleEscapeMap[i] = simpleEscapeSequence(i);
    }
    var i;
    function State(input, options) {
      this.input = input;
      this.filename = options["filename"] || null;
      this.schema = options["schema"] || DEFAULT_SCHEMA;
      this.onWarning = options["onWarning"] || null;
      this.legacy = options["legacy"] || false;
      this.json = options["json"] || false;
      this.listener = options["listener"] || null;
      this.implicitTypes = this.schema.compiledImplicit;
      this.typeMap = this.schema.compiledTypeMap;
      this.length = input.length;
      this.position = 0;
      this.line = 0;
      this.lineStart = 0;
      this.lineIndent = 0;
      this.firstTabInLine = -1;
      this.documents = [];
    }
    function generateError(state, message) {
      var mark = {
        name: state.filename,
        buffer: state.input.slice(0, -1),
        position: state.position,
        line: state.line,
        column: state.position - state.lineStart
      };
      mark.snippet = makeSnippet(mark);
      return new YAMLException(message, mark);
    }
    function throwError(state, message) {
      throw generateError(state, message);
    }
    function throwWarning(state, message) {
      if (state.onWarning) {
        state.onWarning.call(null, generateError(state, message));
      }
    }
    var directiveHandlers = {
      YAML: function handleYamlDirective(state, name, args) {
        var match, major, minor;
        if (state.version !== null) {
          throwError(state, "duplication of %YAML directive");
        }
        if (args.length !== 1) {
          throwError(state, "YAML directive accepts exactly one argument");
        }
        match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
        if (match === null) {
          throwError(state, "ill-formed argument of the YAML directive");
        }
        major = parseInt(match[1], 10);
        minor = parseInt(match[2], 10);
        if (major !== 1) {
          throwError(state, "unacceptable YAML version of the document");
        }
        state.version = args[0];
        state.checkLineBreaks = minor < 2;
        if (minor !== 1 && minor !== 2) {
          throwWarning(state, "unsupported YAML version of the document");
        }
      },
      TAG: function handleTagDirective(state, name, args) {
        var handle, prefix;
        if (args.length !== 2) {
          throwError(state, "TAG directive accepts exactly two arguments");
        }
        handle = args[0];
        prefix = args[1];
        if (!PATTERN_TAG_HANDLE.test(handle)) {
          throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
        }
        if (_hasOwnProperty.call(state.tagMap, handle)) {
          throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
        }
        if (!PATTERN_TAG_URI.test(prefix)) {
          throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
        }
        try {
          prefix = decodeURIComponent(prefix);
        } catch (err) {
          throwError(state, "tag prefix is malformed: " + prefix);
        }
        state.tagMap[handle] = prefix;
      }
    };
    function captureSegment(state, start, end, checkJson) {
      var _position, _length, _character, _result;
      if (start < end) {
        _result = state.input.slice(start, end);
        if (checkJson) {
          for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
            _character = _result.charCodeAt(_position);
            if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
              throwError(state, "expected valid JSON character");
            }
          }
        } else if (PATTERN_NON_PRINTABLE.test(_result)) {
          throwError(state, "the stream contains non-printable characters");
        }
        state.result += _result;
      }
    }
    function mergeMappings(state, destination, source, overridableKeys) {
      var sourceKeys, key, index, quantity;
      if (!common.isObject(source)) {
        throwError(state, "cannot merge mappings; the provided source object is unacceptable");
      }
      sourceKeys = Object.keys(source);
      for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
        key = sourceKeys[index];
        if (!_hasOwnProperty.call(destination, key)) {
          destination[key] = source[key];
          overridableKeys[key] = true;
        }
      }
    }
    function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
      var index, quantity;
      if (Array.isArray(keyNode)) {
        keyNode = Array.prototype.slice.call(keyNode);
        for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
          if (Array.isArray(keyNode[index])) {
            throwError(state, "nested arrays are not supported inside keys");
          }
          if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
            keyNode[index] = "[object Object]";
          }
        }
      }
      if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
        keyNode = "[object Object]";
      }
      keyNode = String(keyNode);
      if (_result === null) {
        _result = {};
      }
      if (keyTag === "tag:yaml.org,2002:merge") {
        if (Array.isArray(valueNode)) {
          for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
            mergeMappings(state, _result, valueNode[index], overridableKeys);
          }
        } else {
          mergeMappings(state, _result, valueNode, overridableKeys);
        }
      } else {
        if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
          state.line = startLine || state.line;
          state.lineStart = startLineStart || state.lineStart;
          state.position = startPos || state.position;
          throwError(state, "duplicated mapping key");
        }
        if (keyNode === "__proto__") {
          Object.defineProperty(_result, keyNode, {
            configurable: true,
            enumerable: true,
            writable: true,
            value: valueNode
          });
        } else {
          _result[keyNode] = valueNode;
        }
        delete overridableKeys[keyNode];
      }
      return _result;
    }
    function readLineBreak(state) {
      var ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 10) {
        state.position++;
      } else if (ch === 13) {
        state.position++;
        if (state.input.charCodeAt(state.position) === 10) {
          state.position++;
        }
      } else {
        throwError(state, "a line break is expected");
      }
      state.line += 1;
      state.lineStart = state.position;
      state.firstTabInLine = -1;
    }
    function skipSeparationSpace(state, allowComments, checkIndent) {
      var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          if (ch === 9 && state.firstTabInLine === -1) {
            state.firstTabInLine = state.position;
          }
          ch = state.input.charCodeAt(++state.position);
        }
        if (allowComments && ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 10 && ch !== 13 && ch !== 0);
        }
        if (is_EOL(ch)) {
          readLineBreak(state);
          ch = state.input.charCodeAt(state.position);
          lineBreaks++;
          state.lineIndent = 0;
          while (ch === 32) {
            state.lineIndent++;
            ch = state.input.charCodeAt(++state.position);
          }
        } else {
          break;
        }
      }
      if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
        throwWarning(state, "deficient indentation");
      }
      return lineBreaks;
    }
    function testDocumentSeparator(state) {
      var _position = state.position, ch;
      ch = state.input.charCodeAt(_position);
      if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
        _position += 3;
        ch = state.input.charCodeAt(_position);
        if (ch === 0 || is_WS_OR_EOL(ch)) {
          return true;
        }
      }
      return false;
    }
    function writeFoldedLines(state, count) {
      if (count === 1) {
        state.result += " ";
      } else if (count > 1) {
        state.result += common.repeat("\n", count - 1);
      }
    }
    function readPlainScalar(state, nodeIndent, withinFlowCollection) {
      var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
      ch = state.input.charCodeAt(state.position);
      if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
        return false;
      }
      if (ch === 63 || ch === 45) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          return false;
        }
      }
      state.kind = "scalar";
      state.result = "";
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
      while (ch !== 0) {
        if (ch === 58) {
          following = state.input.charCodeAt(state.position + 1);
          if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
            break;
          }
        } else if (ch === 35) {
          preceding = state.input.charCodeAt(state.position - 1);
          if (is_WS_OR_EOL(preceding)) {
            break;
          }
        } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
          break;
        } else if (is_EOL(ch)) {
          _line = state.line;
          _lineStart = state.lineStart;
          _lineIndent = state.lineIndent;
          skipSeparationSpace(state, false, -1);
          if (state.lineIndent >= nodeIndent) {
            hasPendingContent = true;
            ch = state.input.charCodeAt(state.position);
            continue;
          } else {
            state.position = captureEnd;
            state.line = _line;
            state.lineStart = _lineStart;
            state.lineIndent = _lineIndent;
            break;
          }
        }
        if (hasPendingContent) {
          captureSegment(state, captureStart, captureEnd, false);
          writeFoldedLines(state, state.line - _line);
          captureStart = captureEnd = state.position;
          hasPendingContent = false;
        }
        if (!is_WHITE_SPACE(ch)) {
          captureEnd = state.position + 1;
        }
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, captureEnd, false);
      if (state.result) {
        return true;
      }
      state.kind = _kind;
      state.result = _result;
      return false;
    }
    function readSingleQuotedScalar(state, nodeIndent) {
      var ch, captureStart, captureEnd;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 39) {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      state.position++;
      captureStart = captureEnd = state.position;
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 39) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);
          if (ch === 39) {
            captureStart = state.position;
            state.position++;
            captureEnd = state.position;
          } else {
            return true;
          }
        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, "unexpected end of the document within a single quoted scalar");
        } else {
          state.position++;
          captureEnd = state.position;
        }
      }
      throwError(state, "unexpected end of the stream within a single quoted scalar");
    }
    function readDoubleQuotedScalar(state, nodeIndent) {
      var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 34) {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      state.position++;
      captureStart = captureEnd = state.position;
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        if (ch === 34) {
          captureSegment(state, captureStart, state.position, true);
          state.position++;
          return true;
        } else if (ch === 92) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);
          if (is_EOL(ch)) {
            skipSeparationSpace(state, false, nodeIndent);
          } else if (ch < 256 && simpleEscapeCheck[ch]) {
            state.result += simpleEscapeMap[ch];
            state.position++;
          } else if ((tmp = escapedHexLen(ch)) > 0) {
            hexLength = tmp;
            hexResult = 0;
            for (; hexLength > 0; hexLength--) {
              ch = state.input.charCodeAt(++state.position);
              if ((tmp = fromHexCode(ch)) >= 0) {
                hexResult = (hexResult << 4) + tmp;
              } else {
                throwError(state, "expected hexadecimal character");
              }
            }
            state.result += charFromCodepoint(hexResult);
            state.position++;
          } else {
            throwError(state, "unknown escape sequence");
          }
          captureStart = captureEnd = state.position;
        } else if (is_EOL(ch)) {
          captureSegment(state, captureStart, captureEnd, true);
          writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
          captureStart = captureEnd = state.position;
        } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
          throwError(state, "unexpected end of the document within a double quoted scalar");
        } else {
          state.position++;
          captureEnd = state.position;
        }
      }
      throwError(state, "unexpected end of the stream within a double quoted scalar");
    }
    function readFlowCollection(state, nodeIndent) {
      var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = Object.create(null), keyNode, keyTag, valueNode, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 91) {
        terminator = 93;
        isMapping = false;
        _result = [];
      } else if (ch === 123) {
        terminator = 125;
        isMapping = true;
        _result = {};
      } else {
        return false;
      }
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(++state.position);
      while (ch !== 0) {
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === terminator) {
          state.position++;
          state.tag = _tag;
          state.anchor = _anchor;
          state.kind = isMapping ? "mapping" : "sequence";
          state.result = _result;
          return true;
        } else if (!readNext) {
          throwError(state, "missed comma between flow collection entries");
        } else if (ch === 44) {
          throwError(state, "expected the node content, but found ','");
        }
        keyTag = keyNode = valueNode = null;
        isPair = isExplicitPair = false;
        if (ch === 63) {
          following = state.input.charCodeAt(state.position + 1);
          if (is_WS_OR_EOL(following)) {
            isPair = isExplicitPair = true;
            state.position++;
            skipSeparationSpace(state, true, nodeIndent);
          }
        }
        _line = state.line;
        _lineStart = state.lineStart;
        _pos = state.position;
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        keyTag = state.tag;
        keyNode = state.result;
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if ((isExplicitPair || state.line === _line) && ch === 58) {
          isPair = true;
          ch = state.input.charCodeAt(++state.position);
          skipSeparationSpace(state, true, nodeIndent);
          composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
          valueNode = state.result;
        }
        if (isMapping) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
        } else if (isPair) {
          _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
        } else {
          _result.push(keyNode);
        }
        skipSeparationSpace(state, true, nodeIndent);
        ch = state.input.charCodeAt(state.position);
        if (ch === 44) {
          readNext = true;
          ch = state.input.charCodeAt(++state.position);
        } else {
          readNext = false;
        }
      }
      throwError(state, "unexpected end of the stream within a flow collection");
    }
    function readBlockScalar(state, nodeIndent) {
      var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch === 124) {
        folding = false;
      } else if (ch === 62) {
        folding = true;
      } else {
        return false;
      }
      state.kind = "scalar";
      state.result = "";
      while (ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
        if (ch === 43 || ch === 45) {
          if (CHOMPING_CLIP === chomping) {
            chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
          } else {
            throwError(state, "repeat of a chomping mode identifier");
          }
        } else if ((tmp = fromDecimalCode(ch)) >= 0) {
          if (tmp === 0) {
            throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
          } else if (!detectedIndent) {
            textIndent = nodeIndent + tmp - 1;
            detectedIndent = true;
          } else {
            throwError(state, "repeat of an indentation width identifier");
          }
        } else {
          break;
        }
      }
      if (is_WHITE_SPACE(ch)) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (is_WHITE_SPACE(ch));
        if (ch === 35) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (!is_EOL(ch) && ch !== 0);
        }
      }
      while (ch !== 0) {
        readLineBreak(state);
        state.lineIndent = 0;
        ch = state.input.charCodeAt(state.position);
        while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
        if (!detectedIndent && state.lineIndent > textIndent) {
          textIndent = state.lineIndent;
        }
        if (is_EOL(ch)) {
          emptyLines++;
          continue;
        }
        if (state.lineIndent < textIndent) {
          if (chomping === CHOMPING_KEEP) {
            state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          } else if (chomping === CHOMPING_CLIP) {
            if (didReadContent) {
              state.result += "\n";
            }
          }
          break;
        }
        if (folding) {
          if (is_WHITE_SPACE(ch)) {
            atMoreIndented = true;
            state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
          } else if (atMoreIndented) {
            atMoreIndented = false;
            state.result += common.repeat("\n", emptyLines + 1);
          } else if (emptyLines === 0) {
            if (didReadContent) {
              state.result += " ";
            }
          } else {
            state.result += common.repeat("\n", emptyLines);
          }
        } else {
          state.result += common.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
        }
        didReadContent = true;
        detectedIndent = true;
        emptyLines = 0;
        captureStart = state.position;
        while (!is_EOL(ch) && ch !== 0) {
          ch = state.input.charCodeAt(++state.position);
        }
        captureSegment(state, captureStart, state.position, false);
      }
      return true;
    }
    function readBlockSequence(state, nodeIndent) {
      var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
      if (state.firstTabInLine !== -1)
        return false;
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        if (state.firstTabInLine !== -1) {
          state.position = state.firstTabInLine;
          throwError(state, "tab characters must not be used in indentation");
        }
        if (ch !== 45) {
          break;
        }
        following = state.input.charCodeAt(state.position + 1);
        if (!is_WS_OR_EOL(following)) {
          break;
        }
        detected = true;
        state.position++;
        if (skipSeparationSpace(state, true, -1)) {
          if (state.lineIndent <= nodeIndent) {
            _result.push(null);
            ch = state.input.charCodeAt(state.position);
            continue;
          }
        }
        _line = state.line;
        composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
        _result.push(state.result);
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
          throwError(state, "bad indentation of a sequence entry");
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }
      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = "sequence";
        state.result = _result;
        return true;
      }
      return false;
    }
    function readBlockMapping(state, nodeIndent, flowIndent) {
      var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
      if (state.firstTabInLine !== -1)
        return false;
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = _result;
      }
      ch = state.input.charCodeAt(state.position);
      while (ch !== 0) {
        if (!atExplicitKey && state.firstTabInLine !== -1) {
          state.position = state.firstTabInLine;
          throwError(state, "tab characters must not be used in indentation");
        }
        following = state.input.charCodeAt(state.position + 1);
        _line = state.line;
        if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
          if (ch === 63) {
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = true;
            allowCompact = true;
          } else if (atExplicitKey) {
            atExplicitKey = false;
            allowCompact = true;
          } else {
            throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
          }
          state.position += 1;
          ch = following;
        } else {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
          if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
            break;
          }
          if (state.line === _line) {
            ch = state.input.charCodeAt(state.position);
            while (is_WHITE_SPACE(ch)) {
              ch = state.input.charCodeAt(++state.position);
            }
            if (ch === 58) {
              ch = state.input.charCodeAt(++state.position);
              if (!is_WS_OR_EOL(ch)) {
                throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
              }
              if (atExplicitKey) {
                storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
                keyTag = keyNode = valueNode = null;
              }
              detected = true;
              atExplicitKey = false;
              allowCompact = false;
              keyTag = state.tag;
              keyNode = state.result;
            } else if (detected) {
              throwError(state, "can not read an implicit mapping pair; a colon is missed");
            } else {
              state.tag = _tag;
              state.anchor = _anchor;
              return true;
            }
          } else if (detected) {
            throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        }
        if (state.line === _line || state.lineIndent > nodeIndent) {
          if (atExplicitKey) {
            _keyLine = state.line;
            _keyLineStart = state.lineStart;
            _keyPos = state.position;
          }
          if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
            if (atExplicitKey) {
              keyNode = state.result;
            } else {
              valueNode = state.result;
            }
          }
          if (!atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          skipSeparationSpace(state, true, -1);
          ch = state.input.charCodeAt(state.position);
        }
        if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
          throwError(state, "bad indentation of a mapping entry");
        } else if (state.lineIndent < nodeIndent) {
          break;
        }
      }
      if (atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
      }
      if (detected) {
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = "mapping";
        state.result = _result;
      }
      return detected;
    }
    function readTagProperty(state) {
      var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 33)
        return false;
      if (state.tag !== null) {
        throwError(state, "duplication of a tag property");
      }
      ch = state.input.charCodeAt(++state.position);
      if (ch === 60) {
        isVerbatim = true;
        ch = state.input.charCodeAt(++state.position);
      } else if (ch === 33) {
        isNamed = true;
        tagHandle = "!!";
        ch = state.input.charCodeAt(++state.position);
      } else {
        tagHandle = "!";
      }
      _position = state.position;
      if (isVerbatim) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && ch !== 62);
        if (state.position < state.length) {
          tagName = state.input.slice(_position, state.position);
          ch = state.input.charCodeAt(++state.position);
        } else {
          throwError(state, "unexpected end of the stream within a verbatim tag");
        }
      } else {
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          if (ch === 33) {
            if (!isNamed) {
              tagHandle = state.input.slice(_position - 1, state.position + 1);
              if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                throwError(state, "named tag handle cannot contain such characters");
              }
              isNamed = true;
              _position = state.position + 1;
            } else {
              throwError(state, "tag suffix cannot contain exclamation marks");
            }
          }
          ch = state.input.charCodeAt(++state.position);
        }
        tagName = state.input.slice(_position, state.position);
        if (PATTERN_FLOW_INDICATORS.test(tagName)) {
          throwError(state, "tag suffix cannot contain flow indicator characters");
        }
      }
      if (tagName && !PATTERN_TAG_URI.test(tagName)) {
        throwError(state, "tag name cannot contain such characters: " + tagName);
      }
      try {
        tagName = decodeURIComponent(tagName);
      } catch (err) {
        throwError(state, "tag name is malformed: " + tagName);
      }
      if (isVerbatim) {
        state.tag = tagName;
      } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
        state.tag = state.tagMap[tagHandle] + tagName;
      } else if (tagHandle === "!") {
        state.tag = "!" + tagName;
      } else if (tagHandle === "!!") {
        state.tag = "tag:yaml.org,2002:" + tagName;
      } else {
        throwError(state, 'undeclared tag handle "' + tagHandle + '"');
      }
      return true;
    }
    function readAnchorProperty(state) {
      var _position, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 38)
        return false;
      if (state.anchor !== null) {
        throwError(state, "duplication of an anchor property");
      }
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (state.position === _position) {
        throwError(state, "name of an anchor node must contain at least one character");
      }
      state.anchor = state.input.slice(_position, state.position);
      return true;
    }
    function readAlias(state) {
      var _position, alias, ch;
      ch = state.input.charCodeAt(state.position);
      if (ch !== 42)
        return false;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (state.position === _position) {
        throwError(state, "name of an alias node must contain at least one character");
      }
      alias = state.input.slice(_position, state.position);
      if (!_hasOwnProperty.call(state.anchorMap, alias)) {
        throwError(state, 'unidentified alias "' + alias + '"');
      }
      state.result = state.anchorMap[alias];
      skipSeparationSpace(state, true, -1);
      return true;
    }
    function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
      var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type, flowIndent, blockIndent;
      if (state.listener !== null) {
        state.listener("open", state);
      }
      state.tag = null;
      state.anchor = null;
      state.kind = null;
      state.result = null;
      allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
      if (allowToSeek) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        }
      }
      if (indentStatus === 1) {
        while (readTagProperty(state) || readAnchorProperty(state)) {
          if (skipSeparationSpace(state, true, -1)) {
            atNewLine = true;
            allowBlockCollections = allowBlockStyles;
            if (state.lineIndent > parentIndent) {
              indentStatus = 1;
            } else if (state.lineIndent === parentIndent) {
              indentStatus = 0;
            } else if (state.lineIndent < parentIndent) {
              indentStatus = -1;
            }
          } else {
            allowBlockCollections = false;
          }
        }
      }
      if (allowBlockCollections) {
        allowBlockCollections = atNewLine || allowCompact;
      }
      if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
        if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
          flowIndent = parentIndent;
        } else {
          flowIndent = parentIndent + 1;
        }
        blockIndent = state.position - state.lineStart;
        if (indentStatus === 1) {
          if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
            hasContent = true;
          } else {
            if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
              hasContent = true;
            } else if (readAlias(state)) {
              hasContent = true;
              if (state.tag !== null || state.anchor !== null) {
                throwError(state, "alias node should not have any properties");
              }
            } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
              hasContent = true;
              if (state.tag === null) {
                state.tag = "?";
              }
            }
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
          }
        } else if (indentStatus === 0) {
          hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
        }
      }
      if (state.tag === null) {
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      } else if (state.tag === "?") {
        if (state.result !== null && state.kind !== "scalar") {
          throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
        }
        for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
          type = state.implicitTypes[typeIndex];
          if (type.resolve(state.result)) {
            state.result = type.construct(state.result);
            state.tag = type.tag;
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
            break;
          }
        }
      } else if (state.tag !== "!") {
        if (_hasOwnProperty.call(state.typeMap[state.kind || "fallback"], state.tag)) {
          type = state.typeMap[state.kind || "fallback"][state.tag];
        } else {
          type = null;
          typeList = state.typeMap.multi[state.kind || "fallback"];
          for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
            if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
              type = typeList[typeIndex];
              break;
            }
          }
        }
        if (!type) {
          throwError(state, "unknown tag !<" + state.tag + ">");
        }
        if (state.result !== null && type.kind !== state.kind) {
          throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
        }
        if (!type.resolve(state.result, state.tag)) {
          throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
        } else {
          state.result = type.construct(state.result, state.tag);
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      }
      if (state.listener !== null) {
        state.listener("close", state);
      }
      return state.tag !== null || state.anchor !== null || hasContent;
    }
    function readDocument(state) {
      var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
      state.version = null;
      state.checkLineBreaks = state.legacy;
      state.tagMap = Object.create(null);
      state.anchorMap = Object.create(null);
      while ((ch = state.input.charCodeAt(state.position)) !== 0) {
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
        if (state.lineIndent > 0 || ch !== 37) {
          break;
        }
        hasDirectives = true;
        ch = state.input.charCodeAt(++state.position);
        _position = state.position;
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveName = state.input.slice(_position, state.position);
        directiveArgs = [];
        if (directiveName.length < 1) {
          throwError(state, "directive name must not be less than one character in length");
        }
        while (ch !== 0) {
          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 35) {
            do {
              ch = state.input.charCodeAt(++state.position);
            } while (ch !== 0 && !is_EOL(ch));
            break;
          }
          if (is_EOL(ch))
            break;
          _position = state.position;
          while (ch !== 0 && !is_WS_OR_EOL(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          directiveArgs.push(state.input.slice(_position, state.position));
        }
        if (ch !== 0)
          readLineBreak(state);
        if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
          directiveHandlers[directiveName](state, directiveName, directiveArgs);
        } else {
          throwWarning(state, 'unknown document directive "' + directiveName + '"');
        }
      }
      skipSeparationSpace(state, true, -1);
      if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      } else if (hasDirectives) {
        throwError(state, "directives end mark is expected");
      }
      composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
      skipSeparationSpace(state, true, -1);
      if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
        throwWarning(state, "non-ASCII line breaks are interpreted as content");
      }
      state.documents.push(state.result);
      if (state.position === state.lineStart && testDocumentSeparator(state)) {
        if (state.input.charCodeAt(state.position) === 46) {
          state.position += 3;
          skipSeparationSpace(state, true, -1);
        }
        return;
      }
      if (state.position < state.length - 1) {
        throwError(state, "end of the stream or a document separator is expected");
      } else {
        return;
      }
    }
    function loadDocuments(input, options) {
      input = String(input);
      options = options || {};
      if (input.length !== 0) {
        if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
          input += "\n";
        }
        if (input.charCodeAt(0) === 65279) {
          input = input.slice(1);
        }
      }
      var state = new State(input, options);
      var nullpos = input.indexOf("\0");
      if (nullpos !== -1) {
        state.position = nullpos;
        throwError(state, "null byte is not allowed in input");
      }
      state.input += "\0";
      while (state.input.charCodeAt(state.position) === 32) {
        state.lineIndent += 1;
        state.position += 1;
      }
      while (state.position < state.length - 1) {
        readDocument(state);
      }
      return state.documents;
    }
    function loadAll(input, iterator, options) {
      if (iterator !== null && typeof iterator === "object" && typeof options === "undefined") {
        options = iterator;
        iterator = null;
      }
      var documents = loadDocuments(input, options);
      if (typeof iterator !== "function") {
        return documents;
      }
      for (var index = 0, length = documents.length; index < length; index += 1) {
        iterator(documents[index]);
      }
    }
    function load(input, options) {
      var documents = loadDocuments(input, options);
      if (documents.length === 0) {
        return void 0;
      } else if (documents.length === 1) {
        return documents[0];
      }
      throw new YAMLException("expected a single document in the stream, but found more");
    }
    module2.exports.loadAll = loadAll;
    module2.exports.load = load;
  }
});

// node_modules/js-yaml/lib/dumper.js
var require_dumper = __commonJS({
  "node_modules/js-yaml/lib/dumper.js"(exports, module2) {
    "use strict";
    var common = require_common();
    var YAMLException = require_exception();
    var DEFAULT_SCHEMA = require_default();
    var _toString = Object.prototype.toString;
    var _hasOwnProperty = Object.prototype.hasOwnProperty;
    var CHAR_BOM = 65279;
    var CHAR_TAB = 9;
    var CHAR_LINE_FEED = 10;
    var CHAR_CARRIAGE_RETURN = 13;
    var CHAR_SPACE = 32;
    var CHAR_EXCLAMATION = 33;
    var CHAR_DOUBLE_QUOTE = 34;
    var CHAR_SHARP = 35;
    var CHAR_PERCENT = 37;
    var CHAR_AMPERSAND = 38;
    var CHAR_SINGLE_QUOTE = 39;
    var CHAR_ASTERISK = 42;
    var CHAR_COMMA = 44;
    var CHAR_MINUS = 45;
    var CHAR_COLON = 58;
    var CHAR_EQUALS = 61;
    var CHAR_GREATER_THAN = 62;
    var CHAR_QUESTION = 63;
    var CHAR_COMMERCIAL_AT = 64;
    var CHAR_LEFT_SQUARE_BRACKET = 91;
    var CHAR_RIGHT_SQUARE_BRACKET = 93;
    var CHAR_GRAVE_ACCENT = 96;
    var CHAR_LEFT_CURLY_BRACKET = 123;
    var CHAR_VERTICAL_LINE = 124;
    var CHAR_RIGHT_CURLY_BRACKET = 125;
    var ESCAPE_SEQUENCES = {};
    ESCAPE_SEQUENCES[0] = "\\0";
    ESCAPE_SEQUENCES[7] = "\\a";
    ESCAPE_SEQUENCES[8] = "\\b";
    ESCAPE_SEQUENCES[9] = "\\t";
    ESCAPE_SEQUENCES[10] = "\\n";
    ESCAPE_SEQUENCES[11] = "\\v";
    ESCAPE_SEQUENCES[12] = "\\f";
    ESCAPE_SEQUENCES[13] = "\\r";
    ESCAPE_SEQUENCES[27] = "\\e";
    ESCAPE_SEQUENCES[34] = '\\"';
    ESCAPE_SEQUENCES[92] = "\\\\";
    ESCAPE_SEQUENCES[133] = "\\N";
    ESCAPE_SEQUENCES[160] = "\\_";
    ESCAPE_SEQUENCES[8232] = "\\L";
    ESCAPE_SEQUENCES[8233] = "\\P";
    var DEPRECATED_BOOLEANS_SYNTAX = [
      "y",
      "Y",
      "yes",
      "Yes",
      "YES",
      "on",
      "On",
      "ON",
      "n",
      "N",
      "no",
      "No",
      "NO",
      "off",
      "Off",
      "OFF"
    ];
    var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
    function compileStyleMap(schema, map) {
      var result, keys, index, length, tag, style, type;
      if (map === null)
        return {};
      result = {};
      keys = Object.keys(map);
      for (index = 0, length = keys.length; index < length; index += 1) {
        tag = keys[index];
        style = String(map[tag]);
        if (tag.slice(0, 2) === "!!") {
          tag = "tag:yaml.org,2002:" + tag.slice(2);
        }
        type = schema.compiledTypeMap["fallback"][tag];
        if (type && _hasOwnProperty.call(type.styleAliases, style)) {
          style = type.styleAliases[style];
        }
        result[tag] = style;
      }
      return result;
    }
    function encodeHex(character) {
      var string, handle, length;
      string = character.toString(16).toUpperCase();
      if (character <= 255) {
        handle = "x";
        length = 2;
      } else if (character <= 65535) {
        handle = "u";
        length = 4;
      } else if (character <= 4294967295) {
        handle = "U";
        length = 8;
      } else {
        throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");
      }
      return "\\" + handle + common.repeat("0", length - string.length) + string;
    }
    var QUOTING_TYPE_SINGLE = 1;
    var QUOTING_TYPE_DOUBLE = 2;
    function State(options) {
      this.schema = options["schema"] || DEFAULT_SCHEMA;
      this.indent = Math.max(1, options["indent"] || 2);
      this.noArrayIndent = options["noArrayIndent"] || false;
      this.skipInvalid = options["skipInvalid"] || false;
      this.flowLevel = common.isNothing(options["flowLevel"]) ? -1 : options["flowLevel"];
      this.styleMap = compileStyleMap(this.schema, options["styles"] || null);
      this.sortKeys = options["sortKeys"] || false;
      this.lineWidth = options["lineWidth"] || 80;
      this.noRefs = options["noRefs"] || false;
      this.noCompatMode = options["noCompatMode"] || false;
      this.condenseFlow = options["condenseFlow"] || false;
      this.quotingType = options["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
      this.forceQuotes = options["forceQuotes"] || false;
      this.replacer = typeof options["replacer"] === "function" ? options["replacer"] : null;
      this.implicitTypes = this.schema.compiledImplicit;
      this.explicitTypes = this.schema.compiledExplicit;
      this.tag = null;
      this.result = "";
      this.duplicates = [];
      this.usedDuplicates = null;
    }
    function indentString(string, spaces) {
      var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string.length;
      while (position < length) {
        next = string.indexOf("\n", position);
        if (next === -1) {
          line = string.slice(position);
          position = length;
        } else {
          line = string.slice(position, next + 1);
          position = next + 1;
        }
        if (line.length && line !== "\n")
          result += ind;
        result += line;
      }
      return result;
    }
    function generateNextLine(state, level) {
      return "\n" + common.repeat(" ", state.indent * level);
    }
    function testImplicitResolving(state, str) {
      var index, length, type;
      for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
        type = state.implicitTypes[index];
        if (type.resolve(str)) {
          return true;
        }
      }
      return false;
    }
    function isWhitespace(c) {
      return c === CHAR_SPACE || c === CHAR_TAB;
    }
    function isPrintable(c) {
      return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
    }
    function isNsCharOrWhitespace(c) {
      return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
    }
    function isPlainSafe(c, prev, inblock) {
      var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
      var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
      return (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar;
    }
    function isPlainSafeFirst(c) {
      return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
    }
    function isPlainSafeLast(c) {
      return !isWhitespace(c) && c !== CHAR_COLON;
    }
    function codePointAt(string, pos) {
      var first = string.charCodeAt(pos), second;
      if (first >= 55296 && first <= 56319 && pos + 1 < string.length) {
        second = string.charCodeAt(pos + 1);
        if (second >= 56320 && second <= 57343) {
          return (first - 55296) * 1024 + second - 56320 + 65536;
        }
      }
      return first;
    }
    function needIndentIndicator(string) {
      var leadingSpaceRe = /^\n* /;
      return leadingSpaceRe.test(string);
    }
    var STYLE_PLAIN = 1;
    var STYLE_SINGLE = 2;
    var STYLE_LITERAL = 3;
    var STYLE_FOLDED = 4;
    var STYLE_DOUBLE = 5;
    function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
      var i;
      var char = 0;
      var prevChar = null;
      var hasLineBreak = false;
      var hasFoldableLine = false;
      var shouldTrackWidth = lineWidth !== -1;
      var previousLineBreak = -1;
      var plain = isPlainSafeFirst(codePointAt(string, 0)) && isPlainSafeLast(codePointAt(string, string.length - 1));
      if (singleLineOnly || forceQuotes) {
        for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
          char = codePointAt(string, i);
          if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          plain = plain && isPlainSafe(char, prevChar, inblock);
          prevChar = char;
        }
      } else {
        for (i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
          char = codePointAt(string, i);
          if (char === CHAR_LINE_FEED) {
            hasLineBreak = true;
            if (shouldTrackWidth) {
              hasFoldableLine = hasFoldableLine || i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
              previousLineBreak = i;
            }
          } else if (!isPrintable(char)) {
            return STYLE_DOUBLE;
          }
          plain = plain && isPlainSafe(char, prevChar, inblock);
          prevChar = char;
        }
        hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ");
      }
      if (!hasLineBreak && !hasFoldableLine) {
        if (plain && !forceQuotes && !testAmbiguousType(string)) {
          return STYLE_PLAIN;
        }
        return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
      }
      if (indentPerLevel > 9 && needIndentIndicator(string)) {
        return STYLE_DOUBLE;
      }
      if (!forceQuotes) {
        return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
      }
      return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
    }
    function writeScalar(state, string, level, iskey, inblock) {
      state.dump = function() {
        if (string.length === 0) {
          return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
        }
        if (!state.noCompatMode) {
          if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
            return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string + '"' : "'" + string + "'";
          }
        }
        var indent = state.indent * Math.max(1, level);
        var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
        var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
        function testAmbiguity(string2) {
          return testImplicitResolving(state, string2);
        }
        switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {
          case STYLE_PLAIN:
            return string;
          case STYLE_SINGLE:
            return "'" + string.replace(/'/g, "''") + "'";
          case STYLE_LITERAL:
            return "|" + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
          case STYLE_FOLDED:
            return ">" + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
          case STYLE_DOUBLE:
            return '"' + escapeString(string, lineWidth) + '"';
          default:
            throw new YAMLException("impossible error: invalid scalar style");
        }
      }();
    }
    function blockHeader(string, indentPerLevel) {
      var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
      var clip = string[string.length - 1] === "\n";
      var keep = clip && (string[string.length - 2] === "\n" || string === "\n");
      var chomp = keep ? "+" : clip ? "" : "-";
      return indentIndicator + chomp + "\n";
    }
    function dropEndingNewline(string) {
      return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
    }
    function foldString(string, width) {
      var lineRe = /(\n+)([^\n]*)/g;
      var result = function() {
        var nextLF = string.indexOf("\n");
        nextLF = nextLF !== -1 ? nextLF : string.length;
        lineRe.lastIndex = nextLF;
        return foldLine(string.slice(0, nextLF), width);
      }();
      var prevMoreIndented = string[0] === "\n" || string[0] === " ";
      var moreIndented;
      var match;
      while (match = lineRe.exec(string)) {
        var prefix = match[1], line = match[2];
        moreIndented = line[0] === " ";
        result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
        prevMoreIndented = moreIndented;
      }
      return result;
    }
    function foldLine(line, width) {
      if (line === "" || line[0] === " ")
        return line;
      var breakRe = / [^ ]/g;
      var match;
      var start = 0, end, curr = 0, next = 0;
      var result = "";
      while (match = breakRe.exec(line)) {
        next = match.index;
        if (next - start > width) {
          end = curr > start ? curr : next;
          result += "\n" + line.slice(start, end);
          start = end + 1;
        }
        curr = next;
      }
      result += "\n";
      if (line.length - start > width && curr > start) {
        result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
      } else {
        result += line.slice(start);
      }
      return result.slice(1);
    }
    function escapeString(string) {
      var result = "";
      var char = 0;
      var escapeSeq;
      for (var i = 0; i < string.length; char >= 65536 ? i += 2 : i++) {
        char = codePointAt(string, i);
        escapeSeq = ESCAPE_SEQUENCES[char];
        if (!escapeSeq && isPrintable(char)) {
          result += string[i];
          if (char >= 65536)
            result += string[i + 1];
        } else {
          result += escapeSeq || encodeHex(char);
        }
      }
      return result;
    }
    function writeFlowSequence(state, level, object) {
      var _result = "", _tag = state.tag, index, length, value;
      for (index = 0, length = object.length; index < length; index += 1) {
        value = object[index];
        if (state.replacer) {
          value = state.replacer.call(object, String(index), value);
        }
        if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
          if (_result !== "")
            _result += "," + (!state.condenseFlow ? " " : "");
          _result += state.dump;
        }
      }
      state.tag = _tag;
      state.dump = "[" + _result + "]";
    }
    function writeBlockSequence(state, level, object, compact) {
      var _result = "", _tag = state.tag, index, length, value;
      for (index = 0, length = object.length; index < length; index += 1) {
        value = object[index];
        if (state.replacer) {
          value = state.replacer.call(object, String(index), value);
        }
        if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
          if (!compact || _result !== "") {
            _result += generateNextLine(state, level);
          }
          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            _result += "-";
          } else {
            _result += "- ";
          }
          _result += state.dump;
        }
      }
      state.tag = _tag;
      state.dump = _result || "[]";
    }
    function writeFlowMapping(state, level, object) {
      var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
      for (index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = "";
        if (_result !== "")
          pairBuffer += ", ";
        if (state.condenseFlow)
          pairBuffer += '"';
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (state.replacer) {
          objectValue = state.replacer.call(object, objectKey, objectValue);
        }
        if (!writeNode(state, level, objectKey, false, false)) {
          continue;
        }
        if (state.dump.length > 1024)
          pairBuffer += "? ";
        pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
        if (!writeNode(state, level, objectValue, false, false)) {
          continue;
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
      }
      state.tag = _tag;
      state.dump = "{" + _result + "}";
    }
    function writeBlockMapping(state, level, object, compact) {
      var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
      if (state.sortKeys === true) {
        objectKeyList.sort();
      } else if (typeof state.sortKeys === "function") {
        objectKeyList.sort(state.sortKeys);
      } else if (state.sortKeys) {
        throw new YAMLException("sortKeys must be a boolean or a function");
      }
      for (index = 0, length = objectKeyList.length; index < length; index += 1) {
        pairBuffer = "";
        if (!compact || _result !== "") {
          pairBuffer += generateNextLine(state, level);
        }
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (state.replacer) {
          objectValue = state.replacer.call(object, objectKey, objectValue);
        }
        if (!writeNode(state, level + 1, objectKey, true, true, true)) {
          continue;
        }
        explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
        if (explicitPair) {
          if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            pairBuffer += "?";
          } else {
            pairBuffer += "? ";
          }
        }
        pairBuffer += state.dump;
        if (explicitPair) {
          pairBuffer += generateNextLine(state, level);
        }
        if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
          continue;
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += ":";
        } else {
          pairBuffer += ": ";
        }
        pairBuffer += state.dump;
        _result += pairBuffer;
      }
      state.tag = _tag;
      state.dump = _result || "{}";
    }
    function detectType(state, object, explicit) {
      var _result, typeList, index, length, type, style;
      typeList = explicit ? state.explicitTypes : state.implicitTypes;
      for (index = 0, length = typeList.length; index < length; index += 1) {
        type = typeList[index];
        if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
          if (explicit) {
            if (type.multi && type.representName) {
              state.tag = type.representName(object);
            } else {
              state.tag = type.tag;
            }
          } else {
            state.tag = "?";
          }
          if (type.represent) {
            style = state.styleMap[type.tag] || type.defaultStyle;
            if (_toString.call(type.represent) === "[object Function]") {
              _result = type.represent(object, style);
            } else if (_hasOwnProperty.call(type.represent, style)) {
              _result = type.represent[style](object, style);
            } else {
              throw new YAMLException("!<" + type.tag + '> tag resolver accepts not "' + style + '" style');
            }
            state.dump = _result;
          }
          return true;
        }
      }
      return false;
    }
    function writeNode(state, level, object, block, compact, iskey, isblockseq) {
      state.tag = null;
      state.dump = object;
      if (!detectType(state, object, false)) {
        detectType(state, object, true);
      }
      var type = _toString.call(state.dump);
      var inblock = block;
      var tagStr;
      if (block) {
        block = state.flowLevel < 0 || state.flowLevel > level;
      }
      var objectOrArray = type === "[object Object]" || type === "[object Array]", duplicateIndex, duplicate;
      if (objectOrArray) {
        duplicateIndex = state.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
      }
      if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
        compact = false;
      }
      if (duplicate && state.usedDuplicates[duplicateIndex]) {
        state.dump = "*ref_" + duplicateIndex;
      } else {
        if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
          state.usedDuplicates[duplicateIndex] = true;
        }
        if (type === "[object Object]") {
          if (block && Object.keys(state.dump).length !== 0) {
            writeBlockMapping(state, level, state.dump, compact);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + state.dump;
            }
          } else {
            writeFlowMapping(state, level, state.dump);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + " " + state.dump;
            }
          }
        } else if (type === "[object Array]") {
          if (block && state.dump.length !== 0) {
            if (state.noArrayIndent && !isblockseq && level > 0) {
              writeBlockSequence(state, level - 1, state.dump, compact);
            } else {
              writeBlockSequence(state, level, state.dump, compact);
            }
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + state.dump;
            }
          } else {
            writeFlowSequence(state, level, state.dump);
            if (duplicate) {
              state.dump = "&ref_" + duplicateIndex + " " + state.dump;
            }
          }
        } else if (type === "[object String]") {
          if (state.tag !== "?") {
            writeScalar(state, state.dump, level, iskey, inblock);
          }
        } else if (type === "[object Undefined]") {
          return false;
        } else {
          if (state.skipInvalid)
            return false;
          throw new YAMLException("unacceptable kind of an object to dump " + type);
        }
        if (state.tag !== null && state.tag !== "?") {
          tagStr = encodeURI(state.tag[0] === "!" ? state.tag.slice(1) : state.tag).replace(/!/g, "%21");
          if (state.tag[0] === "!") {
            tagStr = "!" + tagStr;
          } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
            tagStr = "!!" + tagStr.slice(18);
          } else {
            tagStr = "!<" + tagStr + ">";
          }
          state.dump = tagStr + " " + state.dump;
        }
      }
      return true;
    }
    function getDuplicateReferences(object, state) {
      var objects = [], duplicatesIndexes = [], index, length;
      inspectNode(object, objects, duplicatesIndexes);
      for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
        state.duplicates.push(objects[duplicatesIndexes[index]]);
      }
      state.usedDuplicates = new Array(length);
    }
    function inspectNode(object, objects, duplicatesIndexes) {
      var objectKeyList, index, length;
      if (object !== null && typeof object === "object") {
        index = objects.indexOf(object);
        if (index !== -1) {
          if (duplicatesIndexes.indexOf(index) === -1) {
            duplicatesIndexes.push(index);
          }
        } else {
          objects.push(object);
          if (Array.isArray(object)) {
            for (index = 0, length = object.length; index < length; index += 1) {
              inspectNode(object[index], objects, duplicatesIndexes);
            }
          } else {
            objectKeyList = Object.keys(object);
            for (index = 0, length = objectKeyList.length; index < length; index += 1) {
              inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
            }
          }
        }
      }
    }
    function dump(input, options) {
      options = options || {};
      var state = new State(options);
      if (!state.noRefs)
        getDuplicateReferences(input, state);
      var value = input;
      if (state.replacer) {
        value = state.replacer.call({ "": value }, "", value);
      }
      if (writeNode(state, 0, value, true, true))
        return state.dump + "\n";
      return "";
    }
    module2.exports.dump = dump;
  }
});

// node_modules/js-yaml/index.js
var require_js_yaml = __commonJS({
  "node_modules/js-yaml/index.js"(exports, module2) {
    "use strict";
    var loader = require_loader();
    var dumper = require_dumper();
    function renamed(from, to) {
      return function() {
        throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
      };
    }
    module2.exports.Type = require_type();
    module2.exports.Schema = require_schema6();
    module2.exports.FAILSAFE_SCHEMA = require_failsafe();
    module2.exports.JSON_SCHEMA = require_json2();
    module2.exports.CORE_SCHEMA = require_core();
    module2.exports.DEFAULT_SCHEMA = require_default();
    module2.exports.load = loader.load;
    module2.exports.loadAll = loader.loadAll;
    module2.exports.dump = dumper.dump;
    module2.exports.YAMLException = require_exception();
    module2.exports.types = {
      binary: require_binary(),
      float: require_float(),
      map: require_map(),
      null: require_null(),
      pairs: require_pairs(),
      set: require_set(),
      timestamp: require_timestamp(),
      bool: require_bool(),
      int: require_int(),
      merge: require_merge2(),
      omap: require_omap(),
      seq: require_seq(),
      str: require_str()
    };
    module2.exports.safeLoad = renamed("safeLoad", "load");
    module2.exports.safeLoadAll = renamed("safeLoadAll", "loadAll");
    module2.exports.safeDump = renamed("safeDump", "dump");
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/parsers/yaml.js
var require_yaml = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/parsers/yaml.js"(exports, module2) {
    "use strict";
    var { ParserError } = require_errors();
    var yaml = require_js_yaml();
    module2.exports = {
      order: 200,
      allowEmpty: true,
      canParse: [".yaml", ".yml", ".json"],
      async parse(file) {
        let data = file.data;
        if (Buffer.isBuffer(data)) {
          data = data.toString();
        }
        if (typeof data === "string") {
          try {
            return yaml.load(data);
          } catch (e) {
            throw new ParserError(e.message, file.url);
          }
        } else {
          return data;
        }
      }
    };
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/parsers/text.js
var require_text = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/parsers/text.js"(exports, module2) {
    "use strict";
    var { ParserError } = require_errors();
    var TEXT_REGEXP = /\.(txt|htm|html|md|xml|js|min|map|css|scss|less|svg)$/i;
    module2.exports = {
      order: 300,
      allowEmpty: true,
      encoding: "utf8",
      canParse(file) {
        return (typeof file.data === "string" || Buffer.isBuffer(file.data)) && TEXT_REGEXP.test(file.url);
      },
      parse(file) {
        if (typeof file.data === "string") {
          return file.data;
        } else if (Buffer.isBuffer(file.data)) {
          return file.data.toString(this.encoding);
        } else {
          throw new ParserError("data is not text", file.url);
        }
      }
    };
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/parsers/binary.js
var require_binary2 = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/parsers/binary.js"(exports, module2) {
    "use strict";
    var BINARY_REGEXP = /\.(jpeg|jpg|gif|png|bmp|ico)$/i;
    module2.exports = {
      order: 400,
      allowEmpty: true,
      canParse(file) {
        return Buffer.isBuffer(file.data) && BINARY_REGEXP.test(file.url);
      },
      parse(file) {
        if (Buffer.isBuffer(file.data)) {
          return file.data;
        } else {
          return Buffer.from(file.data);
        }
      }
    };
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/resolvers/file.js
var require_file = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/resolvers/file.js"(exports, module2) {
    "use strict";
    var fs2 = require("fs");
    var { ono } = require_cjs();
    var url = require_url();
    var { ResolverError } = require_errors();
    module2.exports = {
      order: 100,
      canRead(file) {
        return url.isFileSystemPath(file.url);
      },
      read(file) {
        return new Promise((resolve2, reject) => {
          let path2;
          try {
            path2 = url.toFileSystemPath(file.url);
          } catch (err) {
            reject(new ResolverError(ono.uri(err, `Malformed URI: ${file.url}`), file.url));
          }
          try {
            fs2.readFile(path2, (err, data) => {
              if (err) {
                reject(new ResolverError(ono(err, `Error opening file "${path2}"`), path2));
              } else {
                resolve2(data);
              }
            });
          } catch (err) {
            reject(new ResolverError(ono(err, `Error opening file "${path2}"`), path2));
          }
        });
      }
    };
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/resolvers/http.js
var require_http = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/resolvers/http.js"(exports, module2) {
    "use strict";
    var http = require("http");
    var https = require("https");
    var { ono } = require_cjs();
    var url = require_url();
    var { ResolverError } = require_errors();
    module2.exports = {
      order: 200,
      headers: null,
      timeout: 5e3,
      redirects: 5,
      withCredentials: false,
      canRead(file) {
        return url.isHttp(file.url);
      },
      read(file) {
        let u = url.parse(file.url);
        if (process.browser && !u.protocol) {
          u.protocol = url.parse(location.href).protocol;
        }
        return download(u, this);
      }
    };
    function download(u, httpOptions, redirects) {
      return new Promise((resolve2, reject) => {
        u = url.parse(u);
        redirects = redirects || [];
        redirects.push(u.href);
        get(u, httpOptions).then((res) => {
          if (res.statusCode >= 400) {
            throw ono({ status: res.statusCode }, `HTTP ERROR ${res.statusCode}`);
          } else if (res.statusCode >= 300) {
            if (redirects.length > httpOptions.redirects) {
              reject(new ResolverError(ono({ status: res.statusCode }, `Error downloading ${redirects[0]}. 
Too many redirects: 
  ${redirects.join(" \n  ")}`)));
            } else if (!res.headers.location) {
              throw ono({ status: res.statusCode }, `HTTP ${res.statusCode} redirect with no location header`);
            } else {
              let redirectTo = url.resolve(u, res.headers.location);
              download(redirectTo, httpOptions, redirects).then(resolve2, reject);
            }
          } else {
            resolve2(res.body || Buffer.alloc(0));
          }
        }).catch((err) => {
          reject(new ResolverError(ono(err, `Error downloading ${u.href}`), u.href));
        });
      });
    }
    function get(u, httpOptions) {
      return new Promise((resolve2, reject) => {
        let protocol = u.protocol === "https:" ? https : http;
        let req = protocol.get({
          hostname: u.hostname,
          port: u.port,
          path: u.path,
          auth: u.auth,
          protocol: u.protocol,
          headers: httpOptions.headers || {},
          withCredentials: httpOptions.withCredentials
        });
        if (typeof req.setTimeout === "function") {
          req.setTimeout(httpOptions.timeout);
        }
        req.on("timeout", () => {
          req.abort();
        });
        req.on("error", reject);
        req.once("response", (res) => {
          res.body = Buffer.alloc(0);
          res.on("data", (data) => {
            res.body = Buffer.concat([res.body, Buffer.from(data)]);
          });
          res.on("error", reject);
          res.on("end", () => {
            resolve2(res);
          });
        });
      });
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/options.js
var require_options = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/options.js"(exports, module2) {
    "use strict";
    var jsonParser = require_json();
    var yamlParser = require_yaml();
    var textParser = require_text();
    var binaryParser = require_binary2();
    var fileResolver = require_file();
    var httpResolver = require_http();
    module2.exports = $RefParserOptions;
    function $RefParserOptions(options) {
      merge(this, $RefParserOptions.defaults);
      merge(this, options);
    }
    $RefParserOptions.defaults = {
      parse: {
        json: jsonParser,
        yaml: yamlParser,
        text: textParser,
        binary: binaryParser
      },
      resolve: {
        file: fileResolver,
        http: httpResolver,
        external: true
      },
      continueOnError: false,
      dereference: {
        circular: true
      }
    };
    function merge(target, source) {
      if (isMergeable(source)) {
        let keys = Object.keys(source);
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          let sourceSetting = source[key];
          let targetSetting = target[key];
          if (isMergeable(sourceSetting)) {
            target[key] = merge(targetSetting || {}, sourceSetting);
          } else if (sourceSetting !== void 0) {
            target[key] = sourceSetting;
          }
        }
      }
      return target;
    }
    function isMergeable(val) {
      return val && typeof val === "object" && !Array.isArray(val) && !(val instanceof RegExp) && !(val instanceof Date);
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/normalize-args.js
var require_normalize_args = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/normalize-args.js"(exports, module2) {
    "use strict";
    var Options = require_options();
    module2.exports = normalizeArgs;
    function normalizeArgs(args) {
      let path2, schema, options, callback;
      args = Array.prototype.slice.call(args);
      if (typeof args[args.length - 1] === "function") {
        callback = args.pop();
      }
      if (typeof args[0] === "string") {
        path2 = args[0];
        if (typeof args[2] === "object") {
          schema = args[1];
          options = args[2];
        } else {
          schema = void 0;
          options = args[1];
        }
      } else {
        path2 = "";
        schema = args[0];
        options = args[1];
      }
      if (!(options instanceof Options)) {
        options = new Options(options);
      }
      return {
        path: path2,
        schema,
        options,
        callback
      };
    }
  }
});

// node_modules/@apidevtools/swagger-parser/lib/options.js
var require_options2 = __commonJS({
  "node_modules/@apidevtools/swagger-parser/lib/options.js"(exports, module2) {
    "use strict";
    var $RefParserOptions = require_options();
    var schemaValidator = require_schema5();
    var specValidator = require_spec();
    var util = require("util");
    module2.exports = ParserOptions;
    function ParserOptions(_options) {
      $RefParserOptions.call(this, ParserOptions.defaults);
      $RefParserOptions.apply(this, arguments);
    }
    ParserOptions.defaults = {
      validate: {
        schema: schemaValidator,
        spec: specValidator
      }
    };
    util.inherits(ParserOptions, $RefParserOptions);
  }
});

// node_modules/call-me-maybe/index.js
var require_call_me_maybe = __commonJS({
  "node_modules/call-me-maybe/index.js"(exports, module2) {
    "use strict";
    var next = global.process && process.nextTick || global.setImmediate || function(f) {
      setTimeout(f, 0);
    };
    module2.exports = function maybe(cb, promise) {
      if (cb) {
        promise.then(function(result) {
          next(function() {
            cb(null, result);
          });
        }, function(err) {
          next(function() {
            cb(err);
          });
        });
        return void 0;
      } else {
        return promise;
      }
    };
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/pointer.js
var require_pointer = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/pointer.js"(exports, module2) {
    "use strict";
    module2.exports = Pointer;
    var $Ref = require_ref();
    var url = require_url();
    var { JSONParserError, InvalidPointerError, MissingPointerError, isHandledError } = require_errors();
    var slashes = /\//g;
    var tildes = /~/g;
    var escapedSlash = /~1/g;
    var escapedTilde = /~0/g;
    function Pointer($ref, path2, friendlyPath) {
      this.$ref = $ref;
      this.path = path2;
      this.originalPath = friendlyPath || path2;
      this.value = void 0;
      this.circular = false;
      this.indirections = 0;
    }
    Pointer.prototype.resolve = function(obj, options, pathFromRoot) {
      let tokens = Pointer.parse(this.path, this.originalPath);
      this.value = unwrapOrThrow(obj);
      for (let i = 0; i < tokens.length; i++) {
        if (resolveIf$Ref(this, options)) {
          this.path = Pointer.join(this.path, tokens.slice(i));
        }
        if (typeof this.value === "object" && this.value !== null && "$ref" in this.value) {
          return this;
        }
        let token = tokens[i];
        if (this.value[token] === void 0 || this.value[token] === null) {
          this.value = null;
          throw new MissingPointerError(token, this.originalPath);
        } else {
          this.value = this.value[token];
        }
      }
      if (!this.value || this.value.$ref && url.resolve(this.path, this.value.$ref) !== pathFromRoot) {
        resolveIf$Ref(this, options);
      }
      return this;
    };
    Pointer.prototype.set = function(obj, value, options) {
      let tokens = Pointer.parse(this.path);
      let token;
      if (tokens.length === 0) {
        this.value = value;
        return value;
      }
      this.value = unwrapOrThrow(obj);
      for (let i = 0; i < tokens.length - 1; i++) {
        resolveIf$Ref(this, options);
        token = tokens[i];
        if (this.value && this.value[token] !== void 0) {
          this.value = this.value[token];
        } else {
          this.value = setValue(this, token, {});
        }
      }
      resolveIf$Ref(this, options);
      token = tokens[tokens.length - 1];
      setValue(this, token, value);
      return obj;
    };
    Pointer.parse = function(path2, originalPath) {
      let pointer = url.getHash(path2).substr(1);
      if (!pointer) {
        return [];
      }
      pointer = pointer.split("/");
      for (let i = 0; i < pointer.length; i++) {
        pointer[i] = decodeURIComponent(pointer[i].replace(escapedSlash, "/").replace(escapedTilde, "~"));
      }
      if (pointer[0] !== "") {
        throw new InvalidPointerError(pointer, originalPath === void 0 ? path2 : originalPath);
      }
      return pointer.slice(1);
    };
    Pointer.join = function(base, tokens) {
      if (base.indexOf("#") === -1) {
        base += "#";
      }
      tokens = Array.isArray(tokens) ? tokens : [tokens];
      for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        base += "/" + encodeURIComponent(token.replace(tildes, "~0").replace(slashes, "~1"));
      }
      return base;
    };
    function resolveIf$Ref(pointer, options) {
      if ($Ref.isAllowed$Ref(pointer.value, options)) {
        let $refPath = url.resolve(pointer.path, pointer.value.$ref);
        if ($refPath === pointer.path) {
          pointer.circular = true;
        } else {
          let resolved = pointer.$ref.$refs._resolve($refPath, pointer.path, options);
          if (resolved === null) {
            return false;
          }
          pointer.indirections += resolved.indirections + 1;
          if ($Ref.isExtended$Ref(pointer.value)) {
            pointer.value = $Ref.dereference(pointer.value, resolved.value);
            return false;
          } else {
            pointer.$ref = resolved.$ref;
            pointer.path = resolved.path;
            pointer.value = resolved.value;
          }
          return true;
        }
      }
    }
    function setValue(pointer, token, value) {
      if (pointer.value && typeof pointer.value === "object") {
        if (token === "-" && Array.isArray(pointer.value)) {
          pointer.value.push(value);
        } else {
          pointer.value[token] = value;
        }
      } else {
        throw new JSONParserError(`Error assigning $ref pointer "${pointer.path}". 
Cannot set "${token}" of a non-object.`);
      }
      return value;
    }
    function unwrapOrThrow(value) {
      if (isHandledError(value)) {
        throw value;
      }
      return value;
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/ref.js
var require_ref = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/ref.js"(exports, module2) {
    "use strict";
    module2.exports = $Ref;
    var Pointer = require_pointer();
    var { InvalidPointerError, isHandledError, normalizeError } = require_errors();
    var { safePointerToPath, stripHash, getHash } = require_url();
    function $Ref() {
      this.path = void 0;
      this.value = void 0;
      this.$refs = void 0;
      this.pathType = void 0;
      this.errors = void 0;
    }
    $Ref.prototype.addError = function(err) {
      if (this.errors === void 0) {
        this.errors = [];
      }
      const existingErrors = this.errors.map(({ footprint }) => footprint);
      if (Array.isArray(err.errors)) {
        this.errors.push(...err.errors.map(normalizeError).filter(({ footprint }) => !existingErrors.includes(footprint)));
      } else if (!existingErrors.includes(err.footprint)) {
        this.errors.push(normalizeError(err));
      }
    };
    $Ref.prototype.exists = function(path2, options) {
      try {
        this.resolve(path2, options);
        return true;
      } catch (e) {
        return false;
      }
    };
    $Ref.prototype.get = function(path2, options) {
      return this.resolve(path2, options).value;
    };
    $Ref.prototype.resolve = function(path2, options, friendlyPath, pathFromRoot) {
      let pointer = new Pointer(this, path2, friendlyPath);
      try {
        return pointer.resolve(this.value, options, pathFromRoot);
      } catch (err) {
        if (!options || !options.continueOnError || !isHandledError(err)) {
          throw err;
        }
        if (err.path === null) {
          err.path = safePointerToPath(getHash(pathFromRoot));
        }
        if (err instanceof InvalidPointerError) {
          err.source = stripHash(pathFromRoot);
        }
        this.addError(err);
        return null;
      }
    };
    $Ref.prototype.set = function(path2, value) {
      let pointer = new Pointer(this, path2);
      this.value = pointer.set(this.value, value);
    };
    $Ref.is$Ref = function(value) {
      return value && typeof value === "object" && typeof value.$ref === "string" && value.$ref.length > 0;
    };
    $Ref.isExternal$Ref = function(value) {
      return $Ref.is$Ref(value) && value.$ref[0] !== "#";
    };
    $Ref.isAllowed$Ref = function(value, options) {
      if ($Ref.is$Ref(value)) {
        if (value.$ref.substr(0, 2) === "#/" || value.$ref === "#") {
          return true;
        } else if (value.$ref[0] !== "#" && (!options || options.resolve.external)) {
          return true;
        }
      }
    };
    $Ref.isExtended$Ref = function(value) {
      return $Ref.is$Ref(value) && Object.keys(value).length > 1;
    };
    $Ref.dereference = function($ref, resolvedValue) {
      if (resolvedValue && typeof resolvedValue === "object" && $Ref.isExtended$Ref($ref)) {
        let merged = {};
        for (let key of Object.keys($ref)) {
          if (key !== "$ref") {
            merged[key] = $ref[key];
          }
        }
        for (let key of Object.keys(resolvedValue)) {
          if (!(key in merged)) {
            merged[key] = resolvedValue[key];
          }
        }
        return merged;
      } else {
        return resolvedValue;
      }
    };
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/refs.js
var require_refs = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/refs.js"(exports, module2) {
    "use strict";
    var { ono } = require_cjs();
    var $Ref = require_ref();
    var url = require_url();
    module2.exports = $Refs;
    function $Refs() {
      this.circular = false;
      this._$refs = {};
      this._root$Ref = null;
    }
    $Refs.prototype.paths = function(types) {
      let paths = getPaths(this._$refs, arguments);
      return paths.map((path2) => {
        return path2.decoded;
      });
    };
    $Refs.prototype.values = function(types) {
      let $refs = this._$refs;
      let paths = getPaths($refs, arguments);
      return paths.reduce((obj, path2) => {
        obj[path2.decoded] = $refs[path2.encoded].value;
        return obj;
      }, {});
    };
    $Refs.prototype.toJSON = $Refs.prototype.values;
    $Refs.prototype.exists = function(path2, options) {
      try {
        this._resolve(path2, "", options);
        return true;
      } catch (e) {
        return false;
      }
    };
    $Refs.prototype.get = function(path2, options) {
      return this._resolve(path2, "", options).value;
    };
    $Refs.prototype.set = function(path2, value) {
      let absPath = url.resolve(this._root$Ref.path, path2);
      let withoutHash = url.stripHash(absPath);
      let $ref = this._$refs[withoutHash];
      if (!$ref) {
        throw ono(`Error resolving $ref pointer "${path2}". 
"${withoutHash}" not found.`);
      }
      $ref.set(absPath, value);
    };
    $Refs.prototype._add = function(path2) {
      let withoutHash = url.stripHash(path2);
      let $ref = new $Ref();
      $ref.path = withoutHash;
      $ref.$refs = this;
      this._$refs[withoutHash] = $ref;
      this._root$Ref = this._root$Ref || $ref;
      return $ref;
    };
    $Refs.prototype._resolve = function(path2, pathFromRoot, options) {
      let absPath = url.resolve(this._root$Ref.path, path2);
      let withoutHash = url.stripHash(absPath);
      let $ref = this._$refs[withoutHash];
      if (!$ref) {
        throw ono(`Error resolving $ref pointer "${path2}". 
"${withoutHash}" not found.`);
      }
      return $ref.resolve(absPath, options, path2, pathFromRoot);
    };
    $Refs.prototype._get$Ref = function(path2) {
      path2 = url.resolve(this._root$Ref.path, path2);
      let withoutHash = url.stripHash(path2);
      return this._$refs[withoutHash];
    };
    function getPaths($refs, types) {
      let paths = Object.keys($refs);
      types = Array.isArray(types[0]) ? types[0] : Array.prototype.slice.call(types);
      if (types.length > 0 && types[0]) {
        paths = paths.filter((key) => {
          return types.indexOf($refs[key].pathType) !== -1;
        });
      }
      return paths.map((path2) => {
        return {
          encoded: path2,
          decoded: $refs[path2].pathType === "file" ? url.toFileSystemPath(path2, true) : path2
        };
      });
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/util/plugins.js
var require_plugins = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/util/plugins.js"(exports) {
    "use strict";
    exports.all = function(plugins) {
      return Object.keys(plugins).filter((key) => {
        return typeof plugins[key] === "object";
      }).map((key) => {
        plugins[key].name = key;
        return plugins[key];
      });
    };
    exports.filter = function(plugins, method, file) {
      return plugins.filter((plugin) => {
        return !!getResult(plugin, method, file);
      });
    };
    exports.sort = function(plugins) {
      for (let plugin of plugins) {
        plugin.order = plugin.order || Number.MAX_SAFE_INTEGER;
      }
      return plugins.sort((a, b) => {
        return a.order - b.order;
      });
    };
    exports.run = function(plugins, method, file, $refs) {
      let plugin, lastError, index = 0;
      return new Promise((resolve2, reject) => {
        runNextPlugin();
        function runNextPlugin() {
          plugin = plugins[index++];
          if (!plugin) {
            return reject(lastError);
          }
          try {
            let result = getResult(plugin, method, file, callback, $refs);
            if (result && typeof result.then === "function") {
              result.then(onSuccess, onError);
            } else if (result !== void 0) {
              onSuccess(result);
            } else if (index === plugins.length) {
              throw new Error("No promise has been returned or callback has been called.");
            }
          } catch (e) {
            onError(e);
          }
        }
        function callback(err, result) {
          if (err) {
            onError(err);
          } else {
            onSuccess(result);
          }
        }
        function onSuccess(result) {
          resolve2({
            plugin,
            result
          });
        }
        function onError(error) {
          lastError = {
            plugin,
            error
          };
          runNextPlugin();
        }
      });
    };
    function getResult(obj, prop, file, callback, $refs) {
      let value = obj[prop];
      if (typeof value === "function") {
        return value.apply(obj, [file, callback, $refs]);
      }
      if (!callback) {
        if (value instanceof RegExp) {
          return value.test(file.url);
        } else if (typeof value === "string") {
          return value === file.extension;
        } else if (Array.isArray(value)) {
          return value.indexOf(file.extension) !== -1;
        }
      }
      return value;
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/parse.js
var require_parse = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/parse.js"(exports, module2) {
    "use strict";
    var { ono } = require_cjs();
    var url = require_url();
    var plugins = require_plugins();
    var { ResolverError, ParserError, UnmatchedParserError, UnmatchedResolverError, isHandledError } = require_errors();
    module2.exports = parse;
    async function parse(path2, $refs, options) {
      path2 = url.stripHash(path2);
      let $ref = $refs._add(path2);
      let file = {
        url: path2,
        extension: url.getExtension(path2)
      };
      try {
        const resolver = await readFile(file, options, $refs);
        $ref.pathType = resolver.plugin.name;
        file.data = resolver.result;
        const parser = await parseFile(file, options, $refs);
        $ref.value = parser.result;
        return parser.result;
      } catch (err) {
        if (isHandledError(err)) {
          $ref.value = err;
        }
        throw err;
      }
    }
    function readFile(file, options, $refs) {
      return new Promise((resolve2, reject) => {
        let resolvers = plugins.all(options.resolve);
        resolvers = plugins.filter(resolvers, "canRead", file);
        plugins.sort(resolvers);
        plugins.run(resolvers, "read", file, $refs).then(resolve2, onError);
        function onError(err) {
          if (!err && options.continueOnError) {
            reject(new UnmatchedResolverError(file.url));
          } else if (!err || !("error" in err)) {
            reject(ono.syntax(`Unable to resolve $ref pointer "${file.url}"`));
          } else if (err.error instanceof ResolverError) {
            reject(err.error);
          } else {
            reject(new ResolverError(err, file.url));
          }
        }
      });
    }
    function parseFile(file, options, $refs) {
      return new Promise((resolve2, reject) => {
        let allParsers = plugins.all(options.parse);
        let filteredParsers = plugins.filter(allParsers, "canParse", file);
        let parsers = filteredParsers.length > 0 ? filteredParsers : allParsers;
        plugins.sort(parsers);
        plugins.run(parsers, "parse", file, $refs).then(onParsed, onError);
        function onParsed(parser) {
          if (!parser.plugin.allowEmpty && isEmpty(parser.result)) {
            reject(ono.syntax(`Error parsing "${file.url}" as ${parser.plugin.name}. 
Parsed value is empty`));
          } else {
            resolve2(parser);
          }
        }
        function onError(err) {
          if (!err && options.continueOnError) {
            reject(new UnmatchedParserError(file.url));
          } else if (!err || !("error" in err)) {
            reject(ono.syntax(`Unable to parse ${file.url}`));
          } else if (err.error instanceof ParserError) {
            reject(err.error);
          } else {
            reject(new ParserError(err.error.message, file.url));
          }
        }
      });
    }
    function isEmpty(value) {
      return value === void 0 || typeof value === "object" && Object.keys(value).length === 0 || typeof value === "string" && value.trim().length === 0 || Buffer.isBuffer(value) && value.length === 0;
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/resolve-external.js
var require_resolve_external = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/resolve-external.js"(exports, module2) {
    "use strict";
    var $Ref = require_ref();
    var Pointer = require_pointer();
    var parse = require_parse();
    var url = require_url();
    var { isHandledError } = require_errors();
    module2.exports = resolveExternal;
    function resolveExternal(parser, options) {
      if (!options.resolve.external) {
        return Promise.resolve();
      }
      try {
        let promises = crawl(parser.schema, parser.$refs._root$Ref.path + "#", parser.$refs, options);
        return Promise.all(promises);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    function crawl(obj, path2, $refs, options, seen) {
      seen = seen || new Set();
      let promises = [];
      if (obj && typeof obj === "object" && !ArrayBuffer.isView(obj) && !seen.has(obj)) {
        seen.add(obj);
        if ($Ref.isExternal$Ref(obj)) {
          promises.push(resolve$Ref(obj, path2, $refs, options));
        } else {
          for (let key of Object.keys(obj)) {
            let keyPath = Pointer.join(path2, key);
            let value = obj[key];
            if ($Ref.isExternal$Ref(value)) {
              promises.push(resolve$Ref(value, keyPath, $refs, options));
            } else {
              promises = promises.concat(crawl(value, keyPath, $refs, options, seen));
            }
          }
        }
      }
      return promises;
    }
    async function resolve$Ref($ref, path2, $refs, options) {
      let resolvedPath = url.resolve(path2, $ref.$ref);
      let withoutHash = url.stripHash(resolvedPath);
      $ref = $refs._$refs[withoutHash];
      if ($ref) {
        return Promise.resolve($ref.value);
      }
      try {
        const result = await parse(resolvedPath, $refs, options);
        let promises = crawl(result, withoutHash + "#", $refs, options);
        return Promise.all(promises);
      } catch (err) {
        if (!options.continueOnError || !isHandledError(err)) {
          throw err;
        }
        if ($refs._$refs[withoutHash]) {
          err.source = url.stripHash(path2);
          err.path = url.safePointerToPath(url.getHash(path2));
        }
        return [];
      }
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/bundle.js
var require_bundle = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/bundle.js"(exports, module2) {
    "use strict";
    var $Ref = require_ref();
    var Pointer = require_pointer();
    var url = require_url();
    module2.exports = bundle;
    function bundle(parser, options) {
      let inventory = [];
      crawl(parser, "schema", parser.$refs._root$Ref.path + "#", "#", 0, inventory, parser.$refs, options);
      remap(inventory);
    }
    function crawl(parent, key, path2, pathFromRoot, indirections, inventory, $refs, options) {
      let obj = key === null ? parent : parent[key];
      if (obj && typeof obj === "object" && !ArrayBuffer.isView(obj)) {
        if ($Ref.isAllowed$Ref(obj)) {
          inventory$Ref(parent, key, path2, pathFromRoot, indirections, inventory, $refs, options);
        } else {
          let keys = Object.keys(obj).sort((a, b) => {
            if (a === "definitions") {
              return -1;
            } else if (b === "definitions") {
              return 1;
            } else {
              return a.length - b.length;
            }
          });
          for (let key2 of keys) {
            let keyPath = Pointer.join(path2, key2);
            let keyPathFromRoot = Pointer.join(pathFromRoot, key2);
            let value = obj[key2];
            if ($Ref.isAllowed$Ref(value)) {
              inventory$Ref(obj, key2, path2, keyPathFromRoot, indirections, inventory, $refs, options);
            } else {
              crawl(obj, key2, keyPath, keyPathFromRoot, indirections, inventory, $refs, options);
            }
          }
        }
      }
    }
    function inventory$Ref($refParent, $refKey, path2, pathFromRoot, indirections, inventory, $refs, options) {
      let $ref = $refKey === null ? $refParent : $refParent[$refKey];
      let $refPath = url.resolve(path2, $ref.$ref);
      let pointer = $refs._resolve($refPath, pathFromRoot, options);
      if (pointer === null) {
        return;
      }
      let depth = Pointer.parse(pathFromRoot).length;
      let file = url.stripHash(pointer.path);
      let hash = url.getHash(pointer.path);
      let external = file !== $refs._root$Ref.path;
      let extended = $Ref.isExtended$Ref($ref);
      indirections += pointer.indirections;
      let existingEntry = findInInventory(inventory, $refParent, $refKey);
      if (existingEntry) {
        if (depth < existingEntry.depth || indirections < existingEntry.indirections) {
          removeFromInventory(inventory, existingEntry);
        } else {
          return;
        }
      }
      inventory.push({
        $ref,
        parent: $refParent,
        key: $refKey,
        pathFromRoot,
        depth,
        file,
        hash,
        value: pointer.value,
        circular: pointer.circular,
        extended,
        external,
        indirections
      });
      if (!existingEntry) {
        crawl(pointer.value, null, pointer.path, pathFromRoot, indirections + 1, inventory, $refs, options);
      }
    }
    function remap(inventory) {
      inventory.sort((a, b) => {
        if (a.file !== b.file) {
          return a.file < b.file ? -1 : 1;
        } else if (a.hash !== b.hash) {
          return a.hash < b.hash ? -1 : 1;
        } else if (a.circular !== b.circular) {
          return a.circular ? -1 : 1;
        } else if (a.extended !== b.extended) {
          return a.extended ? 1 : -1;
        } else if (a.indirections !== b.indirections) {
          return a.indirections - b.indirections;
        } else if (a.depth !== b.depth) {
          return a.depth - b.depth;
        } else {
          let aDefinitionsIndex = a.pathFromRoot.lastIndexOf("/definitions");
          let bDefinitionsIndex = b.pathFromRoot.lastIndexOf("/definitions");
          if (aDefinitionsIndex !== bDefinitionsIndex) {
            return bDefinitionsIndex - aDefinitionsIndex;
          } else {
            return a.pathFromRoot.length - b.pathFromRoot.length;
          }
        }
      });
      let file, hash, pathFromRoot;
      for (let entry of inventory) {
        if (!entry.external) {
          entry.$ref.$ref = entry.hash;
        } else if (entry.file === file && entry.hash === hash) {
          entry.$ref.$ref = pathFromRoot;
        } else if (entry.file === file && entry.hash.indexOf(hash + "/") === 0) {
          entry.$ref.$ref = Pointer.join(pathFromRoot, Pointer.parse(entry.hash.replace(hash, "#")));
        } else {
          file = entry.file;
          hash = entry.hash;
          pathFromRoot = entry.pathFromRoot;
          entry.$ref = entry.parent[entry.key] = $Ref.dereference(entry.$ref, entry.value);
          if (entry.circular) {
            entry.$ref.$ref = entry.pathFromRoot;
          }
        }
      }
    }
    function findInInventory(inventory, $refParent, $refKey) {
      for (let i = 0; i < inventory.length; i++) {
        let existingEntry = inventory[i];
        if (existingEntry.parent === $refParent && existingEntry.key === $refKey) {
          return existingEntry;
        }
      }
    }
    function removeFromInventory(inventory, entry) {
      let index = inventory.indexOf(entry);
      inventory.splice(index, 1);
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/dereference.js
var require_dereference = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/dereference.js"(exports, module2) {
    "use strict";
    var $Ref = require_ref();
    var Pointer = require_pointer();
    var { ono } = require_cjs();
    var url = require_url();
    module2.exports = dereference;
    function dereference(parser, options) {
      let dereferenced = crawl(parser.schema, parser.$refs._root$Ref.path, "#", new Set(), new Set(), new Map(), parser.$refs, options);
      parser.$refs.circular = dereferenced.circular;
      parser.schema = dereferenced.value;
    }
    function crawl(obj, path2, pathFromRoot, parents, processedObjects, dereferencedCache, $refs, options) {
      let dereferenced;
      let result = {
        value: obj,
        circular: false
      };
      if (options.dereference.circular === "ignore" || !processedObjects.has(obj)) {
        if (obj && typeof obj === "object" && !ArrayBuffer.isView(obj)) {
          parents.add(obj);
          processedObjects.add(obj);
          if ($Ref.isAllowed$Ref(obj, options)) {
            dereferenced = dereference$Ref(obj, path2, pathFromRoot, parents, processedObjects, dereferencedCache, $refs, options);
            result.circular = dereferenced.circular;
            result.value = dereferenced.value;
          } else {
            for (const key of Object.keys(obj)) {
              let keyPath = Pointer.join(path2, key);
              let keyPathFromRoot = Pointer.join(pathFromRoot, key);
              let value = obj[key];
              let circular = false;
              if ($Ref.isAllowed$Ref(value, options)) {
                dereferenced = dereference$Ref(value, keyPath, keyPathFromRoot, parents, processedObjects, dereferencedCache, $refs, options);
                circular = dereferenced.circular;
                if (obj[key] !== dereferenced.value) {
                  obj[key] = dereferenced.value;
                }
              } else {
                if (!parents.has(value)) {
                  dereferenced = crawl(value, keyPath, keyPathFromRoot, parents, processedObjects, dereferencedCache, $refs, options);
                  circular = dereferenced.circular;
                  if (obj[key] !== dereferenced.value) {
                    obj[key] = dereferenced.value;
                  }
                } else {
                  circular = foundCircularReference(keyPath, $refs, options);
                }
              }
              result.circular = result.circular || circular;
            }
          }
          parents.delete(obj);
        }
      }
      return result;
    }
    function dereference$Ref($ref, path2, pathFromRoot, parents, processedObjects, dereferencedCache, $refs, options) {
      let $refPath = url.resolve(path2, $ref.$ref);
      const cache = dereferencedCache.get($refPath);
      if (cache) {
        const refKeys = Object.keys($ref);
        if (refKeys.length > 1) {
          const extraKeys = {};
          for (let key of refKeys) {
            if (key !== "$ref" && !(key in cache.value)) {
              extraKeys[key] = $ref[key];
            }
          }
          return {
            circular: cache.circular,
            value: Object.assign({}, cache.value, extraKeys)
          };
        }
        return cache;
      }
      let pointer = $refs._resolve($refPath, path2, options);
      if (pointer === null) {
        return {
          circular: false,
          value: null
        };
      }
      let directCircular = pointer.circular;
      let circular = directCircular || parents.has(pointer.value);
      circular && foundCircularReference(path2, $refs, options);
      let dereferencedValue = $Ref.dereference($ref, pointer.value);
      if (!circular) {
        let dereferenced = crawl(dereferencedValue, pointer.path, pathFromRoot, parents, processedObjects, dereferencedCache, $refs, options);
        circular = dereferenced.circular;
        dereferencedValue = dereferenced.value;
      }
      if (circular && !directCircular && options.dereference.circular === "ignore") {
        dereferencedValue = $ref;
      }
      if (directCircular) {
        dereferencedValue.$ref = pathFromRoot;
      }
      const dereferencedObject = {
        circular,
        value: dereferencedValue
      };
      if (Object.keys($ref).length === 1) {
        dereferencedCache.set($refPath, dereferencedObject);
      }
      return dereferencedObject;
    }
    function foundCircularReference(keyPath, $refs, options) {
      $refs.circular = true;
      if (!options.dereference.circular) {
        throw ono.reference(`Circular $ref pointer found at ${keyPath}`);
      }
      return true;
    }
  }
});

// node_modules/@apidevtools/json-schema-ref-parser/lib/index.js
var require_lib3 = __commonJS({
  "node_modules/@apidevtools/json-schema-ref-parser/lib/index.js"(exports, module2) {
    "use strict";
    var $Refs = require_refs();
    var _parse = require_parse();
    var normalizeArgs = require_normalize_args();
    var resolveExternal = require_resolve_external();
    var _bundle = require_bundle();
    var _dereference = require_dereference();
    var url = require_url();
    var { JSONParserError, InvalidPointerError, MissingPointerError, ResolverError, ParserError, UnmatchedParserError, UnmatchedResolverError, isHandledError, JSONParserErrorGroup } = require_errors();
    var maybe = require_call_me_maybe();
    var { ono } = require_cjs();
    module2.exports = $RefParser;
    module2.exports.default = $RefParser;
    module2.exports.JSONParserError = JSONParserError;
    module2.exports.InvalidPointerError = InvalidPointerError;
    module2.exports.MissingPointerError = MissingPointerError;
    module2.exports.ResolverError = ResolverError;
    module2.exports.ParserError = ParserError;
    module2.exports.UnmatchedParserError = UnmatchedParserError;
    module2.exports.UnmatchedResolverError = UnmatchedResolverError;
    function $RefParser() {
      this.schema = null;
      this.$refs = new $Refs();
    }
    $RefParser.parse = function parse(path2, schema, options, callback) {
      let Class = this;
      let instance = new Class();
      return instance.parse.apply(instance, arguments);
    };
    $RefParser.prototype.parse = async function parse(path2, schema, options, callback) {
      let args = normalizeArgs(arguments);
      let promise;
      if (!args.path && !args.schema) {
        let err = ono(`Expected a file path, URL, or object. Got ${args.path || args.schema}`);
        return maybe(args.callback, Promise.reject(err));
      }
      this.schema = null;
      this.$refs = new $Refs();
      let pathType = "http";
      if (url.isFileSystemPath(args.path)) {
        args.path = url.fromFileSystemPath(args.path);
        pathType = "file";
      }
      args.path = url.resolve(url.cwd(), args.path);
      if (args.schema && typeof args.schema === "object") {
        let $ref = this.$refs._add(args.path);
        $ref.value = args.schema;
        $ref.pathType = pathType;
        promise = Promise.resolve(args.schema);
      } else {
        promise = _parse(args.path, this.$refs, args.options);
      }
      let me = this;
      try {
        let result = await promise;
        if (result !== null && typeof result === "object" && !Buffer.isBuffer(result)) {
          me.schema = result;
          return maybe(args.callback, Promise.resolve(me.schema));
        } else if (args.options.continueOnError) {
          me.schema = null;
          return maybe(args.callback, Promise.resolve(me.schema));
        } else {
          throw ono.syntax(`"${me.$refs._root$Ref.path || result}" is not a valid JSON Schema`);
        }
      } catch (err) {
        if (!args.options.continueOnError || !isHandledError(err)) {
          return maybe(args.callback, Promise.reject(err));
        }
        if (this.$refs._$refs[url.stripHash(args.path)]) {
          this.$refs._$refs[url.stripHash(args.path)].addError(err);
        }
        return maybe(args.callback, Promise.resolve(null));
      }
    };
    $RefParser.resolve = function resolve2(path2, schema, options, callback) {
      let Class = this;
      let instance = new Class();
      return instance.resolve.apply(instance, arguments);
    };
    $RefParser.prototype.resolve = async function resolve2(path2, schema, options, callback) {
      let me = this;
      let args = normalizeArgs(arguments);
      try {
        await this.parse(args.path, args.schema, args.options);
        await resolveExternal(me, args.options);
        finalize(me);
        return maybe(args.callback, Promise.resolve(me.$refs));
      } catch (err) {
        return maybe(args.callback, Promise.reject(err));
      }
    };
    $RefParser.bundle = function bundle(path2, schema, options, callback) {
      let Class = this;
      let instance = new Class();
      return instance.bundle.apply(instance, arguments);
    };
    $RefParser.prototype.bundle = async function bundle(path2, schema, options, callback) {
      let me = this;
      let args = normalizeArgs(arguments);
      try {
        await this.resolve(args.path, args.schema, args.options);
        _bundle(me, args.options);
        finalize(me);
        return maybe(args.callback, Promise.resolve(me.schema));
      } catch (err) {
        return maybe(args.callback, Promise.reject(err));
      }
    };
    $RefParser.dereference = function dereference(path2, schema, options, callback) {
      let Class = this;
      let instance = new Class();
      return instance.dereference.apply(instance, arguments);
    };
    $RefParser.prototype.dereference = async function dereference(path2, schema, options, callback) {
      let me = this;
      let args = normalizeArgs(arguments);
      try {
        await this.resolve(args.path, args.schema, args.options);
        _dereference(me, args.options);
        finalize(me);
        return maybe(args.callback, Promise.resolve(me.schema));
      } catch (err) {
        return maybe(args.callback, Promise.reject(err));
      }
    };
    function finalize(parser) {
      const errors = JSONParserErrorGroup.getParserErrors(parser);
      if (errors.length > 0) {
        throw new JSONParserErrorGroup(parser);
      }
    }
  }
});

// node_modules/@apidevtools/swagger-parser/lib/index.js
var require_lib4 = __commonJS({
  "node_modules/@apidevtools/swagger-parser/lib/index.js"(exports, module2) {
    "use strict";
    var validateSchema = require_schema5();
    var validateSpec = require_spec();
    var normalizeArgs = require_normalize_args();
    var util = require_util();
    var Options = require_options2();
    var maybe = require_call_me_maybe();
    var { ono } = require_cjs();
    var $RefParser = require_lib3();
    var dereference = require_dereference();
    module2.exports = SwaggerParser2;
    function SwaggerParser2() {
      $RefParser.apply(this, arguments);
    }
    util.inherits(SwaggerParser2, $RefParser);
    SwaggerParser2.parse = $RefParser.parse;
    SwaggerParser2.resolve = $RefParser.resolve;
    SwaggerParser2.bundle = $RefParser.bundle;
    SwaggerParser2.dereference = $RefParser.dereference;
    Object.defineProperty(SwaggerParser2.prototype, "api", {
      configurable: true,
      enumerable: true,
      get() {
        return this.schema;
      }
    });
    SwaggerParser2.prototype.parse = async function(path2, api, options, callback) {
      let args = normalizeArgs(arguments);
      args.options = new Options(args.options);
      try {
        let schema = await $RefParser.prototype.parse.call(this, args.path, args.schema, args.options);
        if (schema.swagger) {
          if (schema.swagger === void 0 || schema.info === void 0 || schema.paths === void 0) {
            throw ono.syntax(`${args.path || args.schema} is not a valid Swagger API definition`);
          } else if (typeof schema.swagger === "number") {
            throw ono.syntax('Swagger version number must be a string (e.g. "2.0") not a number.');
          } else if (typeof schema.info.version === "number") {
            throw ono.syntax('API version number must be a string (e.g. "1.0.0") not a number.');
          } else if (schema.swagger !== "2.0") {
            throw ono.syntax(`Unrecognized Swagger version: ${schema.swagger}. Expected 2.0`);
          }
        } else {
          let supportedVersions = ["3.0.0", "3.0.1", "3.0.2", "3.0.3"];
          if (schema.openapi === void 0 || schema.info === void 0 || schema.paths === void 0) {
            throw ono.syntax(`${args.path || args.schema} is not a valid Openapi API definition`);
          } else if (typeof schema.openapi === "number") {
            throw ono.syntax('Openapi version number must be a string (e.g. "3.0.0") not a number.');
          } else if (typeof schema.info.version === "number") {
            throw ono.syntax('API version number must be a string (e.g. "1.0.0") not a number.');
          } else if (supportedVersions.indexOf(schema.openapi) === -1) {
            throw ono.syntax(`Unsupported OpenAPI version: ${schema.openapi}. Swagger Parser only supports versions ${supportedVersions.join(", ")}`);
          }
        }
        return maybe(args.callback, Promise.resolve(schema));
      } catch (err) {
        return maybe(args.callback, Promise.reject(err));
      }
    };
    SwaggerParser2.validate = function(path2, api, options, callback) {
      let Class = this;
      let instance = new Class();
      return instance.validate.apply(instance, arguments);
    };
    SwaggerParser2.prototype.validate = async function(path2, api, options, callback) {
      let me = this;
      let args = normalizeArgs(arguments);
      args.options = new Options(args.options);
      let circular$RefOption = args.options.dereference.circular;
      args.options.validate.schema && (args.options.dereference.circular = "ignore");
      try {
        await this.dereference(args.path, args.schema, args.options);
        args.options.dereference.circular = circular$RefOption;
        if (args.options.validate.schema) {
          validateSchema(me.api);
          if (me.$refs.circular) {
            if (circular$RefOption === true) {
              dereference(me, args.options);
            } else if (circular$RefOption === false) {
              throw ono.reference("The API contains circular references");
            }
          }
        }
        if (args.options.validate.spec) {
          validateSpec(me.api);
        }
        return maybe(args.callback, Promise.resolve(me.schema));
      } catch (err) {
        return maybe(args.callback, Promise.reject(err));
      }
    };
  }
});

// node_modules/case/dist/Case.js
var require_Case = __commonJS({
  "node_modules/case/dist/Case.js"(exports, module2) {
    (function() {
      "use strict";
      var unicodes = function(s, prefix) {
        prefix = prefix || "";
        return s.replace(/(^|-)/g, "$1\\u" + prefix).replace(/,/g, "\\u" + prefix);
      }, basicSymbols = unicodes("20-26,28-2F,3A-40,5B-60,7B-7E,A0-BF,D7,F7", "00"), baseLowerCase = "a-z" + unicodes("DF-F6,F8-FF", "00"), baseUpperCase = "A-Z" + unicodes("C0-D6,D8-DE", "00"), improperInTitle = "A|An|And|As|At|But|By|En|For|If|In|Of|On|Or|The|To|Vs?\\.?|Via", regexps = function(symbols, lowers, uppers, impropers) {
        symbols = symbols || basicSymbols;
        lowers = lowers || baseLowerCase;
        uppers = uppers || baseUpperCase;
        impropers = impropers || improperInTitle;
        return {
          capitalize: new RegExp("(^|[" + symbols + "])([" + lowers + "])", "g"),
          pascal: new RegExp("(^|[" + symbols + "])+([" + lowers + uppers + "])", "g"),
          fill: new RegExp("[" + symbols + "]+(.|$)", "g"),
          sentence: new RegExp('(^\\s*|[\\?\\!\\.]+"?\\s+"?|,\\s+")([' + lowers + "])", "g"),
          improper: new RegExp("\\b(" + impropers + ")\\b", "g"),
          relax: new RegExp("([^" + uppers + "])([" + uppers + "]*)([" + uppers + "])(?=[^" + uppers + "]|$)", "g"),
          upper: new RegExp("^[^" + lowers + "]+$"),
          hole: /[^\s]\s[^\s]/,
          apostrophe: /'/g,
          room: new RegExp("[" + symbols + "]")
        };
      }, re = regexps(), _ = {
        re,
        unicodes,
        regexps,
        types: [],
        up: String.prototype.toUpperCase,
        low: String.prototype.toLowerCase,
        cap: function(s) {
          return _.up.call(s.charAt(0)) + s.slice(1);
        },
        decap: function(s) {
          return _.low.call(s.charAt(0)) + s.slice(1);
        },
        deapostrophe: function(s) {
          return s.replace(re.apostrophe, "");
        },
        fill: function(s, fill, deapostrophe) {
          if (fill != null) {
            s = s.replace(re.fill, function(m, next) {
              return next ? fill + next : "";
            });
          }
          if (deapostrophe) {
            s = _.deapostrophe(s);
          }
          return s;
        },
        prep: function(s, fill, pascal, upper) {
          s = s == null ? "" : s + "";
          if (!upper && re.upper.test(s)) {
            s = _.low.call(s);
          }
          if (!fill && !re.hole.test(s)) {
            var holey = _.fill(s, " ");
            if (re.hole.test(holey)) {
              s = holey;
            }
          }
          if (!pascal && !re.room.test(s)) {
            s = s.replace(re.relax, _.relax);
          }
          return s;
        },
        relax: function(m, before, acronym, caps) {
          return before + " " + (acronym ? acronym + " " : "") + caps;
        }
      }, Case2 = {
        _,
        of: function(s) {
          for (var i = 0, m = _.types.length; i < m; i++) {
            if (Case2[_.types[i]].apply(Case2, arguments) === s) {
              return _.types[i];
            }
          }
        },
        flip: function(s) {
          return s.replace(/\w/g, function(l) {
            return (l == _.up.call(l) ? _.low : _.up).call(l);
          });
        },
        random: function(s) {
          return s.replace(/\w/g, function(l) {
            return (Math.round(Math.random()) ? _.up : _.low).call(l);
          });
        },
        type: function(type2, fn) {
          Case2[type2] = fn;
          _.types.push(type2);
        }
      }, types = {
        lower: function(s, fill, deapostrophe) {
          return _.fill(_.low.call(_.prep(s, fill)), fill, deapostrophe);
        },
        snake: function(s) {
          return Case2.lower(s, "_", true);
        },
        constant: function(s) {
          return Case2.upper(s, "_", true);
        },
        camel: function(s) {
          return _.decap(Case2.pascal(s));
        },
        kebab: function(s) {
          return Case2.lower(s, "-", true);
        },
        upper: function(s, fill, deapostrophe) {
          return _.fill(_.up.call(_.prep(s, fill, false, true)), fill, deapostrophe);
        },
        capital: function(s, fill, deapostrophe) {
          return _.fill(_.prep(s).replace(re.capitalize, function(m, border, letter) {
            return border + _.up.call(letter);
          }), fill, deapostrophe);
        },
        header: function(s) {
          return Case2.capital(s, "-", true);
        },
        pascal: function(s) {
          return _.fill(_.prep(s, false, true).replace(re.pascal, function(m, border, letter) {
            return _.up.call(letter);
          }), "", true);
        },
        title: function(s) {
          return Case2.capital(s).replace(re.improper, function(small, p, i, s2) {
            return i > 0 && i < s2.lastIndexOf(" ") ? _.low.call(small) : small;
          });
        },
        sentence: function(s, names, abbreviations) {
          s = Case2.lower(s).replace(re.sentence, function(m, prelude, letter) {
            return prelude + _.up.call(letter);
          });
          if (names) {
            names.forEach(function(name) {
              s = s.replace(new RegExp("\\b" + Case2.lower(name) + "\\b", "g"), _.cap);
            });
          }
          if (abbreviations) {
            abbreviations.forEach(function(abbr) {
              s = s.replace(new RegExp("(\\b" + Case2.lower(abbr) + "\\. +)(\\w)"), function(m, abbrAndSpace, letter) {
                return abbrAndSpace + _.low.call(letter);
              });
            });
          }
          return s;
        }
      };
      types.squish = types.pascal;
      Case2.default = Case2;
      for (var type in types) {
        Case2.type(type, types[type]);
      }
      var define = typeof define === "function" ? define : function() {
      };
      define(typeof module2 === "object" && module2.exports ? module2.exports = Case2 : this.Case = Case2);
    }).call(exports);
  }
});

// node_modules/core-js/internals/global.js
var require_global = __commonJS({
  "node_modules/core-js/internals/global.js"(exports, module2) {
    var check = function(it) {
      return it && it.Math == Math && it;
    };
    module2.exports = check(typeof globalThis == "object" && globalThis) || check(typeof window == "object" && window) || check(typeof self == "object" && self) || check(typeof global == "object" && global) || function() {
      return this;
    }() || Function("return this")();
  }
});

// node_modules/core-js/internals/fails.js
var require_fails = __commonJS({
  "node_modules/core-js/internals/fails.js"(exports, module2) {
    module2.exports = function(exec) {
      try {
        return !!exec();
      } catch (error) {
        return true;
      }
    };
  }
});

// node_modules/core-js/internals/descriptors.js
var require_descriptors = __commonJS({
  "node_modules/core-js/internals/descriptors.js"(exports, module2) {
    var fails = require_fails();
    module2.exports = !fails(function() {
      return Object.defineProperty({}, 1, { get: function() {
        return 7;
      } })[1] != 7;
    });
  }
});

// node_modules/core-js/internals/function-bind-native.js
var require_function_bind_native = __commonJS({
  "node_modules/core-js/internals/function-bind-native.js"(exports, module2) {
    var fails = require_fails();
    module2.exports = !fails(function() {
      var test = function() {
      }.bind();
      return typeof test != "function" || test.hasOwnProperty("prototype");
    });
  }
});

// node_modules/core-js/internals/function-call.js
var require_function_call = __commonJS({
  "node_modules/core-js/internals/function-call.js"(exports, module2) {
    var NATIVE_BIND = require_function_bind_native();
    var call = Function.prototype.call;
    module2.exports = NATIVE_BIND ? call.bind(call) : function() {
      return call.apply(call, arguments);
    };
  }
});

// node_modules/core-js/internals/object-property-is-enumerable.js
var require_object_property_is_enumerable = __commonJS({
  "node_modules/core-js/internals/object-property-is-enumerable.js"(exports) {
    "use strict";
    var $propertyIsEnumerable = {}.propertyIsEnumerable;
    var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var NASHORN_BUG = getOwnPropertyDescriptor && !$propertyIsEnumerable.call({ 1: 2 }, 1);
    exports.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
      var descriptor = getOwnPropertyDescriptor(this, V);
      return !!descriptor && descriptor.enumerable;
    } : $propertyIsEnumerable;
  }
});

// node_modules/core-js/internals/create-property-descriptor.js
var require_create_property_descriptor = __commonJS({
  "node_modules/core-js/internals/create-property-descriptor.js"(exports, module2) {
    module2.exports = function(bitmap, value) {
      return {
        enumerable: !(bitmap & 1),
        configurable: !(bitmap & 2),
        writable: !(bitmap & 4),
        value
      };
    };
  }
});

// node_modules/core-js/internals/function-uncurry-this.js
var require_function_uncurry_this = __commonJS({
  "node_modules/core-js/internals/function-uncurry-this.js"(exports, module2) {
    var NATIVE_BIND = require_function_bind_native();
    var FunctionPrototype = Function.prototype;
    var bind = FunctionPrototype.bind;
    var call = FunctionPrototype.call;
    var uncurryThis = NATIVE_BIND && bind.bind(call, call);
    module2.exports = NATIVE_BIND ? function(fn) {
      return fn && uncurryThis(fn);
    } : function(fn) {
      return fn && function() {
        return call.apply(fn, arguments);
      };
    };
  }
});

// node_modules/core-js/internals/classof-raw.js
var require_classof_raw = __commonJS({
  "node_modules/core-js/internals/classof-raw.js"(exports, module2) {
    var uncurryThis = require_function_uncurry_this();
    var toString2 = uncurryThis({}.toString);
    var stringSlice = uncurryThis("".slice);
    module2.exports = function(it) {
      return stringSlice(toString2(it), 8, -1);
    };
  }
});

// node_modules/core-js/internals/indexed-object.js
var require_indexed_object = __commonJS({
  "node_modules/core-js/internals/indexed-object.js"(exports, module2) {
    var global2 = require_global();
    var uncurryThis = require_function_uncurry_this();
    var fails = require_fails();
    var classof = require_classof_raw();
    var Object2 = global2.Object;
    var split = uncurryThis("".split);
    module2.exports = fails(function() {
      return !Object2("z").propertyIsEnumerable(0);
    }) ? function(it) {
      return classof(it) == "String" ? split(it, "") : Object2(it);
    } : Object2;
  }
});

// node_modules/core-js/internals/require-object-coercible.js
var require_require_object_coercible = __commonJS({
  "node_modules/core-js/internals/require-object-coercible.js"(exports, module2) {
    var global2 = require_global();
    var TypeError2 = global2.TypeError;
    module2.exports = function(it) {
      if (it == void 0)
        throw TypeError2("Can't call method on " + it);
      return it;
    };
  }
});

// node_modules/core-js/internals/to-indexed-object.js
var require_to_indexed_object = __commonJS({
  "node_modules/core-js/internals/to-indexed-object.js"(exports, module2) {
    var IndexedObject = require_indexed_object();
    var requireObjectCoercible = require_require_object_coercible();
    module2.exports = function(it) {
      return IndexedObject(requireObjectCoercible(it));
    };
  }
});

// node_modules/core-js/internals/is-callable.js
var require_is_callable = __commonJS({
  "node_modules/core-js/internals/is-callable.js"(exports, module2) {
    module2.exports = function(argument) {
      return typeof argument == "function";
    };
  }
});

// node_modules/core-js/internals/is-object.js
var require_is_object = __commonJS({
  "node_modules/core-js/internals/is-object.js"(exports, module2) {
    var isCallable = require_is_callable();
    module2.exports = function(it) {
      return typeof it == "object" ? it !== null : isCallable(it);
    };
  }
});

// node_modules/core-js/internals/get-built-in.js
var require_get_built_in = __commonJS({
  "node_modules/core-js/internals/get-built-in.js"(exports, module2) {
    var global2 = require_global();
    var isCallable = require_is_callable();
    var aFunction = function(argument) {
      return isCallable(argument) ? argument : void 0;
    };
    module2.exports = function(namespace, method) {
      return arguments.length < 2 ? aFunction(global2[namespace]) : global2[namespace] && global2[namespace][method];
    };
  }
});

// node_modules/core-js/internals/object-is-prototype-of.js
var require_object_is_prototype_of = __commonJS({
  "node_modules/core-js/internals/object-is-prototype-of.js"(exports, module2) {
    var uncurryThis = require_function_uncurry_this();
    module2.exports = uncurryThis({}.isPrototypeOf);
  }
});

// node_modules/core-js/internals/engine-user-agent.js
var require_engine_user_agent = __commonJS({
  "node_modules/core-js/internals/engine-user-agent.js"(exports, module2) {
    var getBuiltIn = require_get_built_in();
    module2.exports = getBuiltIn("navigator", "userAgent") || "";
  }
});

// node_modules/core-js/internals/engine-v8-version.js
var require_engine_v8_version = __commonJS({
  "node_modules/core-js/internals/engine-v8-version.js"(exports, module2) {
    var global2 = require_global();
    var userAgent = require_engine_user_agent();
    var process2 = global2.process;
    var Deno = global2.Deno;
    var versions = process2 && process2.versions || Deno && Deno.version;
    var v8 = versions && versions.v8;
    var match;
    var version;
    if (v8) {
      match = v8.split(".");
      version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
    }
    if (!version && userAgent) {
      match = userAgent.match(/Edge\/(\d+)/);
      if (!match || match[1] >= 74) {
        match = userAgent.match(/Chrome\/(\d+)/);
        if (match)
          version = +match[1];
      }
    }
    module2.exports = version;
  }
});

// node_modules/core-js/internals/native-symbol.js
var require_native_symbol = __commonJS({
  "node_modules/core-js/internals/native-symbol.js"(exports, module2) {
    var V8_VERSION = require_engine_v8_version();
    var fails = require_fails();
    module2.exports = !!Object.getOwnPropertySymbols && !fails(function() {
      var symbol = Symbol();
      return !String(symbol) || !(Object(symbol) instanceof Symbol) || !Symbol.sham && V8_VERSION && V8_VERSION < 41;
    });
  }
});

// node_modules/core-js/internals/use-symbol-as-uid.js
var require_use_symbol_as_uid = __commonJS({
  "node_modules/core-js/internals/use-symbol-as-uid.js"(exports, module2) {
    var NATIVE_SYMBOL = require_native_symbol();
    module2.exports = NATIVE_SYMBOL && !Symbol.sham && typeof Symbol.iterator == "symbol";
  }
});

// node_modules/core-js/internals/is-symbol.js
var require_is_symbol = __commonJS({
  "node_modules/core-js/internals/is-symbol.js"(exports, module2) {
    var global2 = require_global();
    var getBuiltIn = require_get_built_in();
    var isCallable = require_is_callable();
    var isPrototypeOf = require_object_is_prototype_of();
    var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
    var Object2 = global2.Object;
    module2.exports = USE_SYMBOL_AS_UID ? function(it) {
      return typeof it == "symbol";
    } : function(it) {
      var $Symbol = getBuiltIn("Symbol");
      return isCallable($Symbol) && isPrototypeOf($Symbol.prototype, Object2(it));
    };
  }
});

// node_modules/core-js/internals/try-to-string.js
var require_try_to_string = __commonJS({
  "node_modules/core-js/internals/try-to-string.js"(exports, module2) {
    var global2 = require_global();
    var String2 = global2.String;
    module2.exports = function(argument) {
      try {
        return String2(argument);
      } catch (error) {
        return "Object";
      }
    };
  }
});

// node_modules/core-js/internals/a-callable.js
var require_a_callable = __commonJS({
  "node_modules/core-js/internals/a-callable.js"(exports, module2) {
    var global2 = require_global();
    var isCallable = require_is_callable();
    var tryToString = require_try_to_string();
    var TypeError2 = global2.TypeError;
    module2.exports = function(argument) {
      if (isCallable(argument))
        return argument;
      throw TypeError2(tryToString(argument) + " is not a function");
    };
  }
});

// node_modules/core-js/internals/get-method.js
var require_get_method = __commonJS({
  "node_modules/core-js/internals/get-method.js"(exports, module2) {
    var aCallable = require_a_callable();
    module2.exports = function(V, P) {
      var func = V[P];
      return func == null ? void 0 : aCallable(func);
    };
  }
});

// node_modules/core-js/internals/ordinary-to-primitive.js
var require_ordinary_to_primitive = __commonJS({
  "node_modules/core-js/internals/ordinary-to-primitive.js"(exports, module2) {
    var global2 = require_global();
    var call = require_function_call();
    var isCallable = require_is_callable();
    var isObject = require_is_object();
    var TypeError2 = global2.TypeError;
    module2.exports = function(input, pref) {
      var fn, val;
      if (pref === "string" && isCallable(fn = input.toString) && !isObject(val = call(fn, input)))
        return val;
      if (isCallable(fn = input.valueOf) && !isObject(val = call(fn, input)))
        return val;
      if (pref !== "string" && isCallable(fn = input.toString) && !isObject(val = call(fn, input)))
        return val;
      throw TypeError2("Can't convert object to primitive value");
    };
  }
});

// node_modules/core-js/internals/is-pure.js
var require_is_pure = __commonJS({
  "node_modules/core-js/internals/is-pure.js"(exports, module2) {
    module2.exports = false;
  }
});

// node_modules/core-js/internals/set-global.js
var require_set_global = __commonJS({
  "node_modules/core-js/internals/set-global.js"(exports, module2) {
    var global2 = require_global();
    var defineProperty = Object.defineProperty;
    module2.exports = function(key, value) {
      try {
        defineProperty(global2, key, { value, configurable: true, writable: true });
      } catch (error) {
        global2[key] = value;
      }
      return value;
    };
  }
});

// node_modules/core-js/internals/shared-store.js
var require_shared_store = __commonJS({
  "node_modules/core-js/internals/shared-store.js"(exports, module2) {
    var global2 = require_global();
    var setGlobal = require_set_global();
    var SHARED = "__core-js_shared__";
    var store = global2[SHARED] || setGlobal(SHARED, {});
    module2.exports = store;
  }
});

// node_modules/core-js/internals/shared.js
var require_shared = __commonJS({
  "node_modules/core-js/internals/shared.js"(exports, module2) {
    var IS_PURE = require_is_pure();
    var store = require_shared_store();
    (module2.exports = function(key, value) {
      return store[key] || (store[key] = value !== void 0 ? value : {});
    })("versions", []).push({
      version: "3.21.1",
      mode: IS_PURE ? "pure" : "global",
      copyright: "\xA9 2014-2022 Denis Pushkarev (zloirock.ru)",
      license: "https://github.com/zloirock/core-js/blob/v3.21.1/LICENSE",
      source: "https://github.com/zloirock/core-js"
    });
  }
});

// node_modules/core-js/internals/to-object.js
var require_to_object = __commonJS({
  "node_modules/core-js/internals/to-object.js"(exports, module2) {
    var global2 = require_global();
    var requireObjectCoercible = require_require_object_coercible();
    var Object2 = global2.Object;
    module2.exports = function(argument) {
      return Object2(requireObjectCoercible(argument));
    };
  }
});

// node_modules/core-js/internals/has-own-property.js
var require_has_own_property = __commonJS({
  "node_modules/core-js/internals/has-own-property.js"(exports, module2) {
    var uncurryThis = require_function_uncurry_this();
    var toObject = require_to_object();
    var hasOwnProperty = uncurryThis({}.hasOwnProperty);
    module2.exports = Object.hasOwn || function hasOwn(it, key) {
      return hasOwnProperty(toObject(it), key);
    };
  }
});

// node_modules/core-js/internals/uid.js
var require_uid = __commonJS({
  "node_modules/core-js/internals/uid.js"(exports, module2) {
    var uncurryThis = require_function_uncurry_this();
    var id = 0;
    var postfix = Math.random();
    var toString2 = uncurryThis(1 .toString);
    module2.exports = function(key) {
      return "Symbol(" + (key === void 0 ? "" : key) + ")_" + toString2(++id + postfix, 36);
    };
  }
});

// node_modules/core-js/internals/well-known-symbol.js
var require_well_known_symbol = __commonJS({
  "node_modules/core-js/internals/well-known-symbol.js"(exports, module2) {
    var global2 = require_global();
    var shared = require_shared();
    var hasOwn = require_has_own_property();
    var uid = require_uid();
    var NATIVE_SYMBOL = require_native_symbol();
    var USE_SYMBOL_AS_UID = require_use_symbol_as_uid();
    var WellKnownSymbolsStore = shared("wks");
    var Symbol2 = global2.Symbol;
    var symbolFor = Symbol2 && Symbol2["for"];
    var createWellKnownSymbol = USE_SYMBOL_AS_UID ? Symbol2 : Symbol2 && Symbol2.withoutSetter || uid;
    module2.exports = function(name) {
      if (!hasOwn(WellKnownSymbolsStore, name) || !(NATIVE_SYMBOL || typeof WellKnownSymbolsStore[name] == "string")) {
        var description = "Symbol." + name;
        if (NATIVE_SYMBOL && hasOwn(Symbol2, name)) {
          WellKnownSymbolsStore[name] = Symbol2[name];
        } else if (USE_SYMBOL_AS_UID && symbolFor) {
          WellKnownSymbolsStore[name] = symbolFor(description);
        } else {
          WellKnownSymbolsStore[name] = createWellKnownSymbol(description);
        }
      }
      return WellKnownSymbolsStore[name];
    };
  }
});

// node_modules/core-js/internals/to-primitive.js
var require_to_primitive = __commonJS({
  "node_modules/core-js/internals/to-primitive.js"(exports, module2) {
    var global2 = require_global();
    var call = require_function_call();
    var isObject = require_is_object();
    var isSymbol = require_is_symbol();
    var getMethod = require_get_method();
    var ordinaryToPrimitive = require_ordinary_to_primitive();
    var wellKnownSymbol = require_well_known_symbol();
    var TypeError2 = global2.TypeError;
    var TO_PRIMITIVE = wellKnownSymbol("toPrimitive");
    module2.exports = function(input, pref) {
      if (!isObject(input) || isSymbol(input))
        return input;
      var exoticToPrim = getMethod(input, TO_PRIMITIVE);
      var result;
      if (exoticToPrim) {
        if (pref === void 0)
          pref = "default";
        result = call(exoticToPrim, input, pref);
        if (!isObject(result) || isSymbol(result))
          return result;
        throw TypeError2("Can't convert object to primitive value");
      }
      if (pref === void 0)
        pref = "number";
      return ordinaryToPrimitive(input, pref);
    };
  }
});

// node_modules/core-js/internals/to-property-key.js
var require_to_property_key = __commonJS({
  "node_modules/core-js/internals/to-property-key.js"(exports, module2) {
    var toPrimitive = require_to_primitive();
    var isSymbol = require_is_symbol();
    module2.exports = function(argument) {
      var key = toPrimitive(argument, "string");
      return isSymbol(key) ? key : key + "";
    };
  }
});

// node_modules/core-js/internals/document-create-element.js
var require_document_create_element = __commonJS({
  "node_modules/core-js/internals/document-create-element.js"(exports, module2) {
    var global2 = require_global();
    var isObject = require_is_object();
    var document2 = global2.document;
    var EXISTS = isObject(document2) && isObject(document2.createElement);
    module2.exports = function(it) {
      return EXISTS ? document2.createElement(it) : {};
    };
  }
});

// node_modules/core-js/internals/ie8-dom-define.js
var require_ie8_dom_define = __commonJS({
  "node_modules/core-js/internals/ie8-dom-define.js"(exports, module2) {
    var DESCRIPTORS = require_descriptors();
    var fails = require_fails();
    var createElement = require_document_create_element();
    module2.exports = !DESCRIPTORS && !fails(function() {
      return Object.defineProperty(createElement("div"), "a", {
        get: function() {
          return 7;
        }
      }).a != 7;
    });
  }
});

// node_modules/core-js/internals/object-get-own-property-descriptor.js
var require_object_get_own_property_descriptor = __commonJS({
  "node_modules/core-js/internals/object-get-own-property-descriptor.js"(exports) {
    var DESCRIPTORS = require_descriptors();
    var call = require_function_call();
    var propertyIsEnumerableModule = require_object_property_is_enumerable();
    var createPropertyDescriptor = require_create_property_descriptor();
    var toIndexedObject = require_to_indexed_object();
    var toPropertyKey = require_to_property_key();
    var hasOwn = require_has_own_property();
    var IE8_DOM_DEFINE = require_ie8_dom_define();
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    exports.f = DESCRIPTORS ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
      O = toIndexedObject(O);
      P = toPropertyKey(P);
      if (IE8_DOM_DEFINE)
        try {
          return $getOwnPropertyDescriptor(O, P);
        } catch (error) {
        }
      if (hasOwn(O, P))
        return createPropertyDescriptor(!call(propertyIsEnumerableModule.f, O, P), O[P]);
    };
  }
});

// node_modules/core-js/internals/v8-prototype-define-bug.js
var require_v8_prototype_define_bug = __commonJS({
  "node_modules/core-js/internals/v8-prototype-define-bug.js"(exports, module2) {
    var DESCRIPTORS = require_descriptors();
    var fails = require_fails();
    module2.exports = DESCRIPTORS && fails(function() {
      return Object.defineProperty(function() {
      }, "prototype", {
        value: 42,
        writable: false
      }).prototype != 42;
    });
  }
});

// node_modules/core-js/internals/an-object.js
var require_an_object = __commonJS({
  "node_modules/core-js/internals/an-object.js"(exports, module2) {
    var global2 = require_global();
    var isObject = require_is_object();
    var String2 = global2.String;
    var TypeError2 = global2.TypeError;
    module2.exports = function(argument) {
      if (isObject(argument))
        return argument;
      throw TypeError2(String2(argument) + " is not an object");
    };
  }
});

// node_modules/core-js/internals/object-define-property.js
var require_object_define_property = __commonJS({
  "node_modules/core-js/internals/object-define-property.js"(exports) {
    var global2 = require_global();
    var DESCRIPTORS = require_descriptors();
    var IE8_DOM_DEFINE = require_ie8_dom_define();
    var V8_PROTOTYPE_DEFINE_BUG = require_v8_prototype_define_bug();
    var anObject = require_an_object();
    var toPropertyKey = require_to_property_key();
    var TypeError2 = global2.TypeError;
    var $defineProperty = Object.defineProperty;
    var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    var ENUMERABLE = "enumerable";
    var CONFIGURABLE = "configurable";
    var WRITABLE = "writable";
    exports.f = DESCRIPTORS ? V8_PROTOTYPE_DEFINE_BUG ? function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPropertyKey(P);
      anObject(Attributes);
      if (typeof O === "function" && P === "prototype" && "value" in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
        var current = $getOwnPropertyDescriptor(O, P);
        if (current && current[WRITABLE]) {
          O[P] = Attributes.value;
          Attributes = {
            configurable: CONFIGURABLE in Attributes ? Attributes[CONFIGURABLE] : current[CONFIGURABLE],
            enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
            writable: false
          };
        }
      }
      return $defineProperty(O, P, Attributes);
    } : $defineProperty : function defineProperty(O, P, Attributes) {
      anObject(O);
      P = toPropertyKey(P);
      anObject(Attributes);
      if (IE8_DOM_DEFINE)
        try {
          return $defineProperty(O, P, Attributes);
        } catch (error) {
        }
      if ("get" in Attributes || "set" in Attributes)
        throw TypeError2("Accessors not supported");
      if ("value" in Attributes)
        O[P] = Attributes.value;
      return O;
    };
  }
});

// node_modules/core-js/internals/create-non-enumerable-property.js
var require_create_non_enumerable_property = __commonJS({
  "node_modules/core-js/internals/create-non-enumerable-property.js"(exports, module2) {
    var DESCRIPTORS = require_descriptors();
    var definePropertyModule = require_object_define_property();
    var createPropertyDescriptor = require_create_property_descriptor();
    module2.exports = DESCRIPTORS ? function(object, key, value) {
      return definePropertyModule.f(object, key, createPropertyDescriptor(1, value));
    } : function(object, key, value) {
      object[key] = value;
      return object;
    };
  }
});

// node_modules/core-js/internals/inspect-source.js
var require_inspect_source = __commonJS({
  "node_modules/core-js/internals/inspect-source.js"(exports, module2) {
    var uncurryThis = require_function_uncurry_this();
    var isCallable = require_is_callable();
    var store = require_shared_store();
    var functionToString = uncurryThis(Function.toString);
    if (!isCallable(store.inspectSource)) {
      store.inspectSource = function(it) {
        return functionToString(it);
      };
    }
    module2.exports = store.inspectSource;
  }
});

// node_modules/core-js/internals/native-weak-map.js
var require_native_weak_map = __commonJS({
  "node_modules/core-js/internals/native-weak-map.js"(exports, module2) {
    var global2 = require_global();
    var isCallable = require_is_callable();
    var inspectSource = require_inspect_source();
    var WeakMap2 = global2.WeakMap;
    module2.exports = isCallable(WeakMap2) && /native code/.test(inspectSource(WeakMap2));
  }
});

// node_modules/core-js/internals/shared-key.js
var require_shared_key = __commonJS({
  "node_modules/core-js/internals/shared-key.js"(exports, module2) {
    var shared = require_shared();
    var uid = require_uid();
    var keys = shared("keys");
    module2.exports = function(key) {
      return keys[key] || (keys[key] = uid(key));
    };
  }
});

// node_modules/core-js/internals/hidden-keys.js
var require_hidden_keys = __commonJS({
  "node_modules/core-js/internals/hidden-keys.js"(exports, module2) {
    module2.exports = {};
  }
});

// node_modules/core-js/internals/internal-state.js
var require_internal_state = __commonJS({
  "node_modules/core-js/internals/internal-state.js"(exports, module2) {
    var NATIVE_WEAK_MAP = require_native_weak_map();
    var global2 = require_global();
    var uncurryThis = require_function_uncurry_this();
    var isObject = require_is_object();
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    var hasOwn = require_has_own_property();
    var shared = require_shared_store();
    var sharedKey = require_shared_key();
    var hiddenKeys = require_hidden_keys();
    var OBJECT_ALREADY_INITIALIZED = "Object already initialized";
    var TypeError2 = global2.TypeError;
    var WeakMap2 = global2.WeakMap;
    var set;
    var get;
    var has;
    var enforce = function(it) {
      return has(it) ? get(it) : set(it, {});
    };
    var getterFor = function(TYPE) {
      return function(it) {
        var state;
        if (!isObject(it) || (state = get(it)).type !== TYPE) {
          throw TypeError2("Incompatible receiver, " + TYPE + " required");
        }
        return state;
      };
    };
    if (NATIVE_WEAK_MAP || shared.state) {
      store = shared.state || (shared.state = new WeakMap2());
      wmget = uncurryThis(store.get);
      wmhas = uncurryThis(store.has);
      wmset = uncurryThis(store.set);
      set = function(it, metadata) {
        if (wmhas(store, it))
          throw new TypeError2(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it;
        wmset(store, it, metadata);
        return metadata;
      };
      get = function(it) {
        return wmget(store, it) || {};
      };
      has = function(it) {
        return wmhas(store, it);
      };
    } else {
      STATE = sharedKey("state");
      hiddenKeys[STATE] = true;
      set = function(it, metadata) {
        if (hasOwn(it, STATE))
          throw new TypeError2(OBJECT_ALREADY_INITIALIZED);
        metadata.facade = it;
        createNonEnumerableProperty(it, STATE, metadata);
        return metadata;
      };
      get = function(it) {
        return hasOwn(it, STATE) ? it[STATE] : {};
      };
      has = function(it) {
        return hasOwn(it, STATE);
      };
    }
    var store;
    var wmget;
    var wmhas;
    var wmset;
    var STATE;
    module2.exports = {
      set,
      get,
      has,
      enforce,
      getterFor
    };
  }
});

// node_modules/core-js/internals/function-name.js
var require_function_name = __commonJS({
  "node_modules/core-js/internals/function-name.js"(exports, module2) {
    var DESCRIPTORS = require_descriptors();
    var hasOwn = require_has_own_property();
    var FunctionPrototype = Function.prototype;
    var getDescriptor = DESCRIPTORS && Object.getOwnPropertyDescriptor;
    var EXISTS = hasOwn(FunctionPrototype, "name");
    var PROPER = EXISTS && function something() {
    }.name === "something";
    var CONFIGURABLE = EXISTS && (!DESCRIPTORS || DESCRIPTORS && getDescriptor(FunctionPrototype, "name").configurable);
    module2.exports = {
      EXISTS,
      PROPER,
      CONFIGURABLE
    };
  }
});

// node_modules/core-js/internals/redefine.js
var require_redefine = __commonJS({
  "node_modules/core-js/internals/redefine.js"(exports, module2) {
    var global2 = require_global();
    var isCallable = require_is_callable();
    var hasOwn = require_has_own_property();
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    var setGlobal = require_set_global();
    var inspectSource = require_inspect_source();
    var InternalStateModule = require_internal_state();
    var CONFIGURABLE_FUNCTION_NAME = require_function_name().CONFIGURABLE;
    var getInternalState = InternalStateModule.get;
    var enforceInternalState = InternalStateModule.enforce;
    var TEMPLATE = String(String).split("String");
    (module2.exports = function(O, key, value, options) {
      var unsafe = options ? !!options.unsafe : false;
      var simple = options ? !!options.enumerable : false;
      var noTargetGet = options ? !!options.noTargetGet : false;
      var name = options && options.name !== void 0 ? options.name : key;
      var state;
      if (isCallable(value)) {
        if (String(name).slice(0, 7) === "Symbol(") {
          name = "[" + String(name).replace(/^Symbol\(([^)]*)\)/, "$1") + "]";
        }
        if (!hasOwn(value, "name") || CONFIGURABLE_FUNCTION_NAME && value.name !== name) {
          createNonEnumerableProperty(value, "name", name);
        }
        state = enforceInternalState(value);
        if (!state.source) {
          state.source = TEMPLATE.join(typeof name == "string" ? name : "");
        }
      }
      if (O === global2) {
        if (simple)
          O[key] = value;
        else
          setGlobal(key, value);
        return;
      } else if (!unsafe) {
        delete O[key];
      } else if (!noTargetGet && O[key]) {
        simple = true;
      }
      if (simple)
        O[key] = value;
      else
        createNonEnumerableProperty(O, key, value);
    })(Function.prototype, "toString", function toString2() {
      return isCallable(this) && getInternalState(this).source || inspectSource(this);
    });
  }
});

// node_modules/core-js/internals/to-integer-or-infinity.js
var require_to_integer_or_infinity = __commonJS({
  "node_modules/core-js/internals/to-integer-or-infinity.js"(exports, module2) {
    var ceil = Math.ceil;
    var floor = Math.floor;
    module2.exports = function(argument) {
      var number = +argument;
      return number !== number || number === 0 ? 0 : (number > 0 ? floor : ceil)(number);
    };
  }
});

// node_modules/core-js/internals/to-absolute-index.js
var require_to_absolute_index = __commonJS({
  "node_modules/core-js/internals/to-absolute-index.js"(exports, module2) {
    var toIntegerOrInfinity = require_to_integer_or_infinity();
    var max = Math.max;
    var min = Math.min;
    module2.exports = function(index, length) {
      var integer = toIntegerOrInfinity(index);
      return integer < 0 ? max(integer + length, 0) : min(integer, length);
    };
  }
});

// node_modules/core-js/internals/to-length.js
var require_to_length = __commonJS({
  "node_modules/core-js/internals/to-length.js"(exports, module2) {
    var toIntegerOrInfinity = require_to_integer_or_infinity();
    var min = Math.min;
    module2.exports = function(argument) {
      return argument > 0 ? min(toIntegerOrInfinity(argument), 9007199254740991) : 0;
    };
  }
});

// node_modules/core-js/internals/length-of-array-like.js
var require_length_of_array_like = __commonJS({
  "node_modules/core-js/internals/length-of-array-like.js"(exports, module2) {
    var toLength = require_to_length();
    module2.exports = function(obj) {
      return toLength(obj.length);
    };
  }
});

// node_modules/core-js/internals/array-includes.js
var require_array_includes = __commonJS({
  "node_modules/core-js/internals/array-includes.js"(exports, module2) {
    var toIndexedObject = require_to_indexed_object();
    var toAbsoluteIndex = require_to_absolute_index();
    var lengthOfArrayLike = require_length_of_array_like();
    var createMethod = function(IS_INCLUDES) {
      return function($this, el, fromIndex) {
        var O = toIndexedObject($this);
        var length = lengthOfArrayLike(O);
        var index = toAbsoluteIndex(fromIndex, length);
        var value;
        if (IS_INCLUDES && el != el)
          while (length > index) {
            value = O[index++];
            if (value != value)
              return true;
          }
        else
          for (; length > index; index++) {
            if ((IS_INCLUDES || index in O) && O[index] === el)
              return IS_INCLUDES || index || 0;
          }
        return !IS_INCLUDES && -1;
      };
    };
    module2.exports = {
      includes: createMethod(true),
      indexOf: createMethod(false)
    };
  }
});

// node_modules/core-js/internals/object-keys-internal.js
var require_object_keys_internal = __commonJS({
  "node_modules/core-js/internals/object-keys-internal.js"(exports, module2) {
    var uncurryThis = require_function_uncurry_this();
    var hasOwn = require_has_own_property();
    var toIndexedObject = require_to_indexed_object();
    var indexOf = require_array_includes().indexOf;
    var hiddenKeys = require_hidden_keys();
    var push = uncurryThis([].push);
    module2.exports = function(object, names) {
      var O = toIndexedObject(object);
      var i = 0;
      var result = [];
      var key;
      for (key in O)
        !hasOwn(hiddenKeys, key) && hasOwn(O, key) && push(result, key);
      while (names.length > i)
        if (hasOwn(O, key = names[i++])) {
          ~indexOf(result, key) || push(result, key);
        }
      return result;
    };
  }
});

// node_modules/core-js/internals/enum-bug-keys.js
var require_enum_bug_keys = __commonJS({
  "node_modules/core-js/internals/enum-bug-keys.js"(exports, module2) {
    module2.exports = [
      "constructor",
      "hasOwnProperty",
      "isPrototypeOf",
      "propertyIsEnumerable",
      "toLocaleString",
      "toString",
      "valueOf"
    ];
  }
});

// node_modules/core-js/internals/object-get-own-property-names.js
var require_object_get_own_property_names = __commonJS({
  "node_modules/core-js/internals/object-get-own-property-names.js"(exports) {
    var internalObjectKeys = require_object_keys_internal();
    var enumBugKeys = require_enum_bug_keys();
    var hiddenKeys = enumBugKeys.concat("length", "prototype");
    exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
      return internalObjectKeys(O, hiddenKeys);
    };
  }
});

// node_modules/core-js/internals/object-get-own-property-symbols.js
var require_object_get_own_property_symbols = __commonJS({
  "node_modules/core-js/internals/object-get-own-property-symbols.js"(exports) {
    exports.f = Object.getOwnPropertySymbols;
  }
});

// node_modules/core-js/internals/own-keys.js
var require_own_keys = __commonJS({
  "node_modules/core-js/internals/own-keys.js"(exports, module2) {
    var getBuiltIn = require_get_built_in();
    var uncurryThis = require_function_uncurry_this();
    var getOwnPropertyNamesModule = require_object_get_own_property_names();
    var getOwnPropertySymbolsModule = require_object_get_own_property_symbols();
    var anObject = require_an_object();
    var concat = uncurryThis([].concat);
    module2.exports = getBuiltIn("Reflect", "ownKeys") || function ownKeys(it) {
      var keys = getOwnPropertyNamesModule.f(anObject(it));
      var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
      return getOwnPropertySymbols ? concat(keys, getOwnPropertySymbols(it)) : keys;
    };
  }
});

// node_modules/core-js/internals/copy-constructor-properties.js
var require_copy_constructor_properties = __commonJS({
  "node_modules/core-js/internals/copy-constructor-properties.js"(exports, module2) {
    var hasOwn = require_has_own_property();
    var ownKeys = require_own_keys();
    var getOwnPropertyDescriptorModule = require_object_get_own_property_descriptor();
    var definePropertyModule = require_object_define_property();
    module2.exports = function(target, source, exceptions) {
      var keys = ownKeys(source);
      var defineProperty = definePropertyModule.f;
      var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (!hasOwn(target, key) && !(exceptions && hasOwn(exceptions, key))) {
          defineProperty(target, key, getOwnPropertyDescriptor(source, key));
        }
      }
    };
  }
});

// node_modules/core-js/internals/is-forced.js
var require_is_forced = __commonJS({
  "node_modules/core-js/internals/is-forced.js"(exports, module2) {
    var fails = require_fails();
    var isCallable = require_is_callable();
    var replacement = /#|\.prototype\./;
    var isForced = function(feature, detection) {
      var value = data[normalize(feature)];
      return value == POLYFILL ? true : value == NATIVE ? false : isCallable(detection) ? fails(detection) : !!detection;
    };
    var normalize = isForced.normalize = function(string) {
      return String(string).replace(replacement, ".").toLowerCase();
    };
    var data = isForced.data = {};
    var NATIVE = isForced.NATIVE = "N";
    var POLYFILL = isForced.POLYFILL = "P";
    module2.exports = isForced;
  }
});

// node_modules/core-js/internals/export.js
var require_export = __commonJS({
  "node_modules/core-js/internals/export.js"(exports, module2) {
    var global2 = require_global();
    var getOwnPropertyDescriptor = require_object_get_own_property_descriptor().f;
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    var redefine = require_redefine();
    var setGlobal = require_set_global();
    var copyConstructorProperties = require_copy_constructor_properties();
    var isForced = require_is_forced();
    module2.exports = function(options, source) {
      var TARGET = options.target;
      var GLOBAL = options.global;
      var STATIC = options.stat;
      var FORCED, target, key, targetProperty, sourceProperty, descriptor;
      if (GLOBAL) {
        target = global2;
      } else if (STATIC) {
        target = global2[TARGET] || setGlobal(TARGET, {});
      } else {
        target = (global2[TARGET] || {}).prototype;
      }
      if (target)
        for (key in source) {
          sourceProperty = source[key];
          if (options.noTargetGet) {
            descriptor = getOwnPropertyDescriptor(target, key);
            targetProperty = descriptor && descriptor.value;
          } else
            targetProperty = target[key];
          FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? "." : "#") + key, options.forced);
          if (!FORCED && targetProperty !== void 0) {
            if (typeof sourceProperty == typeof targetProperty)
              continue;
            copyConstructorProperties(sourceProperty, targetProperty);
          }
          if (options.sham || targetProperty && targetProperty.sham) {
            createNonEnumerableProperty(sourceProperty, "sham", true);
          }
          redefine(target, key, sourceProperty, options);
        }
    };
  }
});

// node_modules/core-js/internals/to-string-tag-support.js
var require_to_string_tag_support = __commonJS({
  "node_modules/core-js/internals/to-string-tag-support.js"(exports, module2) {
    var wellKnownSymbol = require_well_known_symbol();
    var TO_STRING_TAG = wellKnownSymbol("toStringTag");
    var test = {};
    test[TO_STRING_TAG] = "z";
    module2.exports = String(test) === "[object z]";
  }
});

// node_modules/core-js/internals/classof.js
var require_classof = __commonJS({
  "node_modules/core-js/internals/classof.js"(exports, module2) {
    var global2 = require_global();
    var TO_STRING_TAG_SUPPORT = require_to_string_tag_support();
    var isCallable = require_is_callable();
    var classofRaw = require_classof_raw();
    var wellKnownSymbol = require_well_known_symbol();
    var TO_STRING_TAG = wellKnownSymbol("toStringTag");
    var Object2 = global2.Object;
    var CORRECT_ARGUMENTS = classofRaw(function() {
      return arguments;
    }()) == "Arguments";
    var tryGet = function(it, key) {
      try {
        return it[key];
      } catch (error) {
      }
    };
    module2.exports = TO_STRING_TAG_SUPPORT ? classofRaw : function(it) {
      var O, tag, result;
      return it === void 0 ? "Undefined" : it === null ? "Null" : typeof (tag = tryGet(O = Object2(it), TO_STRING_TAG)) == "string" ? tag : CORRECT_ARGUMENTS ? classofRaw(O) : (result = classofRaw(O)) == "Object" && isCallable(O.callee) ? "Arguments" : result;
    };
  }
});

// node_modules/core-js/internals/to-string.js
var require_to_string = __commonJS({
  "node_modules/core-js/internals/to-string.js"(exports, module2) {
    var global2 = require_global();
    var classof = require_classof();
    var String2 = global2.String;
    module2.exports = function(argument) {
      if (classof(argument) === "Symbol")
        throw TypeError("Cannot convert a Symbol value to a string");
      return String2(argument);
    };
  }
});

// node_modules/core-js/internals/regexp-flags.js
var require_regexp_flags = __commonJS({
  "node_modules/core-js/internals/regexp-flags.js"(exports, module2) {
    "use strict";
    var anObject = require_an_object();
    module2.exports = function() {
      var that = anObject(this);
      var result = "";
      if (that.global)
        result += "g";
      if (that.ignoreCase)
        result += "i";
      if (that.multiline)
        result += "m";
      if (that.dotAll)
        result += "s";
      if (that.unicode)
        result += "u";
      if (that.sticky)
        result += "y";
      return result;
    };
  }
});

// node_modules/core-js/internals/regexp-sticky-helpers.js
var require_regexp_sticky_helpers = __commonJS({
  "node_modules/core-js/internals/regexp-sticky-helpers.js"(exports, module2) {
    var fails = require_fails();
    var global2 = require_global();
    var $RegExp = global2.RegExp;
    var UNSUPPORTED_Y = fails(function() {
      var re = $RegExp("a", "y");
      re.lastIndex = 2;
      return re.exec("abcd") != null;
    });
    var MISSED_STICKY = UNSUPPORTED_Y || fails(function() {
      return !$RegExp("a", "y").sticky;
    });
    var BROKEN_CARET = UNSUPPORTED_Y || fails(function() {
      var re = $RegExp("^r", "gy");
      re.lastIndex = 2;
      return re.exec("str") != null;
    });
    module2.exports = {
      BROKEN_CARET,
      MISSED_STICKY,
      UNSUPPORTED_Y
    };
  }
});

// node_modules/core-js/internals/object-keys.js
var require_object_keys = __commonJS({
  "node_modules/core-js/internals/object-keys.js"(exports, module2) {
    var internalObjectKeys = require_object_keys_internal();
    var enumBugKeys = require_enum_bug_keys();
    module2.exports = Object.keys || function keys(O) {
      return internalObjectKeys(O, enumBugKeys);
    };
  }
});

// node_modules/core-js/internals/object-define-properties.js
var require_object_define_properties = __commonJS({
  "node_modules/core-js/internals/object-define-properties.js"(exports) {
    var DESCRIPTORS = require_descriptors();
    var V8_PROTOTYPE_DEFINE_BUG = require_v8_prototype_define_bug();
    var definePropertyModule = require_object_define_property();
    var anObject = require_an_object();
    var toIndexedObject = require_to_indexed_object();
    var objectKeys = require_object_keys();
    exports.f = DESCRIPTORS && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
      anObject(O);
      var props = toIndexedObject(Properties);
      var keys = objectKeys(Properties);
      var length = keys.length;
      var index = 0;
      var key;
      while (length > index)
        definePropertyModule.f(O, key = keys[index++], props[key]);
      return O;
    };
  }
});

// node_modules/core-js/internals/html.js
var require_html = __commonJS({
  "node_modules/core-js/internals/html.js"(exports, module2) {
    var getBuiltIn = require_get_built_in();
    module2.exports = getBuiltIn("document", "documentElement");
  }
});

// node_modules/core-js/internals/object-create.js
var require_object_create = __commonJS({
  "node_modules/core-js/internals/object-create.js"(exports, module2) {
    var anObject = require_an_object();
    var definePropertiesModule = require_object_define_properties();
    var enumBugKeys = require_enum_bug_keys();
    var hiddenKeys = require_hidden_keys();
    var html = require_html();
    var documentCreateElement = require_document_create_element();
    var sharedKey = require_shared_key();
    var GT = ">";
    var LT = "<";
    var PROTOTYPE = "prototype";
    var SCRIPT = "script";
    var IE_PROTO = sharedKey("IE_PROTO");
    var EmptyConstructor = function() {
    };
    var scriptTag = function(content) {
      return LT + SCRIPT + GT + content + LT + "/" + SCRIPT + GT;
    };
    var NullProtoObjectViaActiveX = function(activeXDocument2) {
      activeXDocument2.write(scriptTag(""));
      activeXDocument2.close();
      var temp = activeXDocument2.parentWindow.Object;
      activeXDocument2 = null;
      return temp;
    };
    var NullProtoObjectViaIFrame = function() {
      var iframe = documentCreateElement("iframe");
      var JS = "java" + SCRIPT + ":";
      var iframeDocument;
      iframe.style.display = "none";
      html.appendChild(iframe);
      iframe.src = String(JS);
      iframeDocument = iframe.contentWindow.document;
      iframeDocument.open();
      iframeDocument.write(scriptTag("document.F=Object"));
      iframeDocument.close();
      return iframeDocument.F;
    };
    var activeXDocument;
    var NullProtoObject = function() {
      try {
        activeXDocument = new ActiveXObject("htmlfile");
      } catch (error) {
      }
      NullProtoObject = typeof document != "undefined" ? document.domain && activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame() : NullProtoObjectViaActiveX(activeXDocument);
      var length = enumBugKeys.length;
      while (length--)
        delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
      return NullProtoObject();
    };
    hiddenKeys[IE_PROTO] = true;
    module2.exports = Object.create || function create(O, Properties) {
      var result;
      if (O !== null) {
        EmptyConstructor[PROTOTYPE] = anObject(O);
        result = new EmptyConstructor();
        EmptyConstructor[PROTOTYPE] = null;
        result[IE_PROTO] = O;
      } else
        result = NullProtoObject();
      return Properties === void 0 ? result : definePropertiesModule.f(result, Properties);
    };
  }
});

// node_modules/core-js/internals/regexp-unsupported-dot-all.js
var require_regexp_unsupported_dot_all = __commonJS({
  "node_modules/core-js/internals/regexp-unsupported-dot-all.js"(exports, module2) {
    var fails = require_fails();
    var global2 = require_global();
    var $RegExp = global2.RegExp;
    module2.exports = fails(function() {
      var re = $RegExp(".", "s");
      return !(re.dotAll && re.exec("\n") && re.flags === "s");
    });
  }
});

// node_modules/core-js/internals/regexp-unsupported-ncg.js
var require_regexp_unsupported_ncg = __commonJS({
  "node_modules/core-js/internals/regexp-unsupported-ncg.js"(exports, module2) {
    var fails = require_fails();
    var global2 = require_global();
    var $RegExp = global2.RegExp;
    module2.exports = fails(function() {
      var re = $RegExp("(?<a>b)", "g");
      return re.exec("b").groups.a !== "b" || "b".replace(re, "$<a>c") !== "bc";
    });
  }
});

// node_modules/core-js/internals/regexp-exec.js
var require_regexp_exec = __commonJS({
  "node_modules/core-js/internals/regexp-exec.js"(exports, module2) {
    "use strict";
    var call = require_function_call();
    var uncurryThis = require_function_uncurry_this();
    var toString2 = require_to_string();
    var regexpFlags = require_regexp_flags();
    var stickyHelpers = require_regexp_sticky_helpers();
    var shared = require_shared();
    var create = require_object_create();
    var getInternalState = require_internal_state().get;
    var UNSUPPORTED_DOT_ALL = require_regexp_unsupported_dot_all();
    var UNSUPPORTED_NCG = require_regexp_unsupported_ncg();
    var nativeReplace = shared("native-string-replace", String.prototype.replace);
    var nativeExec = RegExp.prototype.exec;
    var patchedExec = nativeExec;
    var charAt = uncurryThis("".charAt);
    var indexOf = uncurryThis("".indexOf);
    var replace = uncurryThis("".replace);
    var stringSlice = uncurryThis("".slice);
    var UPDATES_LAST_INDEX_WRONG = function() {
      var re1 = /a/;
      var re2 = /b*/g;
      call(nativeExec, re1, "a");
      call(nativeExec, re2, "a");
      return re1.lastIndex !== 0 || re2.lastIndex !== 0;
    }();
    var UNSUPPORTED_Y = stickyHelpers.BROKEN_CARET;
    var NPCG_INCLUDED = /()??/.exec("")[1] !== void 0;
    var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y || UNSUPPORTED_DOT_ALL || UNSUPPORTED_NCG;
    if (PATCH) {
      patchedExec = function exec(string) {
        var re = this;
        var state = getInternalState(re);
        var str = toString2(string);
        var raw = state.raw;
        var result, reCopy, lastIndex, match, i, object, group;
        if (raw) {
          raw.lastIndex = re.lastIndex;
          result = call(patchedExec, raw, str);
          re.lastIndex = raw.lastIndex;
          return result;
        }
        var groups = state.groups;
        var sticky = UNSUPPORTED_Y && re.sticky;
        var flags = call(regexpFlags, re);
        var source = re.source;
        var charsAdded = 0;
        var strCopy = str;
        if (sticky) {
          flags = replace(flags, "y", "");
          if (indexOf(flags, "g") === -1) {
            flags += "g";
          }
          strCopy = stringSlice(str, re.lastIndex);
          if (re.lastIndex > 0 && (!re.multiline || re.multiline && charAt(str, re.lastIndex - 1) !== "\n")) {
            source = "(?: " + source + ")";
            strCopy = " " + strCopy;
            charsAdded++;
          }
          reCopy = new RegExp("^(?:" + source + ")", flags);
        }
        if (NPCG_INCLUDED) {
          reCopy = new RegExp("^" + source + "$(?!\\s)", flags);
        }
        if (UPDATES_LAST_INDEX_WRONG)
          lastIndex = re.lastIndex;
        match = call(nativeExec, sticky ? reCopy : re, strCopy);
        if (sticky) {
          if (match) {
            match.input = stringSlice(match.input, charsAdded);
            match[0] = stringSlice(match[0], charsAdded);
            match.index = re.lastIndex;
            re.lastIndex += match[0].length;
          } else
            re.lastIndex = 0;
        } else if (UPDATES_LAST_INDEX_WRONG && match) {
          re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
        }
        if (NPCG_INCLUDED && match && match.length > 1) {
          call(nativeReplace, match[0], reCopy, function() {
            for (i = 1; i < arguments.length - 2; i++) {
              if (arguments[i] === void 0)
                match[i] = void 0;
            }
          });
        }
        if (match && groups) {
          match.groups = object = create(null);
          for (i = 0; i < groups.length; i++) {
            group = groups[i];
            object[group[0]] = match[group[1]];
          }
        }
        return match;
      };
    }
    module2.exports = patchedExec;
  }
});

// node_modules/core-js/modules/es.regexp.exec.js
var require_es_regexp_exec = __commonJS({
  "node_modules/core-js/modules/es.regexp.exec.js"() {
    "use strict";
    var $ = require_export();
    var exec = require_regexp_exec();
    $({ target: "RegExp", proto: true, forced: /./.exec !== exec }, {
      exec
    });
  }
});

// node_modules/core-js/internals/function-apply.js
var require_function_apply = __commonJS({
  "node_modules/core-js/internals/function-apply.js"(exports, module2) {
    var NATIVE_BIND = require_function_bind_native();
    var FunctionPrototype = Function.prototype;
    var apply = FunctionPrototype.apply;
    var call = FunctionPrototype.call;
    module2.exports = typeof Reflect == "object" && Reflect.apply || (NATIVE_BIND ? call.bind(apply) : function() {
      return call.apply(apply, arguments);
    });
  }
});

// node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js
var require_fix_regexp_well_known_symbol_logic = __commonJS({
  "node_modules/core-js/internals/fix-regexp-well-known-symbol-logic.js"(exports, module2) {
    "use strict";
    require_es_regexp_exec();
    var uncurryThis = require_function_uncurry_this();
    var redefine = require_redefine();
    var regexpExec = require_regexp_exec();
    var fails = require_fails();
    var wellKnownSymbol = require_well_known_symbol();
    var createNonEnumerableProperty = require_create_non_enumerable_property();
    var SPECIES = wellKnownSymbol("species");
    var RegExpPrototype = RegExp.prototype;
    module2.exports = function(KEY, exec, FORCED, SHAM) {
      var SYMBOL = wellKnownSymbol(KEY);
      var DELEGATES_TO_SYMBOL = !fails(function() {
        var O = {};
        O[SYMBOL] = function() {
          return 7;
        };
        return ""[KEY](O) != 7;
      });
      var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function() {
        var execCalled = false;
        var re = /a/;
        if (KEY === "split") {
          re = {};
          re.constructor = {};
          re.constructor[SPECIES] = function() {
            return re;
          };
          re.flags = "";
          re[SYMBOL] = /./[SYMBOL];
        }
        re.exec = function() {
          execCalled = true;
          return null;
        };
        re[SYMBOL]("");
        return !execCalled;
      });
      if (!DELEGATES_TO_SYMBOL || !DELEGATES_TO_EXEC || FORCED) {
        var uncurriedNativeRegExpMethod = uncurryThis(/./[SYMBOL]);
        var methods = exec(SYMBOL, ""[KEY], function(nativeMethod, regexp, str, arg2, forceStringMethod) {
          var uncurriedNativeMethod = uncurryThis(nativeMethod);
          var $exec = regexp.exec;
          if ($exec === regexpExec || $exec === RegExpPrototype.exec) {
            if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
              return { done: true, value: uncurriedNativeRegExpMethod(regexp, str, arg2) };
            }
            return { done: true, value: uncurriedNativeMethod(str, regexp, arg2) };
          }
          return { done: false };
        });
        redefine(String.prototype, KEY, methods[0]);
        redefine(RegExpPrototype, SYMBOL, methods[1]);
      }
      if (SHAM)
        createNonEnumerableProperty(RegExpPrototype[SYMBOL], "sham", true);
    };
  }
});

// node_modules/core-js/internals/string-multibyte.js
var require_string_multibyte = __commonJS({
  "node_modules/core-js/internals/string-multibyte.js"(exports, module2) {
    var uncurryThis = require_function_uncurry_this();
    var toIntegerOrInfinity = require_to_integer_or_infinity();
    var toString2 = require_to_string();
    var requireObjectCoercible = require_require_object_coercible();
    var charAt = uncurryThis("".charAt);
    var charCodeAt = uncurryThis("".charCodeAt);
    var stringSlice = uncurryThis("".slice);
    var createMethod = function(CONVERT_TO_STRING) {
      return function($this, pos) {
        var S = toString2(requireObjectCoercible($this));
        var position = toIntegerOrInfinity(pos);
        var size = S.length;
        var first, second;
        if (position < 0 || position >= size)
          return CONVERT_TO_STRING ? "" : void 0;
        first = charCodeAt(S, position);
        return first < 55296 || first > 56319 || position + 1 === size || (second = charCodeAt(S, position + 1)) < 56320 || second > 57343 ? CONVERT_TO_STRING ? charAt(S, position) : first : CONVERT_TO_STRING ? stringSlice(S, position, position + 2) : (first - 55296 << 10) + (second - 56320) + 65536;
      };
    };
    module2.exports = {
      codeAt: createMethod(false),
      charAt: createMethod(true)
    };
  }
});

// node_modules/core-js/internals/advance-string-index.js
var require_advance_string_index = __commonJS({
  "node_modules/core-js/internals/advance-string-index.js"(exports, module2) {
    "use strict";
    var charAt = require_string_multibyte().charAt;
    module2.exports = function(S, index, unicode) {
      return index + (unicode ? charAt(S, index).length : 1);
    };
  }
});

// node_modules/core-js/internals/get-substitution.js
var require_get_substitution = __commonJS({
  "node_modules/core-js/internals/get-substitution.js"(exports, module2) {
    var uncurryThis = require_function_uncurry_this();
    var toObject = require_to_object();
    var floor = Math.floor;
    var charAt = uncurryThis("".charAt);
    var replace = uncurryThis("".replace);
    var stringSlice = uncurryThis("".slice);
    var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d{1,2}|<[^>]*>)/g;
    var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d{1,2})/g;
    module2.exports = function(matched, str, position, captures, namedCaptures, replacement) {
      var tailPos = position + matched.length;
      var m = captures.length;
      var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
      if (namedCaptures !== void 0) {
        namedCaptures = toObject(namedCaptures);
        symbols = SUBSTITUTION_SYMBOLS;
      }
      return replace(replacement, symbols, function(match, ch) {
        var capture;
        switch (charAt(ch, 0)) {
          case "$":
            return "$";
          case "&":
            return matched;
          case "`":
            return stringSlice(str, 0, position);
          case "'":
            return stringSlice(str, tailPos);
          case "<":
            capture = namedCaptures[stringSlice(ch, 1, -1)];
            break;
          default:
            var n = +ch;
            if (n === 0)
              return match;
            if (n > m) {
              var f = floor(n / 10);
              if (f === 0)
                return match;
              if (f <= m)
                return captures[f - 1] === void 0 ? charAt(ch, 1) : captures[f - 1] + charAt(ch, 1);
              return match;
            }
            capture = captures[n - 1];
        }
        return capture === void 0 ? "" : capture;
      });
    };
  }
});

// node_modules/core-js/internals/regexp-exec-abstract.js
var require_regexp_exec_abstract = __commonJS({
  "node_modules/core-js/internals/regexp-exec-abstract.js"(exports, module2) {
    var global2 = require_global();
    var call = require_function_call();
    var anObject = require_an_object();
    var isCallable = require_is_callable();
    var classof = require_classof_raw();
    var regexpExec = require_regexp_exec();
    var TypeError2 = global2.TypeError;
    module2.exports = function(R, S) {
      var exec = R.exec;
      if (isCallable(exec)) {
        var result = call(exec, R, S);
        if (result !== null)
          anObject(result);
        return result;
      }
      if (classof(R) === "RegExp")
        return call(regexpExec, R, S);
      throw TypeError2("RegExp#exec called on incompatible receiver");
    };
  }
});

// node_modules/core-js/modules/es.string.replace.js
var require_es_string_replace = __commonJS({
  "node_modules/core-js/modules/es.string.replace.js"() {
    "use strict";
    var apply = require_function_apply();
    var call = require_function_call();
    var uncurryThis = require_function_uncurry_this();
    var fixRegExpWellKnownSymbolLogic = require_fix_regexp_well_known_symbol_logic();
    var fails = require_fails();
    var anObject = require_an_object();
    var isCallable = require_is_callable();
    var toIntegerOrInfinity = require_to_integer_or_infinity();
    var toLength = require_to_length();
    var toString2 = require_to_string();
    var requireObjectCoercible = require_require_object_coercible();
    var advanceStringIndex = require_advance_string_index();
    var getMethod = require_get_method();
    var getSubstitution = require_get_substitution();
    var regExpExec = require_regexp_exec_abstract();
    var wellKnownSymbol = require_well_known_symbol();
    var REPLACE = wellKnownSymbol("replace");
    var max = Math.max;
    var min = Math.min;
    var concat = uncurryThis([].concat);
    var push = uncurryThis([].push);
    var stringIndexOf = uncurryThis("".indexOf);
    var stringSlice = uncurryThis("".slice);
    var maybeToString = function(it) {
      return it === void 0 ? it : String(it);
    };
    var REPLACE_KEEPS_$0 = function() {
      return "a".replace(/./, "$0") === "$0";
    }();
    var REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE = function() {
      if (/./[REPLACE]) {
        return /./[REPLACE]("a", "$0") === "";
      }
      return false;
    }();
    var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function() {
      var re = /./;
      re.exec = function() {
        var result = [];
        result.groups = { a: "7" };
        return result;
      };
      return "".replace(re, "$<a>") !== "7";
    });
    fixRegExpWellKnownSymbolLogic("replace", function(_, nativeReplace, maybeCallNative) {
      var UNSAFE_SUBSTITUTE = REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE ? "$" : "$0";
      return [
        function replace(searchValue, replaceValue) {
          var O = requireObjectCoercible(this);
          var replacer = searchValue == void 0 ? void 0 : getMethod(searchValue, REPLACE);
          return replacer ? call(replacer, searchValue, O, replaceValue) : call(nativeReplace, toString2(O), searchValue, replaceValue);
        },
        function(string, replaceValue) {
          var rx = anObject(this);
          var S = toString2(string);
          if (typeof replaceValue == "string" && stringIndexOf(replaceValue, UNSAFE_SUBSTITUTE) === -1 && stringIndexOf(replaceValue, "$<") === -1) {
            var res = maybeCallNative(nativeReplace, rx, S, replaceValue);
            if (res.done)
              return res.value;
          }
          var functionalReplace = isCallable(replaceValue);
          if (!functionalReplace)
            replaceValue = toString2(replaceValue);
          var global2 = rx.global;
          if (global2) {
            var fullUnicode = rx.unicode;
            rx.lastIndex = 0;
          }
          var results = [];
          while (true) {
            var result = regExpExec(rx, S);
            if (result === null)
              break;
            push(results, result);
            if (!global2)
              break;
            var matchStr = toString2(result[0]);
            if (matchStr === "")
              rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
          }
          var accumulatedResult = "";
          var nextSourcePosition = 0;
          for (var i = 0; i < results.length; i++) {
            result = results[i];
            var matched = toString2(result[0]);
            var position = max(min(toIntegerOrInfinity(result.index), S.length), 0);
            var captures = [];
            for (var j = 1; j < result.length; j++)
              push(captures, maybeToString(result[j]));
            var namedCaptures = result.groups;
            if (functionalReplace) {
              var replacerArgs = concat([matched], captures, position, S);
              if (namedCaptures !== void 0)
                push(replacerArgs, namedCaptures);
              var replacement = toString2(apply(replaceValue, void 0, replacerArgs));
            } else {
              replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
            }
            if (position >= nextSourcePosition) {
              accumulatedResult += stringSlice(S, nextSourcePosition, position) + replacement;
              nextSourcePosition = position + matched.length;
            }
          }
          return accumulatedResult + stringSlice(S, nextSourcePosition);
        }
      ];
    }, !REPLACE_SUPPORTS_NAMED_GROUPS || !REPLACE_KEEPS_$0 || REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE);
  }
});

// node_modules/core-js/internals/is-regexp.js
var require_is_regexp = __commonJS({
  "node_modules/core-js/internals/is-regexp.js"(exports, module2) {
    var isObject = require_is_object();
    var classof = require_classof_raw();
    var wellKnownSymbol = require_well_known_symbol();
    var MATCH = wellKnownSymbol("match");
    module2.exports = function(it) {
      var isRegExp;
      return isObject(it) && ((isRegExp = it[MATCH]) !== void 0 ? !!isRegExp : classof(it) == "RegExp");
    };
  }
});

// node_modules/core-js/modules/es.string.replace-all.js
var require_es_string_replace_all = __commonJS({
  "node_modules/core-js/modules/es.string.replace-all.js"() {
    "use strict";
    var $ = require_export();
    var global2 = require_global();
    var call = require_function_call();
    var uncurryThis = require_function_uncurry_this();
    var requireObjectCoercible = require_require_object_coercible();
    var isCallable = require_is_callable();
    var isRegExp = require_is_regexp();
    var toString2 = require_to_string();
    var getMethod = require_get_method();
    var regExpFlags = require_regexp_flags();
    var getSubstitution = require_get_substitution();
    var wellKnownSymbol = require_well_known_symbol();
    var IS_PURE = require_is_pure();
    var REPLACE = wellKnownSymbol("replace");
    var RegExpPrototype = RegExp.prototype;
    var TypeError2 = global2.TypeError;
    var getFlags = uncurryThis(regExpFlags);
    var indexOf = uncurryThis("".indexOf);
    var replace = uncurryThis("".replace);
    var stringSlice = uncurryThis("".slice);
    var max = Math.max;
    var stringIndexOf = function(string, searchValue, fromIndex) {
      if (fromIndex > string.length)
        return -1;
      if (searchValue === "")
        return fromIndex;
      return indexOf(string, searchValue, fromIndex);
    };
    $({ target: "String", proto: true }, {
      replaceAll: function replaceAll(searchValue, replaceValue) {
        var O = requireObjectCoercible(this);
        var IS_REG_EXP, flags, replacer, string, searchString, functionalReplace, searchLength, advanceBy, replacement;
        var position = 0;
        var endOfLastMatch = 0;
        var result = "";
        if (searchValue != null) {
          IS_REG_EXP = isRegExp(searchValue);
          if (IS_REG_EXP) {
            flags = toString2(requireObjectCoercible("flags" in RegExpPrototype ? searchValue.flags : getFlags(searchValue)));
            if (!~indexOf(flags, "g"))
              throw TypeError2("`.replaceAll` does not allow non-global regexes");
          }
          replacer = getMethod(searchValue, REPLACE);
          if (replacer) {
            return call(replacer, searchValue, O, replaceValue);
          } else if (IS_PURE && IS_REG_EXP) {
            return replace(toString2(O), searchValue, replaceValue);
          }
        }
        string = toString2(O);
        searchString = toString2(searchValue);
        functionalReplace = isCallable(replaceValue);
        if (!functionalReplace)
          replaceValue = toString2(replaceValue);
        searchLength = searchString.length;
        advanceBy = max(1, searchLength);
        position = stringIndexOf(string, searchString, 0);
        while (position !== -1) {
          replacement = functionalReplace ? toString2(replaceValue(searchString, position, string)) : getSubstitution(searchString, string, position, [], void 0, replaceValue);
          result += stringSlice(string, endOfLastMatch, position) + replacement;
          endOfLastMatch = position + searchLength;
          position = stringIndexOf(string, searchString, position + advanceBy);
        }
        if (endOfLastMatch < string.length) {
          result += stringSlice(string, endOfLastMatch);
        }
        return result;
      }
    });
  }
});

// node_modules/core-js/internals/entry-unbind.js
var require_entry_unbind = __commonJS({
  "node_modules/core-js/internals/entry-unbind.js"(exports, module2) {
    var global2 = require_global();
    var uncurryThis = require_function_uncurry_this();
    module2.exports = function(CONSTRUCTOR, METHOD) {
      return uncurryThis(global2[CONSTRUCTOR].prototype[METHOD]);
    };
  }
});

// node_modules/core-js/es/string/replace-all.js
var require_replace_all = __commonJS({
  "node_modules/core-js/es/string/replace-all.js"(exports, module2) {
    require_es_regexp_exec();
    require_es_string_replace();
    require_es_string_replace_all();
    var entryUnbind = require_entry_unbind();
    module2.exports = entryUnbind("String", "replaceAll");
  }
});

// node_modules/core-js/stable/string/replace-all.js
var require_replace_all2 = __commonJS({
  "node_modules/core-js/stable/string/replace-all.js"(exports, module2) {
    var parent = require_replace_all();
    module2.exports = parent;
  }
});

// node_modules/core-js/actual/string/replace-all.js
var require_replace_all3 = __commonJS({
  "node_modules/core-js/actual/string/replace-all.js"(exports, module2) {
    var parent = require_replace_all2();
    module2.exports = parent;
  }
});

// cli/index.tsx
__markAsModule(exports);
var import_path3 = __toModule(require("path"));
var import_promises = __toModule(require("fs/promises"));
var import_commander = __toModule(require_commander());

// lib/spaceGenerator.tsx
var import_path = __toModule(require("path"));
var import_swagger_parser = __toModule(require_lib4());
var import_path2 = __toModule(require("path"));
var import_case = __toModule(require_Case());
function createGitBookOpenAPITag(endpoint, openAPIFilename) {
  return `
{% swagger src="./.gitbook/assets/${openAPIFilename}" path="${endpoint.path}" method="${endpoint.operation}" %}
[${openAPIFilename}](<./.gitbook/assets/${openAPIFilename}>)
{% endswagger %}`;
}
function createTagPage(tag, endpoints, openAPIFilename) {
  const path2 = `${import_case.default.kebab(tag.name)}.md`;
  return {
    title: tag.name,
    path: path2,
    contents: `
# ${tag.name || ""}

${tag.description || ""}

${tag.externalDocs ? `[${tag.externalDocs.description}](${tag.externalDocs.url})` : ""}

${endpoints.map((endpoint) => createGitBookOpenAPITag(endpoint, openAPIFilename)).join("\n\n")}
  `.trim()
  };
}
function createSummaryFile(gitBookFiles) {
  const summaryFile = `# Table of contents

${gitBookFiles.map(({ path: path2, title, contents }) => {
    const p = (0, import_path2.basename)(path2, ".md");
    return `- [${title}](${path2.replaceAll(" ", "\\ ")})`;
  }).join("\n")}`;
  console.log(summaryFile);
  return summaryFile;
}
function createReadmeFile(spec) {
  return `# ${spec.info.title}`;
}
function makePagesForTagGroups(map, openAPIFilename) {
  return Array.from(map.entries()).map(([tag, endpoint]) => {
    return createTagPage(tag, endpoint, openAPIFilename);
  });
}
function collateTags(api) {
  const tagMap = new Map();
  const untaggedTag = { name: "__internal-untagged" };
  const operations = Object.entries(api.paths).flatMap(([path2, operations2]) => {
    return Object.entries(operations2).map(([operation, operationObject]) => {
      return { path: path2, operation, operationObject };
    });
  });
  const generatedTagCache = new Set();
  operations.forEach(({ path: path2, operation, operationObject }) => {
    if (operationObject.tags.length === 0) {
      tagMap.set(untaggedTag, [
        ...tagMap.get(untaggedTag) || [],
        { path: path2, operation, operationObject }
      ]);
    }
    operationObject.tags.forEach((tagName) => {
      let tag;
      if (api.tags) {
        tag = api.tags.find(({ name }) => {
          return name === tagName;
        });
      } else {
        const retreivedTag = Array.from(generatedTagCache.values()).find(({ name }) => name === tagName);
        if (retreivedTag) {
          tag = retreivedTag;
        } else {
          tag = { name: tagName };
          generatedTagCache.add(tag);
        }
      }
      tagMap.set(tag, [
        ...tagMap.get(tag) || [],
        { path: path2, operation, operationObject }
      ]);
    });
  });
  return tagMap;
}
async function cliEntrypoint(openAPIFilePath) {
  const api = await import_swagger_parser.default.validate(openAPIFilePath);
  const endpointsGroupedByTag = collateTags(api);
  const openAPIFilename = import_path.default.posix.basename(openAPIFilePath);
  const contentPages = makePagesForTagGroups(endpointsGroupedByTag, openAPIFilename);
  return [
    ...contentPages,
    {
      path: "README.md",
      contents: createReadmeFile(api)
    },
    {
      path: "SUMMARY.md",
      contents: createSummaryFile(contentPages)
    }
  ];
}

// cli/index.tsx
var import_replace_all = __toModule(require_replace_all3());
var program = new import_commander.Command();
program.requiredOption("-f, --file <file>", "Path to your OpenAPI specification");
program.option("-d, --destination <destination>", "The destination folder to contain your GitBook space.");
function prepareFileName(file) {
  if (typeof file === "string") {
    return (0, import_path3.resolve)(file);
  }
  throw new Error(`Provided file name ${file} is invalid.`);
}
async function main() {
  await program.parseAsync(process.argv);
  const { file, destination } = program.opts();
  const destinationFolder = destination || "./docs/";
  const openApiFileLocation = prepareFileName(file);
  console.log(openApiFileLocation);
  const result = await cliEntrypoint(openApiFileLocation);
  import_promises.default.mkdir((0, import_path3.resolve)(destinationFolder), { recursive: true });
  for (let { path: path2, contents } of result) {
    const fullPath = (0, import_path3.resolve)(destinationFolder, path2);
    import_promises.default.writeFile(fullPath, contents);
  }
  import_promises.default.writeFile((0, import_path3.resolve)(".gitbook.yaml"), `root: ${destinationFolder}`);
  await import_promises.default.mkdir((0, import_path3.resolve)(destinationFolder, ".gitbook/assets/"), {
    recursive: true
  });
  import_promises.default.copyFile(openApiFileLocation, (0, import_path3.resolve)("./docs/.gitbook/assets", (0, import_path3.basename)(openApiFileLocation)));
}
main();
/*! Case - v1.6.2 - 2020-03-24
* Copyright (c) 2020 Nathan Bubna; Licensed MIT, GPL */
