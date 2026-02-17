/**
 * @typedef {object} Item
 * @prop {string} url
 * @prop {string} name
 * @prop {string} selector
 * @prop {number} width
 * @prop {number} height
 * @prop {Promise<Blob> | null} file
 */

/**
 * Get a URL for a screenshot image
 * @param {string} url The page URL
 * @param {string} selector The CSS selector
 * @param {number} width Viewport width
 * @param {number} height Viewport height
 */
export const getImageUrl = (url, selector, width, height) => {
	return `/api?url=${url}&selector=${selector}&width=${width}&height=${height}`;
};

/**
 * Fetch an image from the server
 * @param {string} url
 * @param {string} selector
 * @param {number} width
 * @param {number} height
 */
export const fetchImageBlob = async (url, selector, width, height) => {
	const res = await fetch(getImageUrl(url, selector, width, height));
	if (!res.ok) throw new Error('Could not generate screenshot');
	return await res.blob();
};

/**
 *
 * @param {Item} item
 */
export let download = async (item) => {
	if (item.file === null) {
		item.file = fetchImageBlob(item.url, item.selector, item.width, item.height);
	}
	const link = document.createElement('a');
	link.style.display = 'none';
	document.body.appendChild(link);
	link.setAttribute('href', URL.createObjectURL(await item.file));
	link.setAttribute('download', `${item.name}.png`);
	link.click();
	document.body.removeChild(link);
};
