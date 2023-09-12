import { PixabayAPI } from './pixabay-api.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { lightbox } from './SimpleLightbox.js';
import refs from './refs.js';
import { renderMarkup } from './helpers.js';

const pixabayApi = new PixabayAPI(40);

refs.form.addEventListener('submit', onSubmit);

function onSubmit(e) {
  e.preventDefault();
  const searchQuery = e.currentTarget.elements['searchQuery'].value.trim();

  if (!searchQuery) {
    return Notify.warning('Please, fill the main field');
  }

  pixabayApi.q = searchQuery;
  pixabayApi.page = 1;

  pixabayApi.getPhotos().then(data => {
    Notify.success(`Hooray! We found: ${data.totalHits} images.`);

    refs.list.innerHTML = renderMarkup(data.hits);
    lightbox.refresh();
  });
}
