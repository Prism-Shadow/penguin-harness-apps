export const tracks = [
  {
    season: "S4",
    year: 2014,
    name: "Warriors",
    artist: "2WEI & Edda Hayes",
    edition: "2020 arrangement",
    shade: "#d6ad67",
    soundcloudId: "741400270",
    path: "leagueoflegends/warriors",
  },
  {
    season: "S5",
    year: 2015,
    name: "Worlds Collide",
    artist: "Nicki Taylor",
    shade: "#6fc6b5",
    soundcloudId: "2169007887",
    path: "leagueoflegends/worlds-collide",
  },
  {
    season: "S7",
    year: 2017,
    name: "Legends Never Die",
    artist: "Against The Current",
    shade: "#dd976c",
    soundcloudId: "342419243",
    path: "leagueoflegends/legends-never-die",
  },
  {
    season: "S9",
    year: 2019,
    name: "Phoenix",
    artist: "Cailin Russo & Chrissy Costanza",
    shade: "#c98fae",
    soundcloudId: "2169009192",
    path: "leagueoflegends/phoenix",
  },
  {
    season: "S11",
    year: 2021,
    name: "Burn It All Down",
    artist: "PVRIS",
    shade: "#ed9663",
    soundcloudId: "1132736809",
    path: "leagueoflegends/burn-it-all-down",
  },
  {
    season: "S13",
    year: 2023,
    name: "GODS",
    artist: "NewJeans",
    shade: "#a899d9",
    soundcloudId: "1746444132",
    path: "leagueoflegends/gods",
  },
  {
    season: "S14",
    year: 2024,
    name: "Heavy Is the Crown",
    artist: "Linkin Park",
    shade: "#96b973",
    soundcloudId: "1916282900",
    path: "linkinpark/heavy-is-the-crown",
  },
  {
    season: "S15",
    year: 2025,
    name: "Sacrifice",
    artist: "G.E.M.",
    shade: "#81accd",
    soundcloudId: "2184336783",
    path: "leagueoflegends/sacrifice",
  },
];
export const trackUrl = (track) =>
  new URL(track.path, "https://soundcloud.com/").href;
export const playerUrl = (track) => {
  const url = new URL("https://w.soundcloud.com/player/");
  url.search = new URLSearchParams({
    // SoundCloud’s official oEmbed uses this API resource for the public track URL.
    url: "https://api.soundcloud.com/tracks/" + track.soundcloudId,
    visual: "true",
    color: "f0b90b",
    single_active: "true",
    auto_play: "false",
  });
  return url.href;
};
