<script>
	import { run } from 'svelte/legacy';

	import { browser } from '$app/environment';
	import Loading from '$lib/Loading.svelte';
	import { download, fetchImageBlob } from '$lib/utils';
	import { onMount } from 'svelte';

	/** @type {string} */
	let url = $state('');

	/** @type {string} */
	let name = $state('');
	/** @type {string} */
	let selector = $state('');
	/** @type {number} */
	let width = $state(810);
	/** @type {number} */
	let height = $state(1080);

	/** @type {import('../lib/utils.js').Item | null} */
	let preview = $state(null);

	/** @type {HTMLDialogElement|undefined}*/
	let previewModal = $state();

	let downloadingAll = $state(false);

	/**
	 * @param {number} i
	 */
	const removeItem = (i) => {
		items = items.filter((_, idx) => i !== idx);
		localStorage.setItem('items', JSON.stringify(items));
	};

	const addItem = () => {
		const item = {
			url,
			name,
			selector,
			width,
			height,
			file: fetchImageBlob(url, selector, width, height)
		};
		items = [...items, item];
		preview = item;
		name = '';
		selector = '';

		localStorage.setItem('items', JSON.stringify(items));
		localStorage.setItem('name', String(name));
		localStorage.setItem('selector', String(selector));
		localStorage.setItem('width', String(width));
		localStorage.setItem('height', String(height));
	};

	run(() => {
		if (browser && url.length) localStorage.setItem('url', url);
	});

	run(() => {
		if (preview && preview.file === null) {
			preview.file = fetchImageBlob(preview.url, preview.selector, preview.width, preview.height);
		}
	});

	/** @type {import('../lib/utils.js').Item[]}*/
	let items = $state([]);

	onMount(() => {
		url = localStorage.getItem('url') || url;
		name = localStorage.getItem('name') || name;
		selector = localStorage.getItem('selector') || selector;
		if (localStorage.getItem('width')) width = +(localStorage.getItem('width') || width);
		if (localStorage.getItem('height')) height = +(localStorage.getItem('height') || height);

		try {
			const maybeItems = localStorage.getItem('items');
			if (maybeItems) {
				items = JSON.parse(maybeItems);
				items.forEach((d) => (d.file = null));
			}
		} catch (e) {
			localStorage.removeItem('items');
		}
	});
</script>

<div class="u-grid">
	<form
		onsubmit={(e) => {
			addItem();
		}}
		class="u-grid"
	>
		<label for="source"
			>Source page <input required bind:value={url} id="source" type="url" /></label
		>

		<label for="item-name">Filename <input required bind:value={name} id={`item-name`} /></label>

		<label for="item-selector"
			>CSS selector <input required bind:value={selector} id={`item-selector`} /></label
		>

		<label for="item-width"
			>Viewport <div>
				<label for="item-width">Width</label>
				<input
					required
					bind:value={width}
					id={`item-width`}
					type="number"
					min="300"
					step="10"
					max="1900"
				/>
				<label for="item-height">Height</label>
				<input
					required
					bind:value={height}
					id={`item-height`}
					type="number"
					min="300"
					step="10"
					max="1900"
				/>
			</div></label
		>
		<div>
			<button type="submit">Add</button>
		</div>
	</form>
	{#if items.length}
		<div>
			<button
				disabled={downloadingAll}
				onclick={async (e) => {
					downloadingAll = true;
					Promise.all(items.map(download)).then(() => (downloadingAll = false));
				}}
				>{#if downloadingAll}Generating ...{:else}Download All{/if}</button
			>
		</div>
		<table>
			<thead>
				<tr>
					<th>URL</th>
					<th>File name</th>
					<th>Selector</th>
					<th>Width</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each items as { url, name, selector, width }, i}
					<tr>
						<th>{url}</th>
						<td>{name}</td>
						<td>{selector}</td>
						<td>{width}</td>
						<td class="actions">
							<button
								onclick={() => {
									preview = items[i];
									previewModal?.showModal();
								}}>View</button
							>
							<button onclick={() => removeItem(i)}>Remove</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
<dialog bind:this={previewModal}>
	{#if preview && preview.file}
		<header>
			<div>
				<h2>Preview: {preview.name}</h2>
				<pre>{preview.selector}</pre>
			</div>
			<div>
				{#await preview.file}
					<button onclick={() => preview && download(preview)}>Download</button>
				{/await}
				<button onclick={() => previewModal?.close()}>Close</button>
			</div>
		</header>
		<div class="image-container">
			{#await preview.file}
				<Loading>
					<p>Generating screenshot ...</p>
				</Loading>
			{:then blob}
				<img
					src={URL.createObjectURL(blob)}
					alt="Screenshot of
  element {preview.selector} on {url}"
				/>
			{:catch}
				<p>Error creating screenshot</p>
			{/await}
		</div>
	{/if}
</dialog>

<style>
	form {
		grid-template-columns: 1fr 1fr;
		max-width: 800px;
		margin: 0 auto;
	}

	input {
		font-size: var(--step-0);
		border-radius: 5px;
		border: 1px solid #ccc;
		display: block;
		margin-top: var(--space-2xs);
		padding: var(--space-2xs);
		width: 100%;
		box-sizing: border-box;
	}

	[for='item-width'] input {
		display: inline;
		width: auto;
	}

	table {
		border-collapse: collapse;
	}

	th {
		text-align: left;
		font-size: var(--step--1);
		padding: var(--space-s) 0;
	}

	td {
		padding: var(--space-s) 0;
	}

	thead {
		border: 1px solid #ccc;
		border-left: 0;
		border-right: 0;
	}

	button {
		border: none;
		border-radius: 999em;
		background: #555;
		color: white;
		font-weight: bold;
		font-size: var(--step-0);
		padding: var(--space-2xs) var(--space-s);
	}

	td.actions {
		text-align: right;
	}

	td.actions button {
		font-size: var(--step--1);
	}

	.actions {
		white-space: nowrap;
	}

	dialog {
		width: 100dvw;
		height: 100dvh;
		max-height: 90dvh;
		max-width: 90dvw;
		position: relative;
		padding: 0;
		border: 1px solid #ddd;
		border-radius: 5px;
		background-color: #efefef;
	}

	dialog header {
		position: sticky;
		top: 0;
		background-color: #ccc;
		padding: var(--space-s);
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	dialog header h2 {
		font-size: var(--step-0);
		margin: 0;
	}

	dialog header pre {
		font-size: var(--step--2);
		margin-bottom: 0;
	}

	dialog img {
		display: block;
		margin: var(--space-s) auto;
		max-width: 100%;
		height: auto;
	}

	.image-container {
		margin: var(--space-s);
	}
</style>
