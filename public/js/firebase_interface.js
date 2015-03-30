/*
 * IMPORTS: firebase.js, map_interface.js
 */

var DB = new Firebase('https://hack-vote.firebaseio.com/');

var votes = DB.child("votes");
var teams = DB.child("teams");

var localVotes = {};
var totalVotes = 0;

var localBallots = {};

/*
 * updateScores updates the graphic. This should be called each time
 * the database changes and we want the front-end to reflect the change.
 */
function updateScores() {
  for (var key in localVotes) {
    var nowTeamVotes = localVotes[key];
    var percent = Math.round(nowTeamVotes / totalVotes * 100);
    var teamProgressBar = $('#' + key);
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
  var teamNames = $('#teamNames');
  var teamVotes = $('#teamVotes');
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
    // Progress bar element
    var progressbar = $('<div>');

    // Attributes for the progress bar (Bootstrap)
    var progressAttr =
    {
      'class': 'progress-bar',
      'role': 'progressbar',
      'aria-valuenow': '0',
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'style': 'width:0%'
    }
    progressbar.attr(progressAttr);
    progressbar.append("0%");

    var teamKeyName = snapshot.name();
    var newTeamName = $('<div>');
    newTeamName.attr('class', 'row ' + teamKeyName);
    newTeamName.append(teamKeyName);
    var newTeamVote = $('<div>');
    newTeamVote.attr('class', 'row ' + teamKeyName);
    progressbar.attr('id', teamKeyName);
    newTeamVote.append(progressbar);
    teamNames.append(newTeamName);
    teamVotes.append(newTeamVote);
    updateScores();
  });

  /*
   * When a child is removed, we remove the team from display 
   * and every person who voted for that team.
   */
  teams.on('child_removed', function(snapshot) {
    var teamKey = snapshot.name(); 
    totalVotes -= localVotes[teamKey];
    delete localVotes[teamKey];
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
    teams.child(teamKey).once('value', function(snapshot2) {
      if (snapshot2.val() != null) {
        console.log("op");
        if(teamKey in localVotes) localVotes[teamKey] += 1;
        else localVotes[teamKey] = 1;
        totalVotes += 1;
        localBallots[snapshot.name()] = teamKey;
        updateScores();
      }
    });
  });

  /*
   * When we receive a changed vote, total count remains constant,
   * we update the vote locally, and update the scores. 
   */
  votes.on('child_changed', function(snapshot) {
    var prevTeamName = localBallots[snapshot.name()];
    localVotes[prevTeamName] -= 1;
    localBallots[snapshot.name()] = snapshot.val();
    localVotes[snapshot.val()] += 1;
    updateScores();
  });

  /*
   * When a vote (user) is removed, we remove them from the localStorage.
   *
   * We update the score count, update total scores, and update the score visually.
   */
  votes.on('child_removed', function(snapshot) {
    var prevTeamName = snapshot.val();
    teams.child(prevTeamName).once('value', function(snapshot2) {
      if (snapshot2.val() != null) {
        localVotes[prevTeamName] -= 1;
        delete localBallots[snapshot.name()];
        totalVotes -= 1;
        updateScores();
      }
    });
  });
});
