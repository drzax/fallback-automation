import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { env } from '$env/dynamic/private';
import pkg from '../../package.json' with { type: 'json' };

const isLocal = env.IS_LOCAL === '1';
const executablePath = isLocal
	? env.BROWSER_PATH
	: await chromium.executablePath(
			`https://github.com/Sparticuz/chromium/releases/download/v${pkg.dependencies['@sparticuz/chromium-min']}/chromium-v${pkg.dependencies['@sparticuz/chromium-min']}-pack.x64.tar`
		);

/**
 *
 * @param {string} url The URL to screenshot
 * @param {string} [selector] A CSS selector for the element to screenshot (default: `'body'`)
 * @param {number} [width] Set the viewport width before taking screenshot (default: `810`)
 * @param {number} [height] Set the viewport height before taking screenshot (default: `1080`)
 */
export async function getScreenshot(url, selector = 'body', width = 1200, height = 1080) {
	const browser = await puppeteer.launch({
		args: puppeteer.defaultArgs({ args: isLocal ? [] : chromium.args, headless: 'shell' }),
		defaultViewport: { width, height, deviceScaleFactor: 2 },
		executablePath,
		headless: 'shell'
	});

	try {
		const page = await browser.newPage();
		await page.goto(url);
		const el = await page.waitForSelector(selector);
		const file = await el?.screenshot({
			captureBeyondViewport: true
		});
		return file;
	} finally {
		await browser.close();
	}
}
