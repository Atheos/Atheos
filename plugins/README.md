# PicoCMS Plugins Repo

This repo holds all the plugins I've made for PicoCMS using a slightly modified version. I don't have much time to write up documentation for each one but I'm willing to answer any questions / help any interested parties. I might in the future take the time to write the full documentation on them.

When I say slightly modified version of Pico, I took PicoCMS 2.1.3 FlatFile Installation and tore out everything that wasn't bolted down. Lobotmized the Autoloaded from Composer, removed any superflous files/folders I could, multiple folder structure changes, upgraded twig from 1 -> 3, and fully removed all references to the DepriciatedPlugin. However, none of those changes SHOULD have affected PicoCMS, or utilizing these plugins in any normal build of Pico, but it should be mentioned just in case.

These plugins can be seen in action on my personal blog at [www.siira.io](https://www.siira.io/).

## Pagination: Simple pagination plugin to limit the number of posts on the main list page.
~~~twig

{% for page in pagination %}
{% if page.meta.template == "post" %}
<section class="post">
	<div class="info">


		<a aria-label="Link to Post" href="{{ page.url }}">
			<h2 itemprop="headline">
				{{ page.title }}
			</h2>
		</a>
		<p class="meta">
			<span class="date" itemprop="datePublished">{{ page.date_formatted }}</span> - Posted in
			<span itemprop="articleSection"><a href="{{ base_url }}/tag/{{ page.meta.tags }}">{{ page.meta.tags }}</a></span>
		</p>
	</div>

	<div class="desc text-left" itemprop="articleBody">
		{{ page.raw_content | excerpt | markdown }}
	</div>
</section>

{% endif %}
{% endfor %}

{{ pagination_links | markdown }}

~~~

## Tags: An array of pages that contain the same tags
~~~twig

{% if related_posts %}

<div id="related">

	{% for post in related_posts | slice(0, 3) %}
	<item class="col-4">

		<h3 class="title"><a href="{{ post.url }}">{{ post.title }}</a></h3>
		<p>
			{{ post.description }}
		</p>
		<a class="read-more" href="{{ post.url }}">Read More</a>
	</item>
	{% endfor %}
</div>
{% endif %}

~~~



## Popular: An array of the top five most viewed posts (determined via the template); saved on page load.
~~~twig

<aside id="popular_posts">
	<h3>Popular Posts</h3>
	<ul class="content">
		{% for page in popular_posts %}
		<li>
			<a class="title" href="{{ page.url }}">{{ page.title }}</a>
		</li>
		{% endfor %}
	</ul>
</aside>

~~~

## Others

### RSS

Works just like the [RSS plugin by MattByName](https://github.com/MattByName/Pico-RssMaker), but it's a little prettier. I wish I'd noticed that Pico has a [cookbook for RSS generation](http://picocms.org/cookbook/) because it's probably just as good, if not better.

### Output
Same as [PicoOutput by nliautaud](https://github.com/nliautaud/pico-output)

### Cache
Same as [PicoCache by Nepose](https://github.com/Nepose/pico_cache/)


### Search
Coming Soon