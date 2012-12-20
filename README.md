RAX ALPHA - (CURRENTLY IN DEVELOPMENT)
========
CMS for Node.js
==========================================

Want to help develop this project? Read about it below and if you think you're still interested, [e-mail me](mailto:mattacular@gmail.com)!

Trello Board
------------
https://trello.com/board/node-cms/50c363b1a538d8062a002368

Core Components
---------------
* Router API
	- app-safe wrapper for Escort (https://github.com/ckknight/escort)
* Forms API
	- custom
	- modules can provide forms to templates
	- utilizes Handlebars helpers (?)

	`page = {

		'uploadPicture': {

			'prefix': '<div class="site-upload-picture-form">',

			'suffix': '</div>',

			'submit': '/photos/upload'	// takes a route or routeId

			'structure': {

				'picture_description': {

					'type': 'textfield',

					'title': 'Description'

				}

			}

		}

	}`

	- can be exposed to templates/themes - {{uploadPicture}}

* Templating API
	- utilizes Handlebars (HTML) and LESS (CSS) (maybe allow extensibility here in the future?)
	- 'blocks' system defineBlock() putBlock()
	- themes are made up of 1 or more templates + 1 or more stylesheets (?)
	- some templates are required. if active theme does not have required templates, they are inherited from the base theme?
	- bindModel() ?
	- stock templates: (extensible)
		htmlHead - <head/>
		htmlFoot - just before </body>
		contentHead - content heading to be used on most other pages (eg. heading logo, navbar etc)
		contentFoot - content footer appears just before htmlFoot template on most other pages
		author - author page, (eg. when user clicks byline)
		article - article page
		content-{content_type}
		gallery 
		section - section front page (only used if sections are enabled)
		list - template for various list type pages that index articles (eg. search results, archives, list by category)
		homepage - front page / index
		dash_post - dashboard - post an article
* Content Types/Models API (kind of like entities? maybe rename to something less generic)
	- ???
	- supported base types:
		- text
		- image
		- video
		- audio
	- ex. article
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
* How to handle media?
* Storage API (has options that combine local storage, where supported with DB persistence)
* AJAX modes on front-end (none - medium - full)
* User API
	- single sign-on mapping out of the box
	- robust permissions system
* Config
	- can be managed via JSON in database
	- can also be managed via GUI interface
* Authoring Interface (extensible?)
	- uses sockets, supports inline editing (?)
* Admin Interface
	- uses sockets for realtime updates (should be feasible on pretty much any server setup since there won't be that many active editors at any given time, but maybe allow it to be turned off?)
	- http://thruflo.com/post/23226473852/websockets-varnish-nginx
	- would require special config
* Beacon API (registration based, emitters and responders - eg Drupal hooks or Wordpress actions) - gui for arranging response order after
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
	- MongoDB w/Mongoose
	- (maybe) MySQL
	- (nice to have) PostgreSQL
* Utilities
	- Minification
	- Packaging
	- Build systems?
	- Pre-compilation of templates

Recommended Setup
-----------------
* Varnish in front
	- cache layer
	- directs websocket traffic straight to Rax running on Node server (allows for real-time editing)
	- all other traffic to Nginx server
* Nginx
	- services static requests (via wildcard match) from /www/public_html
	- proxy all other requests to Rax running on Node server
* Rax on Node.js
	- services all dynamic requests

Can also be done with just Node though using the Rax static file server option!

3rd Party Module Spec (Rax Modules)
---------------------
Probably not going to allow install with npm. No need to clog up the npm registry with modules specific to what is technically another module (Rax) when
it is perfectly easy to run a git clone in your installation's '/modules' directory. Module developers would still be encouraged to supply a 'package.json'
for installing any npm dependencies it utilizes.

For Rax though, 3rd party modules must be identified by a "module.json" file.

{
	'title': 'Cool Module',
	'description': 'A cool module',
	'git': 'https://...'	// please host your modules on github so they can be updated through the admin interface!
	'version': '0.0.1'
	'requires': '>3.0',
	'author': 'mstills',
	'src': 'coolModule.js'
}

There are some reserved methods that modules can use to gain exclusive access into the Rax Core that isn't afforded by the Rax object:
var Rax = require('../core/rax');

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
Rax.beacon.on('', function () {});

Folder Hierarchy
----------------
> ./ 			(rax top-level)

> bin/			(rax CLI stuff)

> core/			(core modules)

>> cli/		(CLI JS)

>> rax.js

>modules/		(3rd party rax modules)

>> example/		(example module to demonstrate per-module hierarchy)

>>> assets/		(optional, images/css assets used by this module)

>>> node_mod../ (optional, additional npm libraries/dependencies of this module)

>>> js/			(optional, some larger modules may want to utilize more than one *.js file)

>>>> server/		(optional, server JS)

>>>> client/		(optional, client JS)

>>> main.js 	(required, can be named anything, the main JS file for this module)

>>> module.json (required, must be named module.json, identifies the main JS file, similar to CommonJS modules)

> interface/		(GUI interface files)

> client/			(client files)

>> js/				(client JavaScript)

>> lib/			(client libraries)

>> css/			(defaults, if theme doesn't provide)

> themes/			(themes)

>> stock/			(stock theme)

>>> js/				(theme specific JS)

>>> css/			(theme specific CSS)

>>> templates/		(templates)

>>> theme.json 		(identifier / config)

> uploads/		(site upload storage)

> node_modules/	(app libraries)

> settings/		(various JSON configs which get replicated to DB)