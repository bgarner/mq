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

			<h1 class="text-4xl tracking-tight font-bold text-gray-900 sm:text-4xl md:text-4xl lg:text-4xl xl:text-4xl text-center pb-10">Clothing</h1>

			<p>In the spirit of Moroni’s Quest, each participant will need to be in MODEST, BOOK OF MORMON CLOTHING at all times except when sleeping.</p>

			<h1 class="text-xl tracking-tight font-bold text-gray-900 sm:text-xl md:text-xl lg:text-xl xl:text-xl pt-4">Quest Clothing Requirements:</h1>
			<ul>
				<li><strong>2 Tunics:</strong> Tunic should be at least 2-3 inches below the knee and cover your shoulders.  It can be a tunic, dress, or blouse/skirt combo (Yes, gentlemen, this means you, too!).  Be sure clothing is large enough to accommodate clothing worn underneath and allows for movement.  Costumes should be earth tones, blue, greens, browns and natural dyes that would have been in Book of Mormon times. Fabrics that look woven or have stripes are ok, but PLEASE DO NOT use bright colored modern (such as pink leopard, floral prints, and camo) of any kind. Try to think of what the Nephites would have worn.</li>

				<li><strong>2-3 sets of underclothing:</strong> You <strong>MUST</strong> wear clothing under your costumes at all times. T-shirts and knee-length shorts are recommended. If the weather is cool you may want to wear jeans, sweatpants, sweatshirts, etc. Mornings and evening can be cold as well so please make sure your costume is large enough. NO short shorts, tank tops or camis, please. Underclothing ALSO includes a pair of pajamas and a change of underwear and socks for each day.</li>

				<li><strong>Belt:</strong> (optional)</li>

				<li><strong>Headband:</strong> You may choose to have a head covering of some sort. You may wear a headband (around the forehead and tied in the back) or a “shepherd’s” head covering to protect against the sun.</li>

				<li><strong>Shoes:</strong> Two pair of gym shoes that are comfortable to walk in.  NO flip-flops, sandals, or open-toed shoes.</li>

			
			</ul>
			<br />

			<h1 class="text-xl tracking-tight font-bold text-gray-900 sm:text-xl md:text-xl lg:text-xl xl:text-xl pt-4">How to Make a Costume:</h1>
			<p>Costumes can be as simple or as elaborate as you would like.  There are several sources online that you can look at.  Do a search for “Moroni’s Quest” and you will find Pinterest boards, YouTube videos, and Facebook pages.</p>

			<ul>
				<li><strong>Fabric:</strong> Fabrics should be lightweight and the color/design should be true to the Book of Mormon period. Avoid heavy fabric (it could be HOT!) Do not use bright colored modern (such as pink leopard, floral prints, and camo) of any kind.</li>
				<li><strong>Patterns suggestions:</strong> McCalls #2339 or Simplicity 5446</li>
				<li><strong>Restrictions:</strong> NO camis/tanks; short shorts; flip flops/open-toed shoes; personal jewelry; modern fabrics (pink leopard, floral prints, camo, etc.); modern hats/caps; skin or face painting, or temporary tattoos.</li>
				<li><strong>Accessories:</strong> Have fun accessorizing your costume with trims, buttons, sashes, tie belts, contrasting materials, etc.  Armbands, ankle and calf ornaments, belts, drapes, vests, shoulder shawls, collars, and jewelry can all be added to make your costume unique. Be creative!</li>
				<li>Remember that you are trying to look like the inhabitants at the time of the Book of Mormon!</li>
			</ul>

			<h1 class="text-xl tracking-tight font-bold text-gray-900 sm:text-xl md:text-xl lg:text-xl xl:text-xl pt-4">Simple No-Sew Tunic Instructions</h1>
			<ol>
				<li>Purchase a length of fabric that is twice the length of the measurement from the top of your shoulder to your mid-calf.  This may make two tunics depending on your shoulder width.</li>
				<li>At home measure the width of your shoulders from outside edges.  Your tunic must be at least this wide (it can be wider if you desire).</li>
				<li>Open the fabric completely and cut a strip from top to bottom the width of your shoulders (or larger if you like).</li>
				<li>Fold fabric in half (top to bottom) and cut a half circle or a triangle out of the center of the folded edge to create the neck hole.</li>
				<li>That’s all! Your tunic is done.</li>
				<li>This style of tunic does require some kind of belt to keep the fabric closed around your waist.  You may use tie a strip of fabric around your waist or you may use a belt.</li>
			</ol>

			<h1 class="text-xl tracking-tight font-bold text-gray-900 sm:text-xl md:text-xl lg:text-xl xl:text-xl pt-4">Additional Resources:</h1>


			<p><strong>Nephite Fashion Guide for Boys</strong></p>
			<iframe width="560" height="315" src="https://www.youtube.com/embed/YKTf1EJ5M5k" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

			<p><strong>Nephite Fashion Guide for Girls</strong></p>
			<iframe width="560" height="315" src="https://www.youtube.com/embed/WWu8GJuR_2Q" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>


		</div>

		<br style="clear: both;" />

	</div>

</div>

<style>
	p {
		padding: 10px 0px;
	}
	ul {
		list-style-type: disc;
		padding: 5px 14px;
	}
	ol {
		list-style-type: decimal;
		padding: 5px 14px;
	}
	ul li, ol li {
		padding: 4px 2px;
	}
	.content a { 
		@apply text-yellow-700;
	}
	a:hover {
		text-decoration: underline;
	}
</style>