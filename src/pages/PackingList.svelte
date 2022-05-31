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

			<h1 class="text-4xl tracking-tight font-bold text-gray-900 sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl text-center pb-10">Packing List</h1>
			<p>Please ensure <strong>ALL</strong> items are well labelled.</p>
			<br />

			<p>
				Sleeping Gear...
				<ul class="box">
					<li>Sleeping Bag</li>
					<li>Foam Sleeping Pad</li>
					<li>Pillow</li>
				</ul>
			<br />
			<p>
				In a <strong>Single, Clearly Labelled</strong> duffle bag...
				<ul class="box">
					<li>Jacket</li>
					<li>Rain Poncho and Rain Pants</li>
					<li>Hiking Sandals or Running Shoes</li>
					<li>Sweatshirt, Sweatpants, and Extra Socks to sleep in (The nights get chilly)</li>
					<li>3 Pairs of Socks</li>
					<li>2 or 3 Sets of Underwear</li>
					<li>Hair Brush</li>
					<li>Sunglasses</li>
					<li>Bug Spray</li>
					<li>Lip Balm</li>
					<li>Sunscreen</li>
					<li>Satchel</li>
					<li>Water Bottle</li>
					<li>2 Sets of <a href="/participants/clothing">Quest Clothing</a></li>
					<li>Inhalers and/or Presrcibed Medicine</li>
				</ul>

			<br />
			<p>
				Place the following items in a <strong>Ziploc bag</strong>...
				<ul class="box">
					<li>Toothbrush and Toothpaste</li>
					<li>Deodorant</li>
					<li>Hand Sanitizer</li>
				</ul>

			<br />
			<p>
				<strong>DO NOT</strong> bring...
				<ul class="no">
					<li>Phones</li>
					<li>AirPods</li>
					<li>Other Electronic Devices</li>
					<li>Knives of ANY kind</li>
					<li>Makeup or Hair Appliances</li>
				</ul>				
		</div>

		<br style="clear: both;" />

	</div>

</div>

<style>
	ul.box {
		list-style-type: "▢";
		padding: 5px 14px;
	}
	ul li {
		padding: 1px 0px 1px 4px;
	}

	ul.no{
		list-style-type: "❌";
	}
	ul.no li {
		margin-left: 16px;
		padding: 1px 0px 1px 12px;
	}

	li a { 
		@apply text-yellow-700;
	}
	a:hover {
		text-decoration: underline;
	}

	
</style>