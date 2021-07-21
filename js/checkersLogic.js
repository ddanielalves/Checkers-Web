const DIRECTIONS = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
];
const board_coords = [
    [
        0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5,
        6, 6, 6, 6, 7, 7, 7, 7,
    ],
    [
        1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7, 0, 2, 4, 6,
        1, 3, 5, 7, 0, 2, 4, 6,
    ],
];

var board;
var player_turn = 1;
var valid_moves = [];

function init_board(board_) {
    if (board_) {
        board = board_;
        return;
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
}

function update_valid_moves() {
    valid_moves = [];
    let jump_moves = [];
    let directions = [0, 1, 2, 3];
    for (let piece = 0; piece < 32; piece++) {
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

    piece.attr("cx", coords.c).attr("cy", coords.l);

    piece.data([{
        c: coords.c,
        l: coords.l,
        piece_nr: destination
    }])
}

function move_opponent_piece(move) {
    piece_nr = 31 - move[0]
    destination = 31 - move[1]

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
    if (l < 0 || l >= 8) return false;
    if (c < 0 || c >= 8) return false;

    return true;
}

function is_valid_move(action) {
    let [piece, direction] = action;

    let dir_vector = DIRECTIONS[direction];

    if (piece < 0 || piece > 32) return [false, false];

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
