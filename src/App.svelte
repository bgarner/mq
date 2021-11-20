<script>
	import page from 'page';
  	import Router from './pager/Router.svelte';
  	import Route from './pager/Route.svelte';
  	import NotFound from './pager/NotFound.svelte';

	import Home from './pages/Home.svelte';
	import Register from './pages/Register.svelte';

</script>

<Router>
	<Route path="/" component="{Home}" />
	<Route path="/register" component="{Register}" />
	<NotFound>
	  <h2>Sorry. Page not found.</h2>
	</NotFound>
</Router>