Pico Robots
===========

This is the repository of Pico's official robots plugin.

Pico is a stupidly simple, blazing fast, flat file CMS. See http://picocms.org/ for more info.

`PicoRobots` is a simple plugin that add a `robots.txt` and `sitemap.xml` to your website. Both the [robots exclusion protocol][RobotsProtocol] (`robots.txt`) and the [Sitemaps protocol][SitemapsProtocol] (`sitemap.xml`) are used to communicate with web crawlers and other web robots. `robots.txt` informs the web robot about which areas of your website should not be processed or scanned. `sitemap.xml` allows web robots to crawl your website more intelligently. `sitemap.xml` is a URL inclusion protocol and complements `robots.txt`, a URL exclusion protocol.

Install
-------

If you're using a `composer`-based installation of Pico (e.g. [`picocms/pico-composer`][PicoComposer]), simply open a shell on your server, navigate to Pico's install directory (e.g. `/var/www/html`) and run `composer require phrozenbyte/pico-robots` (via [Packagist.org][]). That's it!

If you're rather using one of [Pico's pre-built release packages][PicoRelease], you must first create a empty `plugins/PicoRobots` directory in Pico's install directory (e.g. `/var/www/html`) on your server. Then download [`PicoRobot`'s latest source package][PicoRobotsRelease] and upload all containing files (esp. `PicoRobots.php`) into said `plugins/PicoRobots` directory (resulting in `plugins/PicoRobots/PicoRobots.php`). That's it!

`PicoRobots` requires Pico 2.0+

Config
------

After installing `PicoRobots`, you can navigate to your `robots.txt` (http://example.com/pico/robots.txt) and `sitemap.xml` (http://example.com/pico/sitemap.xml) using your favourite web browser. As you can see, `robots.txt` just holds a reference to your website's `sitemap.xml` by default. The default `sitemap.xml` lists all your website's pages with the last modification time as specified by the Markdown file's last modification time reported by your server's operating system. Pretty convenient, right?

As always, you can adjust `PicoRobot`'s behavior to fit your needs. First we'll start with the `robots.txt`:

#### More about `robots.txt`

The `robots.txt` consists of a arbitrary number of URL exclusion rules separated by paragraphs (i.e. a empty line). A rule consists of one or more `User-agent` rows to state which web robots are concerned, and one or more `Disallow` rows to state which URLs shouldn't be processed or scanned by said web robots. Optionally you can add one or more `Allow` rows to specify exceptions to the `Disallow` rows. Please refer to Wikipedia's article about the [robots exclusion protocol][RobotsProtocol] for more information.

You can add URL exclusion rules to your `robots.txt` by using Pico's `config/config.yml` (or any other config file in the `config` dir, e.g. `config/PicoRobots.yml`). Rather than extensively describing the config syntax, a example says more than a thousand words. So, by adding the following configuration to your `config/config.yml`

```yml
PicoRobots:
  robots:
    - user_agents: "BadBot"
      disallow: "/"
    - user_agents: "*"
      disallow: [ "/private/", "/admin/" ]
      allow: "/private/about_me"
```

you get the following two rules in your `robots.txt`

```
User-agent: BadBot
Disallow: /

User-agent: *
Disallow: /private/
Disallow: /admin/
Allow: /private/about_me
```

The first rule (line 1 and 2) tells `BadBot` (`User-agent: BadBot`) not to crawl your website at all (`Disallow: /`). The second rule (lines 4 to 7) tells any other web robot (`User-agent: *`) not to crawl your website's `private` (`Disallow: /private/`) and `admin` (`Disallow: /admin/`) folders. As an exception to this, crawling the `private/about_me` page (`Allow: /private/about_me`) is fine. It implicitly also tells any web robot (except `BadBot`) that crawling your website is basically fine.

The `robots.txt` doesn't affect Pico's `Robots` meta header in the YAML Frontmatter of your Markdown files in any way (as long as your theme uses that information to add a `<meta name="robots" content="..." />` tag to your website). You should rather use the `Robots` meta header than the `robots.txt` to disallow crawling a single page.

`PicoRobots` uses the `theme/robots.twig` template to create the contents of `robots.txt`. If you want to add some custom logic to your `robots.txt`, simply add a `robots.twig` to your theme and use `PicoRobot`'s `theme/robots.twig` as a starting point. Pico will automatically use your theme's `robots.twig` rather than `PicoRobot`'s default one.

The plugin furthermore exposes a simple API to allow other plugins to access and add URL exclusion rules to your `robots.txt`. As a plugin developer you may use the `PicoRobots::getRobots()` method to get a list of all URL exclusion rules. `PicoRobots` furthermore triggers the custom `onRobots(array &$robots)` event with the following payload, allowing you to add custom rules to the website's `robots.txt`.

```php
$robots = [
    [
        'user_agents' => string[],  /* list of user agents, or '*' to match all web robots */
        'disallow'    => string[],  /* list of URLs that shouldn't be crawled */
        'allow'       => string[]   /* list of disallowed URLs that are allowed to be crawled even though */
    ],
    …
]
```

Please note that URL exclusion rules in your `robots.txt` won't affect your website's `sitemap.xml` created by `PicoRobots` in any way.

#### More about `sitemap.xml`

`sitemap.xml` is a [XML][]-based protocol to help web robots to crawl your website more intelligently. It consits of one or more `<url>` records, telling web robots what URLs (the `<loc>` tag) should be crawled. You can optionally tell web robots when a page was last modified (`<lastmod>` tag) and how frequently the page may change (`<changefreq>` tag, possible values are `always`, `hourly`, `daily`, `weekly`, `monthly`, `yearly` and `never`). By adding the optional `<priority>` tag, you can suggest web robots which pages are considered more important than others (the valid range is from `0.0` to `1.0`, with `1.0` being the most important; the default value is `0.5`). Please refer to Wikipedia's article about the [Sitemaps protocol][SitemapsProtocol] for more information.

`PicoRobot`'s default `sitemap.xml` lists all your website's pages with the last modification time as specified by the Markdown file's last modification time reported by your server's operating system. If you don't want a particular page to be in the `sitemap.xml`, simply add the `Sitemap: false` meta header to the page's YAML Frontmatter. `PicoRobots` will automatically exclude inaccessible pages (pages whose file name starts with a `_`) and pages with the `Robots: noindex` meta header in the YAML Frontmatter.

The `Sitemap` meta header can also be used to specify a page's change frequency and priority, as well as overwriting the page's last modification time. If you want to tell web robots that a page is usually changed once per week, was last changed on 1 December 2017, and has a increased priority of `0.7`, add the following to the page's YAML Frontmatter:

```yml
Sitemap:
    lastmod: 2017-12-01
    changefreq: weekly
    priority: 0.7
```

You can furthermore use Pico's `config/config.yml` (or any other config file in the `config` dir, e.g. `config/PicoRobots.yml`) to add more records to your `sitemap.xml`. If you want to add a record for the dynamically created page `team/max-mustermann` (the page is dynamically created by a plugin and there is no `content/team/max-mustermann.md`, thus it isn't in the `sitemap.xml` by default) to your `sitemap.xml`, add the following to your `config/config.yml`

```yml
PicoRobots:
  sitemap:
    - url: %base_url%?team/max-mustermann
      changefreq: yearly
```

to get the following record in your `sitemap.xml`

```xml
    <url>
        <loc>http://example.com/pico/team/max-mustermann</loc>
        <changefreq>yearly</changefreq>
    </url>
```

As you can see, `PicoRobots` interprets the `%base_url%` placeholder the same way as in Markdown files and replaces it by the website's base URL. As with the `Sitemap` meta header in a page's YAML Frontmatter, you may add `lastmod`, `changefreq` and `priority` keys to the config to specify a URL's last modification time, change frequency and priority.

`PicoRobots` uses the `theme/sitemap.twig` template to create the contents of `sitemap.xml`. If you want to add some custom logic to your `sitemap.xml`, simply add a `sitemap.twig` to your theme and use `PicoRobot`'s `theme/sitemap.twig` as a starting point. Pico will automatically use your theme's `sitemap.twig` rather than `PicoRobot`'s default one.

The plugin furthermore exposes a simple API to allow other plugins to access and add sitemap records to your `sitemap.xml`. As a plugin developer you may use the `PicoRobots::getSitemap()` method to get a list of all sitemap records. `PicoRobots` furthermore triggers the custom `onSitemap(array &$sitemap)` event with the following payload, allowing you to add custom records to the website's `sitemap.xml`.

```php
$sitemap = [
    [
        'url'              => string,   /* URL of the concerned page, including the protocol */
        'modificationTime' => int,      /* Unix timestamp of the page's last modification time */
        'changeFrequency'  => string,   /* how frequently the contents of the page may change */
        'priority'         => float     /* priority of that URL relative to other URLs on the site */
    ],
    …
]
```

[RobotsProtocol]: https://en.wikipedia.org/wiki/Robots_exclusion_standard
[SitemapsProtocol]: https://en.wikipedia.org/wiki/Sitemaps
[PicoComposer]: https://github.com/picocms/pico-composer
[Packagist.org]: https://packagist.org/packages/phrozenbyte/pico-robots
[PicoRelease]: https://github.com/picocms/Pico/releases/latest
[PicoRobotsRelease]: https://github.com/PhrozenByte/pico-robots/releases/latest
[XML]: https://en.wikipedia.org/wiki/XML
