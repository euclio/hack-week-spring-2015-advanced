/*
 * IMPORTS: firebase.js, map_interface.js
 */

var DB = new Firebase('https://hack-vote.firebaseio.com/');

var votes = DB.child("votes");
var teams = DB.child("teams");

var localTeams = {};
var totalVotes = 0;

var localBallots = {};

var colorClasses = ["success", "info", "warning", "danger"]

var teamNames = $('#teamNames')
var teamVotes = $('#teamVotes')

/*
 *
 */
function appendDisplay(key, percent, colorID) {
    // Progress bar element
    var progressbar = $('<div>');

    // We only have 4 colors right now
    colorID %= 4;

    // Attributes for the progress bar (Bootstrap)
    var progressClass = 'progress-bar progress-bar-' + colorClasses[colorID];
    var progressAttr =
    {
      'class': progressClass,
      'role': 'progressbar',
      'aria-valuenow': '0',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'style': 'width:' + percent + '%'
    }
    progressbar.attr(progressAttr);
    progressbar.append(percent+'%');

    var newTeamName = $('<div>');
    newTeamName.attr('class', 'row ' + key);
    newTeamName.append(key);
    var newTeamVote = $('<div>');
    newTeamVote.attr('class', 'row ' + key);
    progressbar.attr('id', key);
    newTeamVote.append(progressbar);
    teamNames.append(newTeamName);
    teamVotes.append(newTeamVote);
}

/*
 * updateScores updates the graphic. This should be called each time
 * the database changes and we want the front-end to reflect the change.
 */
function updateScores() {
  teamNames.empty();
  teamVotes.empty();
  // Sort our dictionary by value
  var sortable = []; 
  for (var key in localTeams) {
    sortable.push([key, localTeams[key]]);
  }
  sortable.sort(function(a,b) {return b[1] - a[1]});
  for (var i = 0; i < sortable.length; i++) {
    var teamName = sortable[i][0];
    var numberOfVotes = sortable[i][1];
    var percent = Math.round(numberOfVotes / totalVotes * 100);
    appendDisplay(teamName, percent, i);
    var teamProgressBar = $('#' + teamName);
    teamProgressBar.attr('style', 'width:' + percent + '%')
    teamProgressBar.text(percent + '%')
  }
}

/*
 * removeBallots removes all votes attributed to a teamName 
 * from localBallots and from the firebase reference.
 * 
 * teamName - string, name of the team in question
 */
function removeBallots(teamName) {
  for (var key in localBallots) {
    var teamKey = localBallots[key];
    if (teamKey === teamName) {
      delete localBallots[key];
      votes.child(key).remove();
    }
  }
}

$(document).ready(function() {
  // Reference to database
  var voteList = $('<ul>');
  $('#votes').append(voteList);

  /*
   * _________________
   * | Callbacks     |
   * |_______________|
   *
   */

  /*
   * When a team is added, we create a new display for it.
   *
   * Progress bars are initialized to 0%.
   * A team name is given to the progress bar.
   */

  teams.on('child_added', function(snapshot) {
    localTeams[snapshot.name()] = 0;
  });

  /*
   * When a child is removed, we remove the team from display 
   * and every person who voted for that team.
   */
  teams.on('child_removed', function(snapshot) {
    var teamKey = snapshot.name(); 
    totalVotes -= localTeams[teamKey];
    delete localTeams[teamKey];
    removeBallots(teamKey);
    var rowTeam = $('.row.' + teamKey);
    rowTeam.css('display', 'none');
    updateScores();
  });

  /*
   * When we receive a vote, we update a total count, remember
   * who voted, and update the scores.
   */
  votes.on('child_added', function(snapshot) {
    var teamKey = snapshot.val();
    var phoneNumber = snapshot.name();
    teams.child(teamKey).once('value', function(snapshot2) {
      if (snapshot2.val() != null) {
        if(teamKey in localTeams) localTeams[teamKey] += 1;
        else localTeams[teamKey] = 1;
        totalVotes += 1;
        localBallots[phoneNumber] = teamKey;
        updateScores();
      }
    });
  });

  /*
   * When we receive a changed vote, total count remains constant,
   * we update the vote locally, and update the scores. 
   */
  votes.on('child_changed', function(snapshot) {
    var phoneNumber = snapshot.name();
    var newTeamName = snapshot.val();
    var prevTeamName = localBallots[phoneNumber];
    localTeams[prevTeamName] -= 1;
    localBallots[phoneNumber] = newTeamName;
    if (localTeams[newTeamName]) localTeams[newTeamName] += 1;
    else localTeams[newTeamName] = 1;
    updateScores();
  });

  /*
   * When a vote (user) is removed, we remove them from the localStorage.
   *
   * We update the score count, update total scores, and update the score visually.
   */
  votes.on('child_removed', function(snapshot) {
    var prevTeamName = snapshot.val();
    var phoneNumber = snapshot.name();
    teams.child(prevTeamName).once('value', function(snapshot2) {
      if (snapshot2.val() != null) {
        localTeams[prevTeamName] -= 1;
        delete localBallots[phoneNumber];
        totalVotes -= 1;
        updateScores();
      }
    });
  });
});
