import { readFile, writeFile } from "node:fs/promises";
import { load } from "cheerio";

const BASE_URL = "https://arcticjs.dev/";

const response = await fetch(BASE_URL);

const data = await response.text();

const $ = load(data);

interface Provider {
	title: string;
	href: string;
}

const providers: Provider[] = [];

$("#mobile-menu-nav > section:nth-child(2) > ul > li > a").each(
	(_, element) => {
		providers.push({
			href: `${BASE_URL.slice(0, -1)}${element.attribs.href}`,
			title: $(element).text(),
		});
	},
);

console.log(providers, providers.length);

const readme = String(await readFile("./README.md"));

const newReadme = readme
	.replace(/than \*\*(.*)\*\* oauth2/i, `than **${providers.length}** oauth2`)
	.replace(
		"## Supported providers",
		`## Supported providers\n\n${providers.map((provider) => `- [${provider.title}](${provider.href})`).join("\n")}`,
	);

await writeFile("./README.md", newReadme);
