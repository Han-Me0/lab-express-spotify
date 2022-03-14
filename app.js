require("dotenv").config();

const express = require("express");
const hbs = require("hbs");

// require spotify-web-api-node package here:
const SpotifyWebApi = require("spotify-web-api-node");
const serverMethods = require("spotify-web-api-node/src/server-methods");

const app = express();

app.set("view engine", "hbs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// setting the spotify-api goes here:

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then((data) => spotifyApi.setAccessToken(data.body["access_token"]))
  .catch((error) =>
    console.log("Something went wrong when retrieving an access token", error)
  );

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/artist-search", (req, res) => {
  let searchArtistByName = req.query.artist;
  /* console.log(searchArtistByName); */

  spotifyApi.searchArtists(searchArtistByName).then((data) => {
    /* console.log("The received data from the API: ", data.body.artists.items[0].images[0].url); */
    /* console.log(data.body.artists); */

    let items = data.body.artists.items;
    let artistName = items[0].name;
    let artistImg = items[0].images[0].url;
    let artistId = items[0].id;
    res.render("artist-search-results", {
      artistName,
      artistImg,
      artistId,
    });
  });
  /*   .catch((err) =>
        console.log("The error while searching artists occurred: ", err)
      ); */
});

app.get("/albums/:artistId", (req, res, next) => {
  let artistId = req.params.artistId;
  /* console.log('Here is the ID', artistId); */
  let albumArray = [];

  spotifyApi.getArtistAlbums(artistId).then((data) => {
    /* console.log("The received data from the API: ", data); */
    let albumItems = data.body.items;
    /* console.log("Here are the Items", albumItems); */
    let artistName = data.body.items[0].artists[0].name;
    /* console.log("Here is the artiName: ", artistName); */

    for (let i = 0; i < albumItems.length; i++) {
      let elem = albumItems[i];

      let albumObj = {
        name: "",
        albumImg: "",
        albumId: "",
      };

      albumObj.name = elem.name;
      albumObj.albumImg = elem.images[0].url;
      albumObj.albumId = elem.id;
      albumArray.push(albumObj);
    }
    /* console.log(albumArray); */
    res.render("albums", { artistName, albumArray });
  });
  /*     .catch((err) =>
        console.log("The error while searching artists occurred: ", err)
      ); */
});

app.get("/albums/tracks/:albumId", (req, res) => {
  let albumId = req.params.albumId;
  let tracksArray = [];

  spotifyApi.getAlbumTracks(albumId).then((data) => {
    let items = data.body.items;
    let artistName = data.body.items[0].artists[0].name;

    for (let i = 0; i < items.length; i++) {
      let elem = items[i];

      let tracksObj = {
        name: "",
        trackNumber: "",
      };

      tracksObj.name = elem.name;
      tracksObj.trackNumber = elem.track_number;
      tracksArray.push(tracksObj);
    }
    console.log("tracks", { artistName, tracksArray });
    res.render("tracks", { tracksArray });
  });
});

app.listen(3000, () =>
  console.log("My Spotify project running on port 3000 🎧 🥁 🎸 🔊")
);
