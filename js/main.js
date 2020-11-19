var addButton = document.querySelector('.fa-plus');
var dataView = document.querySelectorAll('[data-view]');
var dataButton = document.querySelectorAll('[data-button]');
var $homepageForm = document.querySelector('.homepageForm');
var $homepageSearch = document.querySelector('.homepage-form-search');
var $header = document.querySelector('.header-profile-list');
var $playerName = document.querySelector('.playerName');
var $position = document.querySelector('.position');
var $tableDraftListBody = document.querySelector('.table-draft-list-body');
var $homeIcon = document.querySelector('.fa-home');
var $chartIcon = document.querySelector('.fa-chart-line');
var $listIcon = document.querySelector('.fa-list');
var $depthButton = document.querySelector('.homepage-form-search-button');
var $draftButton = document.querySelector('.homepage-form-search-list');
var $rankButton = document.querySelector('.homepage-form-search-rank');
var $rankIcon = document.querySelector('.fa-sort-numeric-down');
var $tableHistorical = document.querySelector('.table-historical');
var $tableHistoricalBody = document.querySelector('.table-historical-body');
var $playerName = document.querySelector('.playerName');
var $team = document.querySelector('.team');
var $position = document.querySelector('.position');
var $tableProjectionBody = document.querySelector('.table-projections-body');
var $tableProjectionBodyRow = document.querySelector('.table-projections-body-row');
var $draftProjection = document.querySelector('.projection');
var $tableRankBody = document.querySelector('.table-rank-body');
var $topPlayerFormTeam = document.querySelector('.topPlayerForm-team');

//used for storing player profile into localStorage
var previousDataJson = localStorage.getItem('playerData');
if (previousDataJson !== null) {
  data = JSON.parse(previousDataJson);
}

function profileStorage(event) {
  var dataJson = JSON.stringify(data);
  localStorage.setItem('playerData', dataJson);
}
window.addEventListener('beforeunload', profileStorage);

//used for fantasybasektballnerd api - pulls projected stats for the upcoming season
var xml = null;
var jsonParse = null; //holds data from fantasybballnerd
function ballProjections() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.codetabs.com/v1/proxy?quest=https://www.fantasybasketballnerd.com/service/draft-projections');
  xhr.responseType = 'document';
  xhr.addEventListener('loadstart', function(e) {
    loading();
  });
  xhr.addEventListener('load', function () {
    if (xhr.status === 200) {
      viewSwap(0);
      $header.classList.add('hidden');
      xml = xhr.response;
      var jsonString = JSON.stringify(xmlToJson(xml));
      jsonParse = JSON.parse(jsonString)
      ballProjectionsRankList();
      for (var i = 1; i <= $tableRankBody.childNodes.length - 1; i++) {
        $tableRankBody.childNodes[i].childNodes[1].addEventListener('click', function (e) {
          ballDontLie(e.target.textContent);
          dataView[4].classList.add('hidden');
          dataView[1].classList.remove('hidden');
          $header.classList.remove('hidden');
        })
      }
    }
  });
  xhr.addEventListener('error', function() {
    failed();
  });

  xhr.send();
}
ballProjections();

function ballProjectionsFindPlayer(player) { //will look through draft projection list and match from profile text content
  var playerDB = jsonParse.FantasyBasketballNerd.Player;
  for (var i = 0; i <= playerDB.length - 1; i++) {
    if (playerDB[i].name['#text'] === player) {
      $draftProjection.textContent = 'Draft Rank: ' + (playerDB.indexOf(playerDB[i]) + 1);
      var games = Number(playerDB[i].Games["#text"]);
      var points = document.createElement('td');
      points.textContent = Math.round(((Number(playerDB[i].PTS["#text"]) / games) + Number.EPSILON) * 100) / 100;
      $tableProjectionBodyRow.appendChild(points);

      var assists = document.createElement('td');
      assists.textContent = Math.round(((Number(playerDB[i].AST["#text"]) / games) + Number.EPSILON) * 100) / 100;
      $tableProjectionBodyRow.appendChild(assists);

      var rebounds = document.createElement('td');
      rebounds.textContent = Math.round(((Number(playerDB[i].REB["#text"]) / games) + Number.EPSILON) * 100) / 100;
      $tableProjectionBodyRow.appendChild(rebounds);

      var steals = document.createElement('td');
      steals.textContent = Math.round(((Number(playerDB[i].STL["#text"]) / games) + Number.EPSILON) * 100) / 100;
      $tableProjectionBodyRow.appendChild(steals);

      var blocks = document.createElement('td');
      blocks.textContent = Math.round(((Number(playerDB[i].BLK["#text"]) / games) + Number.EPSILON) * 100) / 100;
      $tableProjectionBodyRow.appendChild(blocks);

      var freethrow = document.createElement('td');
      freethrow.textContent = Math.round(((Number(playerDB[i].FT["#text"])) + Number.EPSILON) * 100) / 100;
      $tableProjectionBodyRow.appendChild(freethrow);

      var threepoint = document.createElement('td');
      threepoint.textContent = Math.round(((Number(playerDB[i].THREES["#text"]) / games) + Number.EPSILON) * 100) / 100;
      $tableProjectionBodyRow.appendChild(threepoint);

      var turnover = document.createElement('td');
      turnover.textContent = Math.round(((Number(playerDB[i].TO["#text"]) / games) + Number.EPSILON) * 100) / 100;
      $tableProjectionBodyRow.appendChild(turnover);
    }
  }
}

//will populate the Draft List page with the projected top 200 players for the upcoming season
function ballProjectionsRankList() {
  for (var i = 0; i <= 199; i++) {
    var $tr = document.createElement('tr');
    var $rank = document.createElement('td');
    var $player = document.createElement('td');
    $player.classList.add('tableRankDataPlayer');
    $rank.textContent = jsonParse.FantasyBasketballNerd.Player.indexOf(jsonParse.FantasyBasketballNerd.Player[i]) + 1;
    $tr.appendChild($rank);
    $player.textContent = jsonParse.FantasyBasketballNerd.Player[i].name["#text"];
    $tr.appendChild($player);
    $tableRankBody.appendChild($tr);
  }
}

var jsonParseDepth = null;
//letter is the position lettering. ex: PG = pointguard
//This function will populate the Depth Chart page
function depthChart(team, letter) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.codetabs.com/v1/proxy?quest=https://www.fantasybasketballnerd.com/service/depth/' + team);
  xhr.responseType = 'document';
  xhr.addEventListener('loadstart', function () {
    loading();
  });
  xhr.addEventListener('load', function () {
    viewSwap(2);
    xml = xhr.response;
    var jsonString = JSON.stringify(xmlToJson(xml));
    jsonParseDepth = JSON.parse(jsonString)
    var position = null;
    if (jsonParseDepth.FantasyBasketballNerd.Team.Position !== undefined) {
      for (var x = 0; x <= jsonParseDepth.FantasyBasketballNerd.Team.Position.length - 1; x++) {
        if (jsonParseDepth.FantasyBasketballNerd.Team.Position[x]["@attributes"].position === letter) {
          position = x;
        }
      }
      var $topPlayerFormBody = document.querySelector('.topPlayerForm-body');
      for (var i = 0; i <= jsonParseDepth.FantasyBasketballNerd.Team.Position.length - 1; i++) {
        if (position !== null) {
          var $tr = document.createElement('tr');
          var $rank = document.createElement('td');
          var $player = document.createElement('td');
          $rank.textContent = jsonParseDepth.FantasyBasketballNerd.Team.Position[position].Player[i].rank['#text'];
          $player.textContent = jsonParseDepth.FantasyBasketballNerd.Team.Position[position].Player[i].name['#text'];
          $player.classList.add('tableRankDataPlayer');
          $tr.appendChild($rank);
          $tr.appendChild($player);
          $topPlayerFormBody.appendChild($tr);
        }
      }
      for (var i = 0; i <= $topPlayerFormBody.childNodes.length - 1; i++) {
        $topPlayerFormBody.childNodes[i].childNodes[1].addEventListener('click', function (e) {
          ballDontLie(e.target.textContent);
          dataView[2].classList.add('hidden');
          dataView[1].classList.remove('hidden');
          $header.classList.remove('hidden');
        })
      }
    }
  });
  xhr.addEventListener('error', function () {
    failed();
  });
  xhr.send();
}

//function is used to pull information for the player profile
//it will also pull the past 5 seasons for the player
function ballDontLie(player) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://www.balldontlie.io/api/v1/players?search=' + player);
  xhr.responseType = 'json';
  xhr.addEventListener('loadstart', function () {
  });
  xhr.addEventListener('load', function () {
    var storage = [];
    if (xhr.status === 200) {
      $tableHistoricalBody.innerHTML = '';
      $tableProjectionBodyRow.innerHTML = '';
      var firstLast = player.split(' ');
      if ((firstLast[0].toLowerCase() === xhr.response.data[0].first_name.toLowerCase()) && (firstLast[1].toLowerCase() === xhr.response.data[0].last_name.toLowerCase())) {
        var playerID
        playerID = xhr.response.data[0].id;
        $playerName.textContent = xhr.response.data[0].first_name + ' ' + xhr.response.data[0].last_name;
        $team.textContent = 'Team: ' + xhr.response.data[0].team.abbreviation;
        $position.textContent = 'Position: ' + xhr.response.data[0].position;
        ballProjectionsFindPlayer($playerName.textContent);
        for (var i = 2015; i <= 2020; i++) {
          ballDontLieSeasonAvg(i, playerID);
        }
      } else {
        $playerName.textContent = 'Player Name';
      }
    }
  });
  xhr.addEventListener('error', function () {
    failed();
  });
  xhr.send();
}


function ballDontLieSeasonAvg(season, id) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://www.balldontlie.io/api/v1/season_averages?season=' + season + '&player_ids[]=' + id);
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    var queryData = ['season', 'pts', 'ast', 'reb', 'stl', 'blk', 'ft_pct', 'fg3_pct', 'turnover'];
    var $tr = document.createElement('tr');
    $tr.classList.add(queryData[0]);
    for (var i = 0; i <= queryData.length - 1; i++) {
      if (xhr.response.data[0] !== undefined) {
        var $td = document.createElement('td');
        $td.textContent = xhr.response.data[0][queryData[i]];
        $td.classList.add(queryData[i]);
        $tr.appendChild($td);
      }

    }
    $tableHistoricalBody.appendChild($tr);

    for (var x = 1; x <= queryData.length - 1; x++) {
      var name = '.' + queryData[x];
      var statClass = document.querySelectorAll(name);
      storage.push(statClass);
    }
  });
  xhr.addEventListener('error', function () {
    failed();
  });
  xhr.send();
}

function getTeams() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://www.balldontlie.io/api/v1/teams');
  xhr.responseType = 'json';

  xhr.addEventListener('load', function () {

    for (var i = 0; i <= xhr.response.data.length - 1; i++) {
      var $option = document.createElement('option');
      $option.textContent = xhr.response.data[i].abbreviation;
      $topPlayerFormTeam.appendChild($option);
    }
  });
  xhr.addEventListener('error', function () {
    failed();
  });
  xhr.send();

}
getTeams();

//in case connection fails, there will be a page so that the app fails gracefully
function failed() {
  for (var i = 0; i <= dataView.length - 1; i++) {
    if (i !== 5) {
      dataView[i].classList.add('hidden');
    } else {
      dataView[i].classList.remove('hidden');
      $header.classList.remove('hidden');
    }
  }
}

//loading page while the XMLHttpRequest is being made
function loading() {
  for (var i = 0; i <= dataView.length - 1; i++) {
    if (i !== 6) {
      dataView[i].classList.add('hidden');
    } else {
      dataView[i].classList.remove('hidden');
    }
  }
}

//loads different pages depending on the click event that is triggered
function viewSwap(index) {
  for(var i = 0; i<=dataView.length-1; i++) {
    if(i === index) {
      dataView[i].classList.remove('hidden');
    }else {
      dataView[i].classList.add('hidden');
    }
  }
}

$homeIcon.addEventListener('click', function()  {
  viewSwap(0);
  $header.classList.add('hidden');
  addButton.classList.remove('red-color');
});

function headerShow(index) {
  viewSwap(index);
  $header.classList.remove('hidden');
  addButton.classList.remove('red-color');
}

$chartIcon.addEventListener('click', function() {
  headerShow(2);
})

$depthButton.addEventListener('click', function (e) {
  headerShow(Number(e.target.value));
})

$draftButton.addEventListener('click', function () {
  headerShow(3);
  draftList();
});

$listIcon.addEventListener('click', function ()  {
  headerShow(3);
  draftList();
});

$rankButton.addEventListener('click', function () {
  headerShow(4);
});

$rankIcon.addEventListener('click', function () {
  headerShow(4);
});

//when user enters player name in search bar, then page will change to profile view
$homepageForm.addEventListener('submit', function(e) {
  $tableHistoricalBody.innerHTML = '';
  $tableProjectionBodyRow.innerHTML = '';
  e.preventDefault();
  ballDontLie($homepageSearch.value);
  storage = [];
  dataView[0].classList.add('hidden');
  dataView[1].classList.remove('hidden');
  $header.classList.remove('hidden');
  if($playerName.textContent === 'Player Name') {
    $playerName.textContent = 'Player not found. Please try again.'
  }
  $homepageSearch.value = '';
});

//for dropdown menu team
var $topPlayerFormBody = document.querySelector('.topPlayerForm-body');
var flip = true;
var $option = document.querySelector('.topPlayerForm-team');
var team = null;
$option.addEventListener('click', function(e) {
  flip = !flip;
  if(flip === true) {
    team = e.target.value;
    if (positionSwitch === true && playerPosition !== null && team !== 'Teams') {
      $topPlayerFormBody.innerHTML = '';
      depthChart(team, playerPosition);
    }
  }

});

//for dropdown menu position
var positionSwitch = true;
var playerPosition = null;
var $optionPosition = document.querySelector('.topPlayerForm-position');
$optionPosition.addEventListener('click', function(e) {
  $topPlayerFormBody.innerHTML = '';
  positionSwitch = !positionSwitch;
  if (positionSwitch === true && e.target.value !== "Position" && team !== 'Teams') {
    playerPosition = e.target.value;
    depthChart(team, e.target.value);
  }
})

//add player to local storage
function addPlayer() {
  addButton.classList.add('red-color');
  var positionCut = $position.textContent.split(' ');
  data.profile.name = $playerName.textContent;
  data.profile.position = positionCut[1];
  var playerProfile = [];
  playerProfile.push(data.profile.name);
  playerProfile.push(data.profile.position);
  data.entries.push(playerProfile);
  draftList();
}
addButton.addEventListener('click', addPlayer);

function draftList() {
  $tableDraftListBody.innerHTML = '';
  for(var i = 0; i<=data.entries.length-1; i++) {
    var $trAdd = document.createElement('tr');
    $trAdd.classList.add('trAdd');
    var $trAddArray = document.querySelectorAll('.trAdd');
    var $tdAddName = document.createElement('td');
    $tdAddName.textContent = data.entries[i][0];
    $trAdd.appendChild($tdAddName);

    var $tdAddPosition = document.createElement('td');
    $tdAddPosition.textContent = data.entries[i][1];
    $trAdd.appendChild($tdAddPosition);

    var removeButton = document.createElement('button')
    removeButton.classList.add('removeArray');
    var removeButtonArray = document.querySelectorAll('.removeArray')
    removeButton.textContent = 'Remove';
    $trAdd.appendChild(removeButton);

    removeButton.addEventListener('click', function(e) {
      e.target.parentElement.remove();
      for(var i = 0; i<=data.entries.length-1; i++) {
        if (data.entries[i][0] === e.target.previousSibling.previousSibling.textContent) {
          data.entries.splice(i,1);
        }
      }
    })


    $tableDraftListBody.appendChild($trAdd);
  }
}
