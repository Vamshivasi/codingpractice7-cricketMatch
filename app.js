const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`Db Error ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
// api 1
app.get("/players/", async (request, response) => {
  const getPlayersDetails = ` 
    select
         player_id as playerId, 
         player_name as playerName
    from 
        player_details;
    `;
  const playerArray = await db.all(getPlayersDetails);
  response.send(playerArray);
});
// api 2

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    select player_id as playerId, 
    player_name as playerName
    from player_details
    where playerId= ${playerId};
    `;
  const playerDetailArray = await db.get(getPlayerQuery);
  response.send(playerDetailArray);
});

//api 3
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updateQuery = `
    update 
        player_details
    set player_name ='${playerName}'
    where player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});
// api 4
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = ` 
    select 
        match_id as matchId,
        match, 
        year
    from match_details 
    where match_id = ${matchId};`;
  const matchesArray = await db.get(getMatchQuery);
  response.send(matchesArray);
});

//api 5
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const gettingMatchDetails = ` 
    select 
        match_id as matchId,
        match,
        year

    from player_match_score natural join match_details 
    where player_id = ${playerId};
    `;
  const playerMatchDetails = await db.all(gettingMatchDetails);
  response.send(playerMatchDetails);
});

// api 6

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerDetails = ` 
    select 
        player_id as playerId, 
        player_name as playerName
    from player_match_score natural join player_details
    where match_id like ${matchId};
    `;
  const playerDetails = await db.all(getPlayerDetails);
  response.send(playerDetails);
});

// api 7
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const gettingPlayerScore = `
    select 
        player_id as playerId,
        player_name as playerName,
        sum(score) as totalScore, 
        sum(fours) as totalFours, 
        sum(sixes) as totalSixes
    from player_match_score natural join  player_details 
    where player_id = ${playerId};`;
  const playerScore = await db.get(gettingPlayerScore);
  response.send(playerScore);
});

module.exports = app;
