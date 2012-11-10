RAX v0.1
========
CMS for Node.js
==========================================

Core Components
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
	- Posts (provides a highly configurable post content-type, Rax.posts.addType('article', fields) or Rax.posts.addType('blog', fields))
	- Comment (allows user commenting to be enabled on existing content types)
	- Section (define sections to organize content-types, can be broad or very explicitly define - eg. a section could be all blog posts, or all blog posts of a certain type, or all blogs posts by a certain author)
	- Gallery (similar to sections, except requires that the content-type to be image)
	- User 
	- Cron (timekeeper)
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