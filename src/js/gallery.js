import { PixabayAPI } from './pixabay-api.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { lightbox } from './SimpleLightbox.js';
import refs from './refs.js';
import { renderMarkup } from './helpers.js';

const pixabayApi = new PixabayAPI(40);

let totalPages = 0;

refs.form.addEventListener('submit', onSubmit);

let observer = new IntersectionObserver(
  (entries, observer) => {
    if (entries[0].isIntersecting) {
      loadMoreData();
    }
  },
  {
    root: null,
    rootMargin: '600px',
    threshold: 1,
  }
);

function onSubmit(e) {
  e.preventDefault();

  const searchQuery = e.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery) {
    return Notify.warning('Please, fill the main field');
  }

  pixabayApi.q = searchQuery;
  pixabayApi.page = 1;

  pixabayApi
    .getPhotos()
    .then(data => {
      if (data.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notify.success(`Hooray! We found: ${data.totalHits} images.`);
        refs.list.innerHTML = renderMarkup(data.hits);
        lightbox.refresh();
      }

      totalPages = Math.ceil(data.totalHits / 40);

      if (totalPages === 1) {
        return;
      }
      observer.observe(refs.targetEl);
    })
    .catch(onGetError)
    .finally(() => refs.form.reset());
}

function loadMoreData(e) {
  pixabayApi.page += 1;

  pixabayApi
    .getPhotos()
    .then(resp => {
      if (pixabayApi.page >= totalPages) {
        Notify.info("You've reached the end of search results");
        observer.unobserve(refs.targetEl);
        return;
      }
      refs.list.insertAdjacentHTML('beforeend', renderMarkup(resp.hits));
    })
    .catch(onGetError);
}

export function onGetError() {
  // Loading.remove();
  Notify.failure('Oops! Something went wrong! Try reloading the page!');
}
