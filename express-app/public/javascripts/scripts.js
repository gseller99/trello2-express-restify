$('document').ready(function() {
    renderExistingSwimlanes();
   
    $('button').on('click', function() {
        var swimlaneName = prompt('New swimlane name');
        var id = getNewId();
        drawSwimlane(id, swimlaneName);
        saveSwimlane({id: id, name: swimlaneName});   
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
                drawCard(swimlaneId, cards[i].name, cards[i].cardDescription);
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

    newSwimlane.append('<div class="swimlaneHeader">' + name + '</div>');

    var buttons = newSwimlane.append('<div class="buttons"><i class="fas fa-trash-alt icons"></i><i class="fas fa-pencil-alt icons"></i><i class="fas fa-plus icons"></i></div>');

    buttons.on('click', '.fa-trash-alt', function() {
        $(this).closest('.swimlane').remove();

    });    

    buttons.on('click', '.fa-pencil-alt', function() {
        var newName = prompt('Card name replacement').value;
        $('this').closest(".cardHeader").remove();
        $('swimlane').append(newName);
    });

    buttons.on('click', '.fa-plus', function() {
        var cardHeader = prompt('New card name');
        var cardDescription = prompt('New card description');
        var cardId = getNewId();
        drawCard(id, cardHeader, cardDescription);
        //drawCardDescription(id, CardDescription);      
        saveCard({id: cardId, swimlane_id: id, name: cardHeader, cardDescription: cardDescription});
        //save description function needed
    })

    $('#swimlanes').append(newSwimlane);
}

function drawCard(swimlaneId, name, cardDescription) {
    
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

        card.append('<div class="cardHeader">' + name + '</div>')
        var cardButtons = $('<div class="buttons"><i class="fas fa-trash-alt icons"></i><i class="fas fa-pencil-alt icons"></i></div>');
        card.append(cardButtons);
        card.append('<div class="cardDescription">' + cardDescription + '</div>')
        $("#"+ swimlaneId).append(card);

        cardButtons.on('click', '.fa-trash-alt', function() {
            $(this).closest('.card').remove();
        });
    }

    
function saveSwimlane(swimlane) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/swimlanes",
            data: swimlane
        })
        .done(function(swimlane) {
            alert("Swimlane Saved: " + swimlane);
        });
}

function saveCard(card) {
    $.ajax({
            method: "POST",
            url: "http://localhost:8080/cards",
            data: card
        })
        .done(function(card) {
            alert("Card Saved: " + card);
        });
}