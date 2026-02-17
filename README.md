# Fallback Automation

A quickly hacked together tool for speeding up the creation of fallback imagery for interactive content by capturing browser output.

## Usage

Try it out at https://fallback-automation.vercel.app/

It works by loading the page in a headless browser and taking a screenshot of the specified element.

Start by specifying the URL you want to capture fallback images from. The page needs to be accessible from the internet; see the [development docs](#development) below to run a local copy if you need to capture pages from locally accessible pages.

Then add a list of CSS selectors specifying the elements to capture.

You can (optionally) name the images to be captured. You can also (optionally; default 1200px) specify a browser width
at which to capture the images. Captures are made at a [device pixel
ratio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) of 2.

> [!WARNING]
> There is a bug in Chromium that results in screenshots taller than 16384px having repeated content. This API doesn't
> provide a workaround for that. If you need screenshots taller than this, look into other options.

## Development

The `puppeteer-core` and `@sparticuz/chromium-min` dependencies are pinned to specific versions because they
`@sparticuz/chromium-min` [doesn't follow semantic
versioning](https://github.com/Sparticuz/chromium?tab=readme-ov-file#versioning) and the versions of these packages must
be compatible. In addition the version of Chrome used [must be compatible with the version of Puppeeteer](https://pptr.dev/supported-browsers).

To run locally, a local version of the Google Chrome binaries that work with the installed version of
[puppeteer-core](https://pptr.dev) and
[@sparticuz/chromium-min](https://github.com/Sparticuz/chromium?tab=readme-ov-file) must be installed locally. The
easiest way to get them are is to run `npm run local-setup` which will download the required version and save it to
`.cache-browser` if it doesn't exist and (optionally) update your `.env` file to point to the right binary.

```
git clone https://github.com/drzax/fallback-automation.git
cd fallback-automation
npm i
npm run local-setup
npm run dev
```

## Authors

- Simon Elvery ([@drzax](https://github.com/drzax))
