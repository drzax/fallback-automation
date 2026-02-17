import pkg from '../../package.json' with { type: 'json' };
import { confirm } from '@clack/prompts';
import { Browser, computeExecutablePath, install, resolveBuildId } from '@puppeteer/browsers';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const [chromiumVersion] = pkg.dependencies['@sparticuz/chromium-min'].split('.');

// @ts-expect-error process.platform includes platforms that aren't supported by resolveBuildId
const buildId = await resolveBuildId(Browser.CHROME, process.platform, chromiumVersion);
const cacheDir = resolve(import.meta.dirname, '..', '..', '.cache-browser');
const envFile = resolve(import.meta.dirname, '..', '..', '.env');

console.log(`Checking for required browser version in browser cache directory...`);

/**
 * @type import('@puppeteer/browsers').InstallOptions & {unpack?: true | undefined}
 */
const config = {
	browser: Browser.CHROME,
	buildId,
	cacheDir,
	downloadProgressCallback: (downloaded, total) => {
		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write(`Downloading browser ${((downloaded / total) * 100).toFixed(0)}%`);
		if (downloaded === total) {
			process.stdout.write('\n'); // end the line
			process.stdout.write('Browser executable downloaded');
			process.stdout.write('\n'); // end the line
		}
	}
};

await install(config);

const executablePath = computeExecutablePath(config);

/**
 * @param {string[]} lines
 * @param {(d:string) => boolean} matcher
 * @param {string} replacement
 */
const replaceOrAdd = (lines, matcher, replacement) => {
	const idx = lines.findIndex(matcher);
	if (idx === -1) {
		lines.push(replacement);
	} else {
		lines[idx] = replacement;
	}
};

const envFileExists = existsSync(envFile);

const envVars = [
	['IS_LOCAL', '1'],
	['BROWSER_PATH', executablePath]
];

const shouldUpdateEnvFile =
	!envFileExists ||
	(await confirm({
		message: `This will modify the content of your .env file which is not version controlled. Are you sure?`
	}));

if (shouldUpdateEnvFile) {
	const envContent = envFileExists ? readFileSync(envFile, { encoding: 'utf-8' }) : '';
	const lines = envContent.split('\n');
	for (let [name, val] of envVars) {
		replaceOrAdd(lines, (d) => d.startsWith(`${name}=`), `${name}="${val}"`);
	}
	writeFileSync(envFile, lines.join('\n'));
	console.log(`Added or modified the following lines are in your .env file:`);
	for (let [name, val] of envVars) {
		console.log(` | ${name}="${val}"`);
	}
} else {
	console.log(`Make sure the following lines are in your .env file:`);
	for (let [name, val] of envVars) {
		console.log(` | ${name}="${val}"`);
	}
}

console.log('Done');
