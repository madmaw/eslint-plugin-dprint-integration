import { readFileSync, readdirSync } from "node:fs";

import { Linter } from "eslint";
import * as parserPlain from "eslint-parser-plain";
import { describe, expect, it } from "vitest";

import DprintIntegration from "../src";

const linter = new Linter();
const linterConfig = {
	parser: "plain",
	rules: {
		dprint: [
			"error",
			{},
			{
				malva: {
					declarationOrder: "alphabetical",
				},
			},
		],
	},
} satisfies Linter.Config;

linter.defineParser("plain", parserPlain as any);
linter.defineRule("dprint", DprintIntegration.rules.dprint);

describe("format", () => {
	const folder = "./test/__fixtures__/format/";
	const files = readdirSync(folder);
	const fixtureFiles = files.map<[string, string]>((file) => [
		file,
		readFileSync(folder + file, "utf-8"),
	]);

	const results = fixtureFiles.map(([file, source]) => {
		const { output, messages, fixed } = linter.verifyAndFix(
			source,
			linterConfig,
			file,
		);

		return {
			file,
			output,
			messages,
			fixed,
		};
	});

	for (const { file, output, messages, fixed } of results) {
		it(`File: ${file}`, async () => {
			expect(output).toMatchSnapshot();
			expect(messages).toMatchSnapshot();
			expect(fixed).toBeTruthy();
		});
	}
});
