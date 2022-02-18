<script>
	import Header from '../components/Header.svelte';
	import Nav from '../components/Nav.svelte';
	import ParticipantsNav from '../components/ParticipantsNav.svelte';
</script>

<div class="stage">
	
	<Header />

	<Nav />

	<div class="content">

		<ParticipantsNav />
		<div class="float-left" style="width: 75%;">
			<h1 class="text-4xl tracking-tight font-bold text-gray-900 sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl text-center pb-10">Participants</h1>

			<p>Welcome, Moroni's Quest participants! Use the navigation the left to find the information you are looking for.</p>

			
		</div>
		<br style="clear: both;" />
	</div>

</div>

<style>
</style>