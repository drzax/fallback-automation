import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium-min';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
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
 * @param {string} [selector] A CSS selector for the element to screenshot. If set captures the first element matching
 * the selector, otherwise captures the full page.
 * @param {number} [width] Set the viewport width before taking screenshot (default: `1200`)
 * @param {number} [height] Set the viewport height before taking screenshot (default: `1080`)
 * @param {number} [delay] Pause before capture in milliseconds (default: `0`)
 */
export async function getScreenshot(
	url,
	selector = 'body',
	width = 1200,
	height = 1080,
	delay = 0
) {
	const browser = await puppeteer.launch({
		args: puppeteer.defaultArgs({
			args: isLocal ? ['--ignore-ssl-errors', '--ignore-certificate-errors'] : chromium.args,
			headless: 'shell',
			acceptInsecureCerts: dev
		}),
		defaultViewport: { width, height, deviceScaleFactor: 2 },
		executablePath,
		headless: 'shell'
	});

	try {
		const page = await browser.newPage();
		await page.goto(url);

		const element = typeof selector === 'undefined' ? page : await page.waitForSelector(selector);

		if (!element) throw new Error('Element not found');

		if (delay > 0) {
			await new Promise((resolve) => setTimeout(resolve, delay));
		}

		const file = await element.screenshot({
			captureBeyondViewport: true,
			fullPage: element === page
		});
		return file;
	} finally {
		await browser.close();
	}
}
