<script>
  import { register, activeRoute } from './Router.svelte';

  // page.js catch all handler eg "not found" in this context
  export let path = '*';
  export let component = null;

  register({ path, component });
</script>

{#if $activeRoute.path === path}
  <svelte:component this="{component}" />
  <slot />
{/if}