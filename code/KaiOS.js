(function (app) {
	//input mapping
	document.addEventListener('keydown', handleKeydown);
	document.addEventListener('keyup', handleKeyup);

	var keyOverlay = document.getElementById('keyOverlay');
	var overlayTimeout;

	function handleKeydown(e) {
		// enable key overlay
		keyOverlay.style.display = 'block';
		keyOverlay.innerHTML += '<span>' + e.key + '</span>';
		console.log('Button pressed:', e.key);

		// clear overlay
		clearTimeout(overlayTimeout);
		overlayTimeout = setTimeout(function () {
			keyOverlay.innerHTML = ' ';
			keyOverlay.style.display = 'none';
		}, 1000);

		switch (e.key) {
			case 'Backspace':
				e.preventDefault(); // prevent the app from closing
				break;
		}
	}

	function handleKeyup(e) {
		switch (e.key) {
			case 'ArrowUp':
			case '2': /* num pad navigation */
				app.keyCallback.dUp();
				break;
			case 'ArrowDown':
			case '8': /* num pad navigation */
				app.keyCallback.dDown();
				break;
			case 'ArrowLeft':
			case '4': /* num pad navigation */
				app.keyCallback.dLeft();
				break;
			case 'ArrowRight':
			case '6': /* num pad navigation */
				app.keyCallback.dRight();
				break;
			case 'SoftLeft':
			case 'Control': /* use on PC */
				app.keyCallback.softLeft();
				break;
			case 'SoftRight':
			case 'Alt': /* use on PC */
				app.keyCallback.softRight();
				break;
			case 'Enter':
			case '5':
				app.keyCallback.enter();
				break;
			case 'ContextMenu':
				app.keyCallback.menu();
				break;
			case 'Backspace':
				app.keyCallback.back();
				break;
			case 'EndCall':
				app.keyCallback.quit();
				break;
			default:
				app.keyCallback.other(e.key);
		}
	}

	// display ad when app is loaded

	// the escape key will dismiss the ad on the PC 
	// on the device or simulator press left soft key
	var fullscreenAd = false; /* switch between fullscreen and responsive ad */
	var testMode = 1; /* set to 0 for real ads */

	document.addEventListener("DOMContentLoaded", () => {
		var adContainer;
		var adMaxHeight;
		var adMaxWidth;
		var adTabIndex;

		if (!fullscreenAd) {
			adContainer = document.getElementById('ad-container');
			adMaxHeight = 60;
			adMaxWidth = 224;
			adTabIndex = 50; /* last item on the main menu, in this example */
		}

		try {
			// display ad
			getKaiAd({
				publisher: 'MyPublisherID',
				app: 'MyApp',
				test: testMode,
				/* only for responsive ads */
				h: adMaxHeight,
				w: adMaxWidth,
				container: adContainer,
				/* up to here */

				/* error codes */
				/* https://www.kaiads.com/publishers/sdk.html#error */
				onerror: err => console.error('KaiAds error catch:', err),
				onready: ad => {
					ad.call('display', {
						tabindex: adTabIndex,
						navClass: 'navItem',
						display: 'block'
					})

					ad.on('click', () => console.log('ad clicked'))
					ad.on('close', closeAd)
					ad.on('display', displayAd)

				}
			});
		} catch (e) {
			var message = 'KaiAds not available: https://www.kaiads.com/publishers/sdk.html';
			console.log(message);
			if (!fullscreenAd) {
				adContainer.innerText = message;
			}
		}
	});

	function displayAd() {
		console.log('ad displayed');
		if (fullscreenAd) {
			app.fullAdVisible = true;
		}
		/* do something, like pause the app */
	}

	function closeAd() {
		console.log('ad closed')
		if (fullscreenAd) {
			setTimeout(function () {
				app.fullAdVisible = false;
				app.activeNavItem.focus();
			}, 200); /* delayed to avoid background button execution */
		}
	}

	return app;
}(MODULE));