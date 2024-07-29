let cheapSecsEl = document.getElementById('cheap_seconds');
let date = document.getElementById('date');
let bonus = document.getElementById('bonus');

date.textContent = new Date().toLocaleString();

function secondsToString(seconds) {
	dateObj = new Date(seconds * 1000);
	hours = dateObj.getUTCHours();
	minutes = dateObj.getUTCMinutes();
	seconds = dateObj.getSeconds();
	return (
		hours.toString().padStart(2, '0') +
		':' +
		minutes.toString().padStart(2, '0') +
		':' +
		seconds.toString().padStart(2, '0')
	);
}

async function my_usage() {
	const response = await chrome.runtime.sendMessage({
		give_me: 'my_current_usage',
	});

	cheapSecsEl.textContent = secondsToString(response['your_usage_is']);
	date.textContent =
		new Date().toLocaleString() +
		' (' +
		(response['you_are'] ? 'suspended' : 'not suspended') +
		')';
	bonus.textContent = secondsToString(response['your_bonus_is']);
}

my_usage();
setInterval(my_usage, 1000);
