import { PixabayAPI } from './gallery-api.js';

const pixabayApi = new PixabayAPI(12);
pixabayApi.q = 'cat';
pixabayApi.page += 1;
pixabayApi.getPhotos().then(console.log);
