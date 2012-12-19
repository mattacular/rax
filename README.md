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
* Templating API
	- utilizes Handlebars (HTML) and LESS (CSS) (maybe allow extensibility here in the future?)
	- 'blocks' system defineBlock() putBlock()
	- themes are made up of 1 or more templates + 1 or more stylesheets (?)
	- bindModel() ?
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
	- Gallery (similar to sections, except requires that the content-type to be image)
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
* Signals API (registration based, emitters and responders - eg Drupal hooks or Wordpress actions) - gui for arranging response order after
* Extensibility
	- Themes (1 or more templates in unison)
		+ all themes fallback on the core theme, which has bootstrap (so bootstrap is available in all themes, can be overwritten)
		+ pushes users to adopt responsive design practices
		+ also supports device-specific themes
		+ can be as simple as Wordpress, or as complicated as Drupal, falls back down onto
		core defaults when necessary
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