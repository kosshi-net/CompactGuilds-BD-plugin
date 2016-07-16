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
	return "0.1.8";
};

CompactGuilds.prototype.windowResizeEvent = function() {
	// Called when window is resized.
	var settings = CompactGuilds.prototype.loadSettings();
	var plugin = BdApi.getPlugin('CompactGuilds');
	if(settings.always) {
		plugin.enable();
		return;
	}
	if(window.innerWidth < settings.activeWidth){
		if(!plugin.enabled) plugin.enable();
	}else{
		if(plugin.enabled) plugin.disable();
	}
};

CompactGuilds.prototype.enabled = false; // if guilds are hidden

CompactGuilds.prototype.start = function () {
	// Called when plugin is started
	window.addEventListener('resize',this.windowResizeEvent,false);
	this.windowResizeEvent();
};

CompactGuilds.prototype.enable = function() {
	// Hides guilds
	if(this.enabled) return;
	this.enabled = true;
	var settings = this.loadSettings();

	var guilds = document.getElementsByClassName('guilds-wrapper')[0];
	var main = document.getElementsByClassName('flex-horizontal flex-spacer')[0];
	var channels = document.getElementsByClassName('flex-vertical channels-wrap')[0];
	
	if(settings.trim){
		var accountName = document.getElementsByClassName('username')[0];
		accountName.style.maxWidth = "40px";
		channels.style.width = '200px';
	}

	var guildsHide = true;
	var overGuilds = document.createElement('div');
	overGuilds.id = 'hg_hoverOver';
	main.appendChild(overGuilds);
	var outGuilds = document.createElement('div');
	outGuilds.id = 'hg_hoverOut';
	main.appendChild(outGuilds);

	$('#hg_hoverOver').css({
		"position":"absolute",
		"height":"100%",
		"width": settings.show+"px",
		"left":"0"
	});
	$('#hg_hoverOut').css({
		"position": "fixed",
		"height": "100%",
		"left": settings.hide+"px",
		"overflowX": "hidden",
		"overflowY": "hidden",
		"width": "80%",
		"zIndex": "9001",
		"display": "none"
	});
	$('.guilds-wrapper').css({
		"position": "fixed",
		"height": "100%",
		"zIndex": "3",
		"left": "-80px",
		"transition": settings.animstyle +" "+settings.animspeed+"ms"
	});
	if(settings.mobilefy){
		$('.channels-wrap').css({
			"position": "fixed",
			"height": "100%",
			"zIndex": "2",
			"left": "-240px",
			"transition": settings.animstyle +" "+settings.animspeed+"ms"
		});
	}

	overGuilds.onmouseover = function(){ 
		guildsHide = false; 
		outGuilds.style.display = "block";
		guilds.style.left = "0px";
		if(settings.mobilefy){
			// fix for minimal mode
			channels.style.left = ($("body").hasClass("bd-minimal")) ? "45px" : "80px";
		}
	};
	outGuilds.onmouseover = function(){ 
		guildsHide = true; 
		outGuilds.style.display = "none"; 
		guilds.style.left = "-80px";
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
	var channels = document.getElementsByClassName('flex-vertical channels-wrap')[0];
	var accountName = document.getElementsByClassName('username')[0];
	var overGuilds = document.getElementById('hg_hoverOver');
	var outGuilds = document.getElementById('hg_hoverOut');
	overGuilds.parentNode.removeChild(overGuilds);
	outGuilds.parentNode.removeChild(outGuilds);
	guilds.style = {};
	channels.style = {};
	accountName.style.maxWidth = "";
	channels.style.width = "";
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

CompactGuilds.prototype.settingsVersion = 10; 
	// Changing this value causes old versions of settings to be resetted. 
CompactGuilds.prototype.defaultSettings = function () {
	// Returns default settings
	return {
		version: this.settingsVersion, 
		show:30, 				// Min cursor distance (px) from left edge to view the sidebar
		hide:300, 				// Cursor distance (px) from left edge to hide the sidebar again
		trim:true,				// Edit channel css to make it slimmer
		activeWidth: 1000,		// Plugin activation threshold
		always: false,			// Ignore activeWidth, keep the bar hidden always
		mobilefy: true,			// Hide channels too. (Originally this plugin only hid the guilds)
		animspeed:200,			// Animation speed in milliseconds
		animstyle:"Linear"		// Animation style
	};
};

CompactGuilds.prototype.loadSettings = function() {
	// Loads settings from localstorage
	var settings = (localStorage.CompactGuilds) ? JSON.parse(localStorage.CompactGuilds) : {version:"0"};
	if(settings.version != this.settingsVersion){
		console.log('[CompactGuilds] Settings were outdated/invalid/nonexistent. Using default settings.');
		settings = this.defaultSettings();
		localStorage.CompactGuilds = JSON.stringify(settings);
	}
	return settings;
};

CompactGuilds.prototype.resetSettings = function (button) {
	// Set settings to default and restarts the plugin
	var settings = this.defaultSettings();
	localStorage.CompactGuilds = JSON.stringify(settings);
	this.stop();
	this.start();
	button.innerHTML = "Settings resetted!";
	setTimeout(function(){button.innerHTML = "Reset settings";},1000);
};

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
	
	localStorage.CompactGuilds = JSON.stringify(settings);

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


	html += "<input type='checkbox' id='hg_trim'";
	html += (settings.trim) ? " checked>" : ">";
	html += "Make channels thinner<br>";

	html += "<input type='checkbox' id='hg_mobilefy'";
	html += (settings.mobilefy) ? " checked>" : ">";
	html += "Hide channels too<br>";

	html +="<br><button onclick='BdApi.getPlugin(\"CompactGuilds\").saveSettings(this)'>Save and apply</button>";
	html +="<button onclick='BdApi.getPlugin(\"CompactGuilds\").resetSettings(this)'>Reset settings</button> <br><br>";

	html += "If your hide distance is too low you might not be able to access the settings panel. Use CTRL+COMMA (,) if this happens.";
	return html;
};
