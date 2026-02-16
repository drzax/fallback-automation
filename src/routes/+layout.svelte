<script>
	import '../styles.css';
	/**
	 * @typedef {Object} Props
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { children } = $props();
</script>

<div class="u-grid container">
	<h1>Screenshots</h1>
	{@render children?.()}
</div>

<style>
	.container {
		max-width: 1200px;
		box-sizing: border-box;
		width: 100%;
		margin: 0 auto;
		padding: 0 var(--space-m);
	}

	h1 {
		font-size: var(--step-2);
		text-align: center;
	}
</style>
