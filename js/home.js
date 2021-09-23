function openGame() {
    let boardSize = $('input[name=boardSize]:checked').val();
    main(boardSize);
}

function main(boardSize) {

    $("#menu").fadeOut();


    init_board(boardSize);

    $("#board-table").show();
    draw_board();

    height = parseFloat($("svg").css("height"));

    $("#board-table").css("height", height + "px");
    $("#board-table").css("width", height + height / 2 + "px");
    $("#board-table").css("padding", height / 10 + "px");
    $("#table-menu").css("width", height / 2 + "px");

    draw_pieces();
    play();
}


function play() {
    update_valid_moves();
}

function closeGame() {
    $("#board-table").fadeOut("slow", function () {
        $("#gameBoard").remove();
    })
    $("#menu").fadeIn();
}


function setModalMessage(winner) {
    $("#modal-message").children().remove();
    if (winner == 1) {
        $("#modal-message").append(
            `<p class="center-h">YOU WON!! </p>
            <p class="center-h">Congratulations!</p>`
        )
    } else if (winner == -1) {
        $("#modal-message").append(
            `<p class="center-h">YOU LOST :( </p>
            <p class="center-h">Better luck next time!</p>`
        )
    } else {
        $("#modal-message").append(
            `<p class="center-h">DRAW!! </p>
                <p class="center-h">Max moves exceeded</p>`
        )
    }

    $("#endGameModal").show()
}


function closeModal() {
    $("#endGameModal").hide();
    closeGame();
}


function initEvents() {
    $('#endGameModal').on('click', function (e) {
        if (e.target !== this)
            return;
        closeModal();
    });
}

function updatePiecesDisplayed() {

    $("#nr-your-pieces").text(players_pieces["1"]);
    $("#nr-opponent-pieces").text(players_pieces["-1"]);
}


$(document).ready(function () {
    initEvents();
})