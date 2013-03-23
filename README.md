# RAX ALPHA - (CURRENTLY IN DEVELOPMENT)
======================================
# CMS for Node.js
==========================================

Want to help develop this project? Read about it below and if you think you're still interested, [e-mail me](mailto:mattacular@gmail.com)!

About
-----
Rax is the codename for a highly modular, highly sophisticated CMS envisioned for NodeJS. Its design is inspired by the simplicity of Wordpress fused with the power of Drupal fully available under the hood. Our goal is to allow it to be as simple or as advanced as the developer or content creators need. The result will be a true editorial engine for Node, maybe the first of its kind! What does this mean? Being an editorial engine means that Rax is engineered from the ground up with both developers *AND* editorial staff in mind. This warrants essentially a two-pronged approach when it comes to features:

**For editors:** Rax's frontend UI must be state of the art and intuitive with features like inline editing, collaboration (via web sockets), and live preview.

**For developers:** Rax is fully extensible. The APIs must all be as robust as they are intuitive. The most popular CMS rely on a thriving community of module developers, theme developers, etc. Build a meaningful, stable API to be leveraged and they will come!

[Trello Board](https://trello.com/board/node-cms/50c363b1a538d8062a002368)
------------
For tracking progress, prioritizing features/functionality, and brain storming new concepts!

https://trello.com/board/node-cms/50c363b1a538d8062a002368

## Feature Brainstorming/Spec
--------------------------
- Router API
	- app-safe wrapper for Escort (https://github.com/ckknight/escort)
	- I like the syntax for this router and it seems to be very performance-oriented. This will serve as Rax's router unless we find something better or need to roll our own.
- Forms API
	+ custom
	+ allows modules to provide forms to templates
	+ utilizes Handlebars helpers (?)
	+ example:

	```javascript
	// test form
	'page' = {
		'uploadPicture': {
			'prefix': '<div class="site-upload-picture-form">',
			'suffix': '</div>',
			'submit': '/photos/upload'  // takes a route or routeId
			'structure': {
				'picture_description': {
					'type': 'textfield',
					'title': 'Description',
					'weight': 0,
					'prefix': '',
					'suffix': ''
				}
			},
			'handlers': {
				'validation': function () {},   // validation handler
				'submit': function () {}        // submission handlers (override route handler?)
			}
		}
	}
	```

	- can then be exposed as a global template - {{{form_uploadPicture}}}

* Templating API
	- utilizes Handlebars (HTML) and LESS (CSS) (maybe allow extensibility here in the future?)
	- 'blocks' system defineBlock() putBlock() ?? (v2+)
	- themes are made up of the main templates and can provide their own custom subtemplates etc.
	- modules and themes alike can provide templates
	- some templates are required. if active theme does not have required templates, they are inherited from the base theme?
	- model binding... bindModel() how?
	- stock templates: (highly extensible) [(global) = available to other templates as Handlebars helper]
		- **page templates** vs **global templates** (aka ***subtemplates***)
		- (global) htmlHead - <head/>
		- (global) htmlFoot - just before </body>
		- (global) contentHead - content heading to be used on most other pages (eg. heading logo, navbar etc)
		- (global) contentFoot - content footer appears just before htmlFoot template on most other pages
		- author - author page, (eg. when user clicks byline)
		- article - article page
		- content-{content_type}
		- gallery 
		- section - section front page (only used if sections are enabled)
		- list - template for various list type pages that index articles (eg. search results, archives, list by category)
		- homepage - front page / index
		- dash_post - dashboard - post an article

		*WARNING* don't nest global templates

		themes and modules can both provide custom templates (and global templates) at will
	- template types? (necessary?)
		- global: snippet to be nested in another template (could call these 'block' templates instead of 'global')
		- route/page: composite template that is rendered when route is requested ??
		- widget: similar to global, can be nested
		- form: specific type of widget template
* Content Types/Models API (kind of like entities? maybe rename to something less generic)
	- ???
	- supported base types:
		- text
		- image
		- video
		- audio
	- ex. article (a more advanced 'post' content type)
		base-type: 'text'
* Core Modules (some are required unless a supported replacement is also present)
	- Post (provides a highly configurable post content-type, Rax.posts.addType('article', fields) or Rax.posts.addType('blog', fields))
	- Comment (allows user commenting to be enabled on existing content types)
	- Section (define sections to organize content-types, can be broad or very explicitly define - eg. a section could be all blog posts, or all blog posts of a certain type, or all blogs posts by a certain author)
	- Categories (tag posts by category to help search and generate list pages)
	- Gallery (similar to sections, except requires the content-type to be image)
	- User
	- Cron
	- Sitemap
	- Feed (for RSS feeds of RAX content etc)
	- Analytics
	- Social Sharing (ugh ?)
* How to handle media uploads and serving?
* Storage API (has options that combine local storage, where supported with DB persistence)
* AJAX modes on front-end (none - medium - full)
* User API
	- single sign-on mapping out of the box
	- robust permissions system
* Config
	- can be managed via JSON in database
	- can also be managed via GUI interface
* Post API/Authoring Interface (extensible?)
	- very rich text format options and powerful WYSIWYG design by CKEditor
	- how to store though? 
		* different formatting modes offered (w/full caveats and performance/storage implications detailed at the config screen)
		* always separate body from HTML tags and store them in a format map
		* this format map can then be run back against the body before being presented to the user by either the client
		or the server depending on setup.
	- uses sockets, supports inline editing (?)
* Admin Interface
	- uses sockets for realtime updates (should be feasible on pretty much any server setup since there won't be that many active editors at any given time, but maybe allow it to be turned off?)
	- http://thruflo.com/post/23226473852/websockets-varnish-nginx
	- would require special config
* Beacon API (registration based, emitters and responders - eg Drupal hooks or Wordpress actions) - gui for arranging response order (?)
	- Rax.pipeline is exposed, can alter response makeup, render structure etc
* Extensibility
	- Themes (defined by 1 or more templates)
		+ all themes fallback on the core theme, which has bootstrap (so bootstrap is available in all themes, can be overwritten)
		+ pushes users to adopt responsive design practices
		+ also supports device-specific themes
		+ can be as simple as Wordpress, or as complicated as Drupal, falls back down onto core defaults when necessary
		+ child themes?
	- RAX Modules
		? modules can be as simple as providing a content-type through the Models API, or as advanced as the author likes (can essentially use Rax as a framework like you can with Drupal to make any kind of site you want)
		* adopt the GameFlash module pattern
		? how to make safe to use with regular node modules, interact with npm, preserve dependencies etc?
			* piggy-back off of the stock node.js stuff, provide safe wrappers:
				- rax.requireOnce(), rax.require() etc.
		+ have access to all core APIs
		+ can be used in place of core modules
* DB Support
	- initially just MongoDB w/Mongoose
	- (eventually maybe) MySQL
	- (eventually nice to have) PostgreSQL
* Utilities
	- Minification
	- Packaging
	- Build systems?
	- Pre-compilation of templates

Recommended Server Setups
-------------------------
Node is unique in that it is its own webserver. It can serve static files and requests all by itself! However, certain size sites may benefit from alternate setups.
Rax automatically manages a link between the active theme's own directory and a generic directory - /rax/theme/active (the symlink itself) so that you can setup Nginx to serve the theme's static files as well! Of course, Node will be packaged with examples configs for all the parts of the stack. For taking full advantage of Rax's functionality AND retaining full control over performance aspects w/avenues for effective scalability here is the recommended stack:

**FULL-FEATURED**
* Varnish
	- cache layer
	- directs websocket traffic straight to Rax running on Node server (still allows for real-time editing)
	- all other traffic to Nginx server
* Nginx
	- services static requests (via wildcard match) from /www/public_html (for example) or by default /www/rax/static
	- serves core assets from /www/rax/ (or whatever rax wd is)
	- proxy all other requests to Rax app running on Node server (/)
* Rax (Node.js)
	- services all dynamic requests

**LITE-FEATURED** (no Varnish - nginx now supports websockets! hooray)
* Nginx
	- services static requests (via wildcard match) from user-defined directory
	- serves core assets from /www/rax (or whatever rax wd is)
	- proxy all other requests to Rax app running on Node server (/)
* Rax (node.js)
	- services all other dynamic requests

#3rd Party Module Spec (Rax Modules)
---------------------
+ Probably not going to allow install with npm. No need to clog up the npm registry with modules specific to what is technically another module (Rax) when
it is perfectly easy to run a git clone in your installation's '/modules' directory. Module developers would still be encouraged to supply a 'package.json'
for installing any npm dependencies it utilizes.

+ For Rax though, 3rd party modules must be identified by a "module.json" file.

	```json
	{
		'title': 'Cool Module',
		'description': 'A cool module',
		'git': 'https://...'    // please host your modules on github so they can be updated through the admin interface!
		'version': '0.0.1'
		'requires': '>3.0',
		'author': 'mstills',
		'src': 'coolModule.js'
	}
	```

+ There are some reserved methods that modules can use to gain exclusive access into the Rax Core that isn't afforded by the Rax object:
var Rax = require('../core/rax');

	```javascript
	// Hook into the router mechanism the same way the core modules do
	module.exports.routes = {
		'/coolModule': {
			'get': function (req, res) {
				res.end('Welcome to cool module.');
			}
		}
	}

	// a callback to be run during Rax bootstrap when module is first loaded
	module.exports.init = function () {
	};

	// Beacons API
	Rax.on('', function () {});
	```

