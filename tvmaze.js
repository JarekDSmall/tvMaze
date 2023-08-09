"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

async function getShowsByTerm(term) {
  const response = await axios.get(`http://api.tvmaze.com/search/shows?q=${term}`);
  const shows = response.data.map(result => {
    const showData = result.show;
    return {
      id: showData.id,
      name: showData.name,
      summary: showData.summary,
      image: showData.image ? showData.image.medium : "https://tinyurl.com/tv-missing"
    };
  });
  return shows;
}

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img class="card-img-top" src="${show.image}" alt="${show.name}">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>`
    );

    $showsList.append($show);
  }
}

async function getEpisodesOfShow(id) {
  const response = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  return response.data.map(episode => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number
  }));
}

function populateEpisodes(episodes) {
  const $episodesList = $("<ul>");
  for (let episode of episodes) {
    const $episodeItem = $("<li>").text(`${episode.name} (season ${episode.season}, number ${episode.number})`);
    $episodesList.append($episodeItem);
  }
  $episodesArea.empty().append($episodesList).show();
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

$showsList.on("click", ".Show-getEpisodes", async function () {
  const showId = $(this).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
});

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}