==========================================
			RAX v0.1
			CMS for Node.js
==========================================

Core Components
* Router API
* Forms API
* Templating API
	- 'blocks' system defineBlock() putBlock()
	- themes are made up of 1 or more templates + 1 or more stylesheets (?)
	- bindModel() ?
* Models API (kind of like nodes?)
* Core Modules
	- Comments
	- Sections
	- Galleries
	- Cron
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
* Admin Interface
	- uses sockets for realtime updates (should be feasible on pretty much any server setup since there won't be that many active editors at any given time, but maybe allow it to be turned off?)
* Signals API (registration based, emitters and responders - eg Drupal hooks or Wordpress actions) - gui for arranging response order after
* Extensibility
	- Themes
		+ pushes users to adopt responsive design practices
		+ also supports device-specific themes
		+ can be as simple as Wordpress, or as complicated as Drupal, falls back down onto
		core defaults when necessary
	- Modules
		? interact with npm, dependencies structure?
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