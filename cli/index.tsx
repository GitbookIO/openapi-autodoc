#!/usr/bin/env node
import { resolve, basename } from "path";
import fs from "fs/promises";
import { Command } from "commander";
import { cliEntrypoint } from "../lib";
import "core-js/actual/string/replace-all";

const program = new Command();

program.requiredOption(
  "-f, --file <file>",
  "Path to your OpenAPI specification"
);

program.option(
  "-d, --destination <destination>",
  "The destination folder to contain your GitBook space."
);

function prepareFileName(file: any): string {
  if (typeof file === "string") {
    return resolve(file);
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
  fs.mkdir(resolve(destinationFolder), { recursive: true });
  for (let { path, contents } of result) {
    const fullPath = resolve(destinationFolder, path);
    fs.writeFile(fullPath, contents);
  }
  fs.writeFile(resolve(".gitbook.yaml"), `root: ${destinationFolder}`);
  await fs.mkdir(resolve(destinationFolder, ".gitbook/assets/"), {
    recursive: true,
  });
  fs.copyFile(
    openApiFileLocation,
    resolve("./docs/.gitbook/assets", basename(openApiFileLocation))
  );
}

main();

export {};
