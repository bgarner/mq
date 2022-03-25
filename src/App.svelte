<script>
	import page from 'page';
  	import Router from './router/Router.svelte';
  	import Route from './router/Route.svelte';
  	import NotFound from './router/NotFound.svelte';

	import Home from './pages/Home.svelte';
	import Register from './pages/Register.svelte';
	import Participants from './pages/Participants.svelte';
	import PackingList from './pages/PackingList.svelte';
	import Clothing from './pages/Clothing.svelte';
	import ComeReadWithUs from './pages/ComeReadWithUs.svelte';

</script>

<Router>
	<Route path="/" component="{Home}" />
	<Route path="/register" component="{Register}" />
	<Route path="/participants" component="{Participants}" />
	<Route path="/participants/packing" component="{PackingList}" />
	<Route path="/participants/clothing" component="{Clothing}" />
	<Route path="/participants/comereadwithus" component="{ComeReadWithUs}" />
	<NotFound>
	  <h2>Sorry. Page not found.</h2>
	  <p><a href="/">Return Home</a></p>
	</NotFound>
</Router>

<style global>
	@tailwind base;
	@tailwind components;
	@tailwind utilities;

	.stage{
	  position: absolute;
	  top: 0px;
	  left: 0px;
	  padding: 0; margin: 0;
	  width: 100%;
	  height: 100%;
	  clear: both;
	}

	.content {
	
	}	

	.content {
		@apply rounded-lg;
		@apply clear-left;
		@apply clear-right;
		@apply sm:w-full md:w-5/6 lg:w-5/6;

		margin: 0 auto;
		background-color: #fff;
		position: relative;
		top:  -220px;
		padding: 20px 30px;
		/*
		filter:  drop-shadow(-1px -7px 4px #999);
		*/
		clear: both;
	}

	.content p, .content ul, .content li, .content h1, .content h2, .content h3 {
		@apply text-gray-600;
	}

	.content p {
		@apply mt-3 mx-auto text-lg sm:text-xl md:mt-5 md:max-w-3xl
	}

	.content a{
		@apply text-yellow-700;
	}

  *{
    font-family: 'Inter', sans-serif;
  }
</style>