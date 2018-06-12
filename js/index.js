import {ready, $} from './std-js/functions.js';

ready().then(async () => {
	$(document.documentElement).replaceClass('no-js', 'js');
});
