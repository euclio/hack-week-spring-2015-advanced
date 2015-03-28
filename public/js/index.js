$(document).ready(function() {
    var firebase = new Firebase('https://hack-vote.firebaseio.com/');

    var voteList = $('<ul>');
    $('#votes').append(voteList);

    firebase.child('votes').on('child_added', function(snapshot) {
        voteList.append(
            $('<li>').append(
                JSON.stringify(snapshot.val())));
    });
});

