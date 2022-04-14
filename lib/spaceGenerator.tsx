import path from 'path';

import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPI } from "openapi-types";
import { basename } from "path";
import Case from "case";

interface GitBookFile {
  title: string;
  path: string;
  contents: string;
}

function createGitBookOpenAPITag(endpoint: Endpoint, openAPIFilename: string) {
  return `
{% swagger src="./.gitbook/assets/${openAPIFilename}" path="${endpoint.path}" method="${endpoint.operation}" %}
[${openAPIFilename}](<./.gitbook/assets/${openAPIFilename}>)
{% endswagger %}`;
}

function createTagPage(tag: TagObject, endpoints: Endpoint[], openAPIFilename: string): GitBookFile {
  const path = `${Case.kebab(tag.name)}.md`;
  return {
    title: tag.name,
    path,
    contents: `
# ${tag.name || ""}

${tag.description || ""}

${
  tag.externalDocs
    ? `[${tag.externalDocs.description}](${tag.externalDocs.url})`
    : ""
}

${endpoints.map(endpoint => createGitBookOpenAPITag(endpoint, openAPIFilename)).join("\n\n")}
  `.trim(),
  };
}

function createSummaryFile(gitBookFiles: GitBookFile[]): string {
  const summaryFile = `# Table of contents

${gitBookFiles
  .map(({ path, title, contents }: GitBookFile) => {
    const p = basename(path, ".md");
    return `- [${title}](${path.replaceAll(" ", "\\ ")})`;
  })
  .join("\n")}`;
  console.log(summaryFile);
  return summaryFile;
}

function createReadmeFile(spec: OpenAPI.Document) {
  return `# ${spec.info.title}`;
}

interface Endpoint {
  operationObject: OperationObject;
  path: string;
  operation: string;
}

type TagObject = OpenAPI.Document["tags"][0];
type OperationsObject = OpenAPI.Document["paths"][string];
type OperationObject = OperationsObject["get"];

export function makePagesForTagGroups(map: Map<TagObject, Endpoint[]>, openAPIFilename: string) {
  return Array.from(map.entries()).map(
    ([tag, endpoint]: [TagObject, Endpoint[]]) => {
      return createTagPage(tag, endpoint, openAPIFilename);
    }
  );
}

export function collateTags(api: OpenAPI.Document) {
  const tagMap: Map<TagObject, Endpoint[]> = new Map();
  const untaggedTag: TagObject = { name: "__internal-untagged" };
  const operations = Object.entries(api.paths).flatMap(
    ([path, operations]: [string, OperationsObject]) => {
      return Object.entries(operations).map(
        ([operation, operationObject]: [string, OperationObject]) => {
          return { path, operation, operationObject };
        }
      );
    }
  );

  /*
   * OpenAPI doesn't require a tag to be defined at the spec level, ad-hoc tags
   * can be defined at the operation level. To support this, we will generate
   * them on the fly, but we need to cache them so that we can use the same
   * object to key the tagMap. Otherwise, we end up with duplicate keys.
   */
  const generatedTagCache = new Set<TagObject>();

  operations.forEach(({ path, operation, operationObject }) => {
    if (operationObject.tags.length === 0) {
      tagMap.set(untaggedTag, [
        ...(tagMap.get(untaggedTag) || []),
        { path, operation, operationObject },
      ]);
    }
    operationObject.tags.forEach((tagName) => {
      let tag: TagObject;
      if (api.tags) {
        tag = api.tags.find(({ name }) => {
          return name === tagName;
        });
      } else {
        const retreivedTag = Array.from(generatedTagCache.values()).find(
          ({ name }) => name === tagName
        );
        if (retreivedTag) {
          tag = retreivedTag;
        } else {
          tag = { name: tagName };
          generatedTagCache.add(tag);
        }
      }
      tagMap.set(tag, [
        ...(tagMap.get(tag) || []),
        { path, operation, operationObject },
      ]);
    });
  });
  return tagMap;
}

export async function cliEntrypoint(openAPIFilePath: string) {
  const api = await SwaggerParser.validate(openAPIFilePath);
  const endpointsGroupedByTag = collateTags(api);

  const openAPIFilename = path.posix.basename(openAPIFilePath);
  const contentPages = makePagesForTagGroups(endpointsGroupedByTag, openAPIFilename);
  return [
    ...contentPages,
    {
      path: "README.md",
      contents: createReadmeFile(api),
    },
    {
      path: "SUMMARY.md",
      contents: createSummaryFile(contentPages),
    },
  ];
}
