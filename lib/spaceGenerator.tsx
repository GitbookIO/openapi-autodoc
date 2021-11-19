import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenAPI } from "openapi-types";
import { basename } from "path";
import Case from "case";
import JSZip from "jszip";

interface GitBookFile {
  title: string;
  path: string;
  contents: string;
}

function createGitBookOpenAPITag(endpoint: Endpoint) {
  return `
{% swagger src="./.gitbook/assets/openapi.yaml" path="${endpoint.path}" method="${endpoint.operation}" %}
[openapi.yaml](<./.gitbook/assets/openapi.yaml>)
{% endswagger %}`;
}

function createTagPage(tag: TagObject, endpoints: Endpoint[]): GitBookFile {
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

${endpoints.map(createGitBookOpenAPITag).join("\n\n")}
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

export async function createZipBundle(
  gitBookFiles: GitBookFile[],
  spec: string,
  parsedSpec: OpenAPI.Document
) {
  const bundle = new JSZip();
  gitBookFiles.forEach(({ path, contents }) => {
    bundle.file(path, contents);
  });
  const gitbookPrivateFolder = bundle.folder(".gitbook");
  gitbookPrivateFolder.file("openapi.yaml", spec);
  return await bundle.generateAsync({ type: "blob" });
}

interface Endpoint {
  operationObject: OperationObject;
  path: string;
  operation: string;
}

type TagObject = OpenAPI.Document["tags"][0];
type OperationsObject = OpenAPI.Document["paths"][string];
type OperationObject = OperationsObject["get"];

export function makePagesForTagGroups(map: Map<TagObject, Endpoint[]>) {
  return Array.from(map.entries()).map(
    ([tag, endpoint]: [TagObject, Endpoint[]]) => {
      return createTagPage(tag, endpoint);
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
  operations.forEach(({ path, operation, operationObject }) => {
    if (operationObject.tags.length === 0) {
      tagMap.set(untaggedTag, [
        ...(tagMap.get(untaggedTag) || []),
        { path, operation, operationObject },
      ]);
    }
    operationObject.tags.forEach((tagName) => {
      const tag: TagObject = api.tags.find(({ name }) => {
        return name === tagName;
      });
      tagMap.set(tag, [
        ...(tagMap.get(tag) || []),
        { path, operation, operationObject },
      ]);
    });
  });
  return tagMap;
}

export async function prepareBundleForSpec(
  apiObject: any,
  filecontentsdecoded: string
) {
  let api = await SwaggerParser.validate(apiObject);
  let endpointsGroupedByTag = collateTags(api);
  let contentPages = makePagesForTagGroups(endpointsGroupedByTag);
  let pages = [
    ...contentPages,
    {
      title: "README",
      path: "README.md",
      contents: createReadmeFile(api),
    },
    {
      title: "Summary",
      path: "SUMMARY.md",
      contents: createSummaryFile(contentPages),
    },
  ];
  const bundle = await createZipBundle(pages, filecontentsdecoded, api);
  return bundle;
}

export async function cliEntrypoint(filename: string) {
  let api = await SwaggerParser.validate(filename);
  let endpointsGroupedByTag = collateTags(api);
  let contentPages = makePagesForTagGroups(endpointsGroupedByTag);
  let pages = [
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
  return pages;
}
