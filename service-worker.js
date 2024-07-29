const stoppable_sites = [
	'instagram.com',
	'cdninstagram.com',
	'facebook.com',
	'tiktok.com',
	'youtube.com/shorts',
];
let minute_timer = 0;
let cheap_dopamine;
let is_suspended = false;
let bonus_time = 0;
let latest_day = new Date().getDate();

chrome.storage.sync.get(['day', 'cheap_dopamine']).then((data) => {
	if (Object.keys(data).length === 0 || data['day'] != latest_day) {
		chrome.storage.sync.set({ day: latest_day, cheap_dopamine: 0 });
		cheap_dopamine = 0;
	} else cheap_dopamine = data['cheap_dopamine'];
});

function enableSocialMedia() {
	chrome.declarativeNetRequest.updateEnabledRulesets({
		disableRulesetIds: ['1'],
	});
}

function disableSocialMedia() {
	chrome.declarativeNetRequest.updateEnabledRulesets({
		enableRulesetIds: ['1'],
	});
}

async function getCurrentTab() {
	let queryOptions = { active: true, lastFocusedWindow: true };
	let [tab] = await chrome.tabs.query(queryOptions);
	return tab;
}

function persist_usage() {
	chrome.storage.sync.set({ day: latest_day, cheap_dopamine: cheap_dopamine });
}

setInterval(async () => {
	let cDay = new Date().getDate();
	if (cDay > latest_day) {
		latest_day = cDay;
		cheap_dopamine = 0;
		is_suspended = false;

		persist_usage();
	}

	if (!is_suspended || bonus_time > 0) enableSocialMedia();

	getCurrentTab().then((cTab) => {
		if (cTab == undefined) return;
		if (stoppable_sites.filter((url) => cTab.url.includes(url)).length > 0) {
			if (!is_suspended || bonus_time > 0) {
				cheap_dopamine++;
				minute_timer++;
			}
			if (is_suspended && bonus_time > 0) bonus_time--;

			if (minute_timer >= 60) {
				minute_timer = 0;
				persist_usage();
			}

			if (cheap_dopamine >= 3600 && bonus_time <= 0) {
				disableSocialMedia();
				is_suspended = true;
				bonus_time = 0;
			}
		} else {
			if (is_suspended) bonus_time++;
		}
	});
}, 1000);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	sendResponse({
		your_usage_is: cheap_dopamine,
		you_are: is_suspended,
		your_bonus_is: bonus_time,
	});
});
