// Test file to check how the Google Play API should be used
const gplay = require('google-play-scraper');

// Inspect the structure of the google-play-scraper package
console.log('Google Play Scraper structure:');
console.log('Available methods:', Object.keys(gplay));

// Check if app is a function
console.log('Is app a function?', typeof gplay.app === 'function');

// Check if app is nested under another property
for (const key of Object.keys(gplay)) {
  if (typeof gplay[key] === 'object' && gplay[key] !== null) {
    console.log(`Properties under ${key}:`, Object.keys(gplay[key]));
    if (gplay[key].app && typeof gplay[key].app === 'function') {
      console.log(`Found app function under ${key}`);
    }
  }
}

// The app function is under the default property
console.log('Testing app function using default...');
gplay.default.app({appId: 'com.spotify.music'})
  .then(result => {
    console.log('App function works!');
    console.log('Title:', result.title);
    console.log('Developer:', result.developer);
    console.log('Score:', result.score);
  })
  .catch(err => {
    console.error('App function error:', err);
  });

// Test reviews function
console.log('Testing reviews function using default...');
gplay.default.reviews({
  appId: 'com.spotify.music',
  num: 3,
  sort: gplay.default.sort.NEWEST
})
  .then(result => {
    console.log('Reviews function works!');
    console.log('Number of reviews:', result.data.length);
    if (result.data.length > 0) {
      console.log('First review:', result.data[0].text.substring(0, 50) + '...');
    }
  })
  .catch(err => {
    console.error('Reviews function error:', err);
  }); 