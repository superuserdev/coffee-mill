// 2017-11-02 16:19
const config = {
	version: '0.1.0',
	caches: [
		// Main assets
		'/',
	],
	ignored: [
		'/service-worker.js',
		'/manifest.json',
	],
	paths: [
		'/js/',
		'/css/',
		'/img/',
		'/fonts/',
	],
};

self.addEventListener('install', async () => {
	const cache = await caches.open(config.version);
	const keys = await caches.keys();
	await keys.forEach(async key => {
		if (key !== config.version) {
			await caches.delete(key);
		}
	});
	await cache.addAll(config.caches);
	skipWaiting();

});

self.addEventListener('activate', event => {
	event.waitUntil(async function() {
		clients.claim();
		const keys = await caches.keys();
		keys.forEach(async key => {
			if (key !== config.version) {
				await caches.delete(key);
			}
		});
	}());
});

self.addEventListener('fetch', async event => {
	function isValid(req) {
		try {
			const url = new URL(req.url);
			const isGet = req.method === 'GET';
			const sameOrigin = url.origin === location.origin;
			const isHome = ['/', '/index.html', '/index.php'].some(path => url.pathname === path);
			const notIgnored = config.ignored.every(path => url.pathname !== path);
			const allowedPath = config.paths.some(path => url.pathname.startsWith(path));

			return isGet && sameOrigin && (isHome || (allowedPath && notIgnored));
		} catch(err) {
			console.error(err);
			return false;
		}
	}

	async function get(request) {
		const cache = await caches.open(config.version);
		const cached = await cache.match(request);

		if (navigator.onLine) {
			const fetched = fetch(request).then(async resp => {
				if (resp instanceof Response) {
					const respClone = await resp.clone();
					await cache.put(event.request, respClone);
				}
				return resp;
			});

			if (cached instanceof Response) {
				return cached;
			} else {
				const resp = await fetched;
				return resp;
			}
		} else {
			return cached;
		}
	}

	if (isValid(event.request)) {
		event.respondWith(get(event.request));
	}
});
