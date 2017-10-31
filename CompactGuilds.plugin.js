//META{"name":"CompactGuilds"}*//

'use strict';
var CompactGuilds = function () {};
CompactGuilds.prototype.getAuthor = function () {
	return "kosshi";
};
CompactGuilds.prototype.getName = function () {
	return "CompactGuilds";
};
CompactGuilds.prototype.getDescription = function () {
	return "Reduces sidebar's width or hides it completetly by displaying it only when cursor is near left edge. ";
};
CompactGuilds.prototype.getVersion = function () {
	return "0.2.2";
};

CompactGuilds.prototype.windowResizeEvent = function() {
	// Called when window is resized.
	var settings = CompactGuilds.prototype.loadSettings();
	if(settings.always) {
		this.enable();
		return;
	}
	if(window.innerWidth < settings.activeWidth){
		if(!this.enabled) this.enable();
	}else{
		if(this.enabled) this.disable();
	}
};

CompactGuilds.prototype.enabled = false; // if guilds are hidden

CompactGuilds.prototype.start = function () {
	// Called when plugin is started
	window.addEventListener('resize',this.windowResizeEvent.bind(this),false);

	// "globals"
	this.channelSelector = 'div[class^=channels]';
	this.mainSelector = 'div[class^=flex]';

	const settings = this.loadSettings();
	if( settings.overrideMins ) {

		require('electron').remote.getCurrentWindow().setMinimumSize( 
			parseInt(settings.minWidth), parseInt(settings.minHeight) ); // reeee
	}

	this.windowResizeEvent();
};

CompactGuilds.prototype.enable = function() {
	// Hides guilds
	if(this.enabled) return;
	this.enabled = true;
	var settings = this.loadSettings();

	var guilds = document.getElementsByClassName('guilds-wrapper')[0];
	var main = document.querySelector(this.mainSelector);
	var channels = document.querySelector(this.channelSelector);


	var guildsHide = true;
	var overGuilds = document.createElement('div');
	overGuilds.id = 'hg_hoverOver';
	main.appendChild(overGuilds);
	var outGuilds = document.createElement('div');
	outGuilds.id = 'hg_hoverOut';
	main.appendChild(outGuilds);

	let css = `
		div[class^=titleWrapper] {
			z-index: 0;	
		}

		#hg_hoverOver {
			position: absolute;
			height: 100%;
			width: ${settings.show}px;
			left: 0;
		}

		#hg_hoverOut {
			position: fixed;
			height: 100%;
			left: ${settings.hide}px;
			overflow-x: hidden;
			overflow-y: hidden;
			width: 80%;
			z-index: 9001;
			display: none;
		}

		.guilds-wrapper {
			position: fixed;
			height: 100%;
			z-index: 3;
			left: -70px;
			transition: ${settings.animstyle} ${settings.animspeed}ms;
		}
	`;
	if(settings.mobilefy){
		css += `
			${this.channelSelector} {
				position: fixed;
				height: 100%;
				z-index: 2;
				left: -240px;
				transition: ${settings.animstyle} ${settings.animspeed}ms;
			}
		`;
	}
	if(settings.trim){
		css += `
			.username {
				max-width = 40px;
			}
			${this.channelSelector} {
				width: 200px;
			}
		`;
	}

	BdApi.injectCSS('CompactGuildsCSS', css);



	overGuilds.onmouseover = function(){ 
		guildsHide = false; 
		outGuilds.style.display = "block";
		guilds.style.left = "0px";
		if(settings.mobilefy){
			// fix for minimal mode
			channels.style.left = ($("body").hasClass("bd-minimal")) ? "45px" : "70px";
		}
	};
	outGuilds.onmouseover = function(){ 
		guildsHide = true; 
		outGuilds.style.display = "none"; 
		guilds.style.left = "-70px";
		if(settings.mobilefy){
			channels.style.left = "-240px";
		}
	};
};
CompactGuilds.prototype.stop = function () {
	// Called when plugin is disabled
	window.removeEventListener('resize',this.windowResizeEvent,false);
	this.disable();
};

CompactGuilds.prototype.disable = function(){
	// Permashows guilds
	if(!this.enabled) return;
	this.enabled = false;
	var guilds = document.getElementsByClassName('guilds-wrapper')[0];
	var channels = document.querySelector(this.channelSelector);
	var accountName = document.getElementsByClassName('username')[0];
	var overGuilds = document.getElementById('hg_hoverOver');
	var outGuilds = document.getElementById('hg_hoverOut');
	overGuilds.parentNode.removeChild(overGuilds);
	outGuilds.parentNode.removeChild(outGuilds);
	guilds.style = {};
	channels.style = {};
	accountName.style.maxWidth = "";
	channels.style.width = "";


	BdApi.clearCSS('CompactGuildsCSS');
};

// Unused
CompactGuilds.prototype.load = function () {};
CompactGuilds.prototype.unload = function () {};
CompactGuilds.prototype.onMessage = function () {};
CompactGuilds.prototype.onSwitch = function () {};
CompactGuilds.prototype.observer = function () {};

// ========
// SETTINGS
// ========

CompactGuilds.prototype.settingsVersion = 13; 
	// Changing this value causes old versions of settings to be resetted. 
CompactGuilds.prototype.defaultSettings = function () {
	// Returns default settings
	return {
		version: this.settingsVersion, 
		show: 			30, 		// Min cursor distance (px) from left edge to view the sidebar
		hide: 			300, 		// Cursor distance (px) from left edge to hide the sidebar again
		trim: 			false,		// Edit channel css to make it slimmer
		activeWidth:    800,		// Plugin activation threshold
		always:         false,		// Ignore activeWidth, keep the bar hidden always
		mobilefy:       true,		// Hide channels too. (Originally this plugin only hid the guilds)
		animspeed:		200,		// Animation speed in milliseconds
		animstyle:		"Linear",	// Animation style
		minWidth:  		300,		// Window minimum width
		minHeight:		300, 		// Window minimum height
		overrideMins: 	true,		// enables the upper setting
	};
};

CompactGuilds.prototype.loadSettings = function() {
	// Loads settings from localstorage
	var settings = (bdPluginStorage.get(this.getName(), 'config')) ? JSON.parse(bdPluginStorage.get(this.getName(), 'config')) : {version:"0"};
	if(settings.version != this.settingsVersion){
		console.log('['+this.getName()+'] Settings were outdated/invalid/nonexistent. Using default settings.');
		settings = this.defaultSettings();
		bdPluginStorage.set(this.getName(), 'config', JSON.stringify(settings));
	}
	return settings;
};

CompactGuilds.prototype.resetSettings = function (button) {
	// Set settings to default and restarts the plugin
	var settings = this.defaultSettings();
	bdPluginStorage.set(this.getName(), 'config', JSON.stringify(settings));
	this.stop();
	this.start();
	button.innerHTML = "Settings resetted!";
	setTimeout(()=>{button.innerHTML = "Reset settings";},1000);
};

CompactGuilds.prototype.import = function (string) {
	bdPluginStorage.set(this.getName(), 'config', string);
	this.stop();
	this.start();
}

CompactGuilds.prototype.saveSettings = function (button) {
	// Saves settings from setting panel
	var settings = this.loadSettings();
	settings.animspeed = document.getElementById('hg_animspeed').value;
	settings.animstyle = document.getElementById('hg_animstyle').value;
	settings.show = document.getElementById('hg_show').value;
	settings.hide = document.getElementById('hg_hide').value;
	settings.trim = document.getElementById('hg_trim').checked;
	settings.always = document.getElementById('hg_always').checked;
	settings.mobilefy = document.getElementById('hg_mobilefy').checked;
	settings.activeWidth = document.getElementById('hg_activeWidth').value;

	settings.minHeight = document.getElementById('hg_minHeight').value;
	settings.minWidth = document.getElementById('hg_minWidth').value;

	bdPluginStorage.set(this.getName(), 'config', JSON.stringify(settings));

	this.stop();
	this.start();
	
	button.innerHTML = "Saved and applied!";
	setTimeout(function(){button.innerHTML = "Save and apply";},1000);
};

CompactGuilds.prototype.getSettingsPanel = function () {
	// ???
	var settings = this.loadSettings();
	var html = "<h3>Settings Panel</h3><br>";
	html += "Animation speed <br>";
	html +=	"<input id='hg_animspeed' type='number'value=" + (settings.animspeed) + "> milliseconds<br><br>";

	html += "Animation style<br>";
	html += "<select id='hg_animstyle'>";
	var a = ['Linear','Ease','Ease-in','Ease-out','Ease-in-out'];
	for (var i = 0; i < a.length; i++) {
		html += "<option value='"+a[i]+"'"+((settings.animstyle==a[i])? "selected":"")+">"+a[i];
	}
	html += "</select><br><br>";  

	html += "Show distance<br>";
	html += "<input id='hg_show' type='number' value=" +settings.show+ "> pixels<br><br>";

	html += "Hide distance<br>";
	html +=	"<input id='hg_hide' type='number' value=" +settings.hide+ "> pixels<br><br>";

	html += "Max window size to enable compact guilds<br>";
	html += "<input id='hg_activeWidth' type='number' value=" +settings.activeWidth+ "> pixels<br><br>";
	
	html += "<input type='checkbox' id='hg_always'";
	html += (settings.always) ? " checked>" : ">";
	html += "Enable guild hiding always<br>";



	html += "<input type='checkbox' id='hg_enableminsize'";
	html += (settings.overrideMins) ? " checked>" : ">";
	html += "Override default window minimum sizes (restart discord when toggling off)<br>";
	html += "Width:  <input id='hg_minWidth'  type='number' value=" +settings.minWidth+ "> pixels<br>";
	html += "Height: <input id='hg_minHeight' type='number' value=" +settings.minHeight+ "> pixels<br><br>";


	html += "<input type='checkbox' id='hg_trim'";
	html += (settings.trim) ? " checked>" : ">";
	html += "Make channels thinner<br>";

	html += "<input type='checkbox' id='hg_mobilefy'";
	html += (settings.mobilefy) ? " checked>" : ">";
	html += "Hide channels too<br>";

	html +="<br><button onclick=BdApi.getPlugin('"+this.getName()+"').saveSettings(this)>Save and apply</button>";
	html +="<button onclick=BdApi.getPlugin('"+this.getName()+"').resetSettings(this)>Reset settings</button> <br><br>";

	html += "If your hide distance is too low you might not be able to access the settings panel. Use CTRL+COMMA (,) if this happens.";
	return html;
};
