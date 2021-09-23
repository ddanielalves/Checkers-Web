const DIRECTIONS = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
];

var board_coords;
var board;
var player_turn;
var valid_moves = [];
var nrows;
var total_pieces;
var players_pieces;
var current_moves;
var max_moves;


function init_board_8() {
    max_moves = 100;

    total_pieces = 12;
    players_pieces = {
        "1": total_pieces, "-1": total_pieces
    }

    board = [
        [0, -1, 0, -1, 0, -1, 0, -1],
        [-1, 0, -1, 0, -1, 0, -1, 0],
        [0, -1, 0, -1, 0, -1, 0, -1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0],
    ];

    board_coords = [
        [
            0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
            6, 6, 6, 6, 7, 7, 7, 7,
        ],
        [
            1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7, 0, 2, 4, 6,
            1, 3, 5, 7, 0, 2, 4, 6,
        ],
    ];
}


function init_board_6() {
    max_moves = 60;

    total_pieces = 6;
    players_pieces = { "1": total_pieces, "-1": total_pieces }

    board = [
        [0, -1, 0, -1, 0, -1],
        [-1, 0, -1, 0, -1, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0],
    ];
    board_coords = [
        [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5],
        [1, 3, 5, 0, 2, 4, 1, 3, 5, 0, 2, 4, 1, 3, 5, 0, 2, 4]
    ];
}


function init_board_4() {
    max_moves = 20
    total_pieces = 2;
    players_pieces = { "1": total_pieces, "-1": total_pieces }

    board = [
        [0, -1, 0, -1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 0, 1, 0],
    ];
    board_coords = [
        [0, 0, 1, 1, 2, 2, 3, 3],
        [1, 3, 0, 2, 1, 3, 0, 2]
    ];
}

function init_board(nrows_, board_) {
    player_turn = 1;
    current_moves = 0;
    nrows = nrows_;

    if (board_) {
        board = board_;
        return;
    }

    if (!(nrows) | (nrows == 8)) init_board_8()

    if (nrows == 6) init_board_6()

    if (nrows == 4) init_board_4()

    updatePiecesDisplayed()
}

function update_valid_moves() {
    valid_moves = [];
    let jump_moves = [];
    let directions = [0, 1, 2, 3];
    for (let piece = 0; piece < nrows * nrows / 2; piece++) {
        for (let direction in directions) {
            action = [piece, direction];

            [valid, jump, destination] = is_valid_move(action);

            if (valid) {
                if (jump) jump_moves.push([piece, destination]);
                else valid_moves.push([piece, destination]);
            }
        }
    }
    if (jump_moves.length > 0) valid_moves = jump_moves;
}

function piece_movable(piece) {
    if (player_turn == -1) return false;
    for (let move of valid_moves) {
        if (move[0] == piece) return true;
    }
    return false;
}
function move_piece_obj(piece, destination) {
    let position = nr_to_position(destination);
    let coords = position_to_coords({ l: position[0], c: position[1] });

    piece.attr("transform", "translate(" + coords.c + ", " + coords.l + ")");

    piece.data([{
        c: coords.c,
        l: coords.l,
        piece_nr: destination
    }])
    console.log(destination);
    check_for_king(piece, position[0], parseInt(nrows) - 1)
}

function move_opponent_piece(move) {
    piece_nr = nrows * nrows / 2 - 1 - move[0]
    destination = nrows * nrows / 2 - 1 - move[1]

    let piece = get_piece_by_nr(piece_nr)
    move_piece_obj(piece, destination);
}

function set_board_value(nr, value) {
    let [l, c] = nr_to_position(nr);
    board[l][c] = value;
}

function get_board_value(nr) {
    let [l, c] = nr_to_position(nr);
    return board[l][c];
}

function nr_to_position(nr) {
    return [board_coords[0][nr], board_coords[1][nr]];
}
function piece_value(board, piece_nr, l, c) {
    if (piece_nr != null) [l, c] = nr_to_position(piece_nr);
    return board[l][c];
}

function valid_position(l, c) {
    if (l < 0 || l >= nrows) return false;
    if (c < 0 || c >= nrows) return false;

    return true;
}

function is_valid_move(action) {
    let [piece, direction] = action;

    let dir_vector = DIRECTIONS[direction];

    if (piece < 0 || piece > nrows * nrows / 2) return [false, false];

    if (direction < 0 || direction > 4) return [false, false];

    value = piece_value(board, piece);

    if (value <= 0) return [false, false];

    king = value == 2;
    if ((dir_vector[0] == 1) & !king) return [false, false];

    [l, c] = nr_to_position(piece);

    [l_m, c_m] = [l + dir_vector[0], c + dir_vector[1]];

    if (!valid_position(l_m, c_m)) return [false, false];

    move_value = piece_value(board, null, l_m, c_m);
    if (move_value == 0) {
        nr = position_to_nr({ l: l_m, c: c_m });
        return [true, false, nr];
    }
    if (move_value > 0) return [false, false];

    [l_m, c_m] = [l_m + dir_vector[0], c_m + dir_vector[1]];
    if (!valid_position(l_m, c_m)) return [false, false];

    move_value = piece_value(board, null, l_m, c_m);

    if (move_value == 0) {
        nr = position_to_nr({ l: l_m, c: c_m });
        return [true, true, nr];
    }
    return [false, false];
}


function gameEnded() {
    if (players_pieces["1"] <= 0) return [1, -1];
    if (players_pieces["-1"] <= 0) return [1, 1];
    if (current_moves >= max_moves) return [1, 0];
    return [0, 0];

}