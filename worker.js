const version = 'v1';

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(version);
    await cache.addAll(resources);
};

self.addEventListener('install', (e) => {
    console.log(`${version} installing...`);

    e.waitUntil(
        addResourcesToCache(
            '/',
            'index.html',
            'style.css',
            'Ac437_Acer_VGA_8x8.ttf',
            'reset.css',
            'script.js'
        )
    );
});
