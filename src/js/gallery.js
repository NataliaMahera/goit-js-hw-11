import { PixabayAPI } from './pixabay-api.js';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { lightbox } from './SimpleLightbox.js';
import refs from './refs.js';
import { renderMarkup } from './helpers.js';
import { smoothScroll } from './smoothScroll.js';

const pixabayApi = new PixabayAPI(40);

let totalPages = 0;

refs.form.addEventListener('submit', onSubmit);

async function onSubmit(e) {
  e.preventDefault();

  const searchQuery = e.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery) {
    return Notify.warning('Please, fill the main field');
  }

  pixabayApi.q = searchQuery;
  pixabayApi.page = 1;

  try {
    const { totalHits, hits } = await pixabayApi.getPhotos();

    if (totalHits === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notify.success(`Hooray! We found: ${totalHits} images.`);

      refs.list.innerHTML = renderMarkup(hits);
      lightbox.refresh();
    }

    totalPages = Math.ceil(totalHits / 40);

    if (totalPages === 1) {
      return;
    }
    observer.observe(refs.targetEl);
  } catch (error) {
    onGetError();
  } finally {
    refs.form.reset();
  }
}

const observer = new IntersectionObserver(
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

async function loadMoreData(e) {
  pixabayApi.page += 1;

  const { hits } = await pixabayApi.getPhotos();

  refs.list.insertAdjacentHTML('beforeend', renderMarkup(hits));
  smoothScroll();
  lightbox.refresh();

  try {
    if (pixabayApi.page === totalPages) {
      Notify.info("You've reached the end of search results");
      observer.unobserve(refs.targetEl);

      return;
    }
  } catch (error) {
    onGetError();
  }
}

function onGetError() {
  Notify.failure('Oops! Something went wrong! Try reloading the page!');
}
