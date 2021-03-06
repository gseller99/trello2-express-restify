$('document').ready(function() {
    renderExistingSwimlanes();
   
    $('button').on('click', function() {
        var swimlaneName = prompt('New swimlane name');
        var id = saveSwimlane({name: swimlaneName}); 
        drawSwimlane(id, swimlaneName);  
    });
});

var newSwimlane;
// var swimlaneNumber;
// var idSwimlane;

function renderExistingSwimlanes() {
    $.ajax({
            method: "GET",
            url: "http://localhost:8080/swimlanes",

        })
        .done(function(swimlanes) {
            console.log(swimlanes);

            for (var i = 0; i < swimlanes.length; i++) {
                var swimlane = swimlanes[i];
                drawSwimlane(swimlane.id, swimlane.name);

                
                // Get cards for swimlane by swimlaneID
                renderExistingCards(swimlane.id);
            }
        });
}

function renderExistingCards(swimlaneId) {
    $.ajax({
            method: "GET",
            url: 'http://localhost:8080/swimlanes/' + swimlaneId + '/cards',

        })
        .done(function(cards) {
            console.log(cards);

            for (var i = 0; i < cards.length; i++) {
                drawCard(swimlaneId, cards[i].name, cards[i].cardDescription, cards[i].id);
            }
        });
}

function getNewId(){
    var date = new Date();
    var id = date.getTime();

    console.log(id);

    return id;
}

function drawSwimlane(id, name) {
    newSwimlane = $('<div id="' + id +'" class="swimlane"></div>');

    newSwimlane.draggable({
        start: function() {
            $(this).css("zIndex", 100);
        }
    });
    newSwimlane.droppable({
        drop: function(event, ui) {
            var otherSwimlane = ui.draggable;
            var thisSwimlane = $(this);

            otherSwimlane.detach();
            otherSwimlane.insertAfter(thisSwimlane);
            otherSwimlane.css("zIndex", 0);
        }
    });
    var swimlaneHeader = $('<div class="swimlaneHeader">' + name + '</div>');

    newSwimlane.append(swimlaneHeader);
  
    var buttons = $('<div class="buttons"><i class="fas fa-trash-alt icons"></i><i class="fas fa-pencil-alt icons"></i><i class="fas fa-plus icons"></i></div>');

    newSwimlane.append(buttons);

    buttons.on('click', '.fa-trash-alt', function() {
        $(this).closest('.swimlane').remove();

    });

    buttons.on('click', '.fa-pencil-alt', function() {
      var newName = prompt('New swimlane name');
      swimlaneHeader.text(newName);  
      updateSwimlane(id,newName);
    });

    buttons.on('click', '.fa-plus', function() {
        var cardHeader = prompt('New card name');
        var cardDescription = prompt('New card description');
        var cardId = getNewId();
        drawCard(id, cardHeader, cardDescription, cardId);
        //drawCardDescription(id, CardDescription);      
        saveCard({id: cardId, swimlaneId: id, name: cardHeader, cardDescription: cardDescription});
        //save description function needed
    })

    $('#swimlanes').append(newSwimlane);
}

function drawCard(swimlaneId, name, cardDescription, card_id) {
    
        var card = $('<div class="card"></div>');

        card.draggable();
        card.droppable({
            drop: function(event, ui) {
                var otherCard = ui.draggable;
                var thisCard = $(this);

                otherCard.detach();
                otherCard.insertBefore(thisCard);
            }
        });

        var cardHeader = $('<div class="cardHeader">' + name + '</div>');
        card.append(cardHeader);
        var cardButtons = $('<div class="buttons"><i class="fas fa-trash-alt icons"></i><i class="fas cardHeaderEdit fa-pencil-alt icons"></i></div>');
        card.append(cardButtons);
        card.append('<div class="cardDescription">' + cardDescription + '</div>')
        $("#"+ swimlaneId).append(card);

        cardButtons.on('click', '.fa-trash-alt', function() {
            $(this).closest('.card').remove();
        });
        
        cardButtons.on('click', '.cardHeaderEdit', function() {
        var newName = prompt('Card name replacement');
        cardHeader.text(newName);
        updateCardName(card_id, newName);
    });
    }

function saveSwimlane(swimlane) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/swimlanes",
            data: swimlane
        })
        .done(function(swimlane) {
            alert("Swimlane Saved: " + swimlane.id);
            return swimlane.id;
        });
}

function updateSwimlane(id, name) {
  $.ajax({
            method: "POST",
            url: "http://localhost:8080/swimlanes/" + id,
            data: {name: name}
        })
        .done(function(swimlane) {
            alert("Swimlane Update: " + swimlane);
        });  
}

function updateCardName(id, name) {
  $.ajax({
            method: "POST",
            url: "http://localhost:8080/swimlanes/cards/" + id,
            data: {name: name}
        })
        .done(function(card) {
            alert("Card Update: " + card);
        });  
}

function saveCard(card) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/cards",
            data: card,
            datatype: 'json'
        })
        .done(function(card) {
            alert("Card Saved: " + card);
        });
}