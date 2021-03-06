const clientWidth = document.documentElement.clientWidth;
var svg;


function draw_board() {

    boardDimension = nrows
    boxSize = clientWidth / 3 / boardDimension
    boardSize = boardDimension * boxSize
    pieceRadius = boxSize * 0.45
    margin = 0;

    const div = d3.select("#svg-container")
        .append("div")
        .attr("id", "gameBoard")
        .style("float", "left");

    // create <svg>
    svg = div.append("svg")
        .attr("width", boardSize + "px")
        .attr("height", boardSize + "px");

    // loop through 8 rows and 8 columns to draw the chess board
    for (let i = 0; i < nrows; i++) {
        for (let j = 0; j < nrows; j++) {
            // draw each chess field
            const box = svg.append("rect")
                .attr("x", i * boxSize)
                .attr("y", j * boxSize)
                .attr("width", boxSize + "px")
                .attr("height", boxSize + "px");
            if ((i + j) % 2 === 0) {
                box.attr("fill", "rgb(240, 217, 181)");
            } else {
                box.attr("fill", "rgb(181, 136, 99)");
            }
        }
    }
}

function draw_pieces() {
    var circles = []
    flag = false
    for (let index = 0; index < board_coords[0].length; index++) {

        let line = board_coords[0][index]
        let col = board_coords[1][index]
        var board_val = board[line][col]
        if (board_val != 0) {

            let player = (board_val >= 1) ? 1 : -1

            let piece = {
                c: col * boxSize + boxSize / 2,
                l: line * boxSize + boxSize / 2,
                player: player,
                piece_nr: index
            };
            circles.push(piece)

        }
    }

    var g = svg.selectAll("g")
        .data(circles)
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + d.c + ", " + d.l + ")";
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended)
        );


    g.append("circle")
        // .attr("cx", function (d) { return d.c })
        // .attr("cy", function (d) { return d.l })
        .attr("r", pieceRadius)
        .attr("fill", piece_color)
    // .on("mouseover", function (d) { d3.select(this).style("cursor", "move"); })
    // .on("mouseout", function (d) { })

}


function check_for_king(node, row, target) {
    if ((row == target) & (!node.classed("king"))) {

        node.append("image")
            .attr("xlink:href", "img/crown.svg")
            .attr("x", -pieceRadius * 0.5)
            .attr("y", -pieceRadius * 0.5)
            .attr("width", pieceRadius)
            .attr("height", pieceRadius);

        node.classed("king", true)
    }
}


function piece_color(d) {
    if (d.player == 1) return "white"
    return "black"
}

function dragstarted(d) {
    if (piece_movable(d.piece_nr)) {
        d3.select(this).raise().classed("active", true);
    }

}

function get_piece_obj(piece_nr) {
    return d3.selectAll("g").filter(function (d, i) {
        return d.piece_nr === piece_nr;
    });
}


function dragged(d) {
    if (d3.select(this).classed("active"))
        d3.select(this).attr("transform", "translate(" + d3.event.x + ", " + d3.event.y + ")");

}

function move_in_valid_moves(move_to_check) {
    for (let move of valid_moves) {
        if (move[0] == move_to_check[0] & move[1] == move_to_check[1]) return true;
    }
    return false
}

function dragended(d) {
    if (d3.select(this).classed("active")) {

        d3.select(this).classed("active", false);
        let position = coordinates_to_position(d3.event.x, d3.event.y)
        let destination = position_to_nr(position)
        let move = [d.piece_nr, destination]

        if (move_in_valid_moves(move)) {
            let coords = position_to_coords(position)
            node = d3.select(this)

            // node.attr("cx", d.c = coords.c).attr("cy", d.l = coords.l);
            d.c = coords.c
            d.l = coords.l
            node.attr("transform", "translate(" + coords.c + ", " + coords.l + ")");

            check_for_king(node, position.l, 0)

            d.piece_nr = destination
            process_move(move)


        } else {
            d3.select(this).attr("transform", "translate(" + d.c + ", " + d.l + ")");

        }
    }
}


function position_to_nr(coords) {
    for (let index = 0; index < board_coords[0].length; index++) {
        let [l_, c_] = [board_coords[0][index], board_coords[1][index]]
        if (l_ == coords.l & c_ == coords.c) {
            return index
        }
    }
}

function coordinates_to_position(x, y) {
    return {
        c: parseInt(x / boxSize),
        l: parseInt(y / boxSize)
    }
}

function position_to_coords(position) {
    return {
        c: position.c * boxSize + boxSize / 2,
        l: position.l * boxSize + boxSize / 2,
    }
}

function check_double_jump(piece_nr) {
    for (let direction = 0; direction < 4; direction++) {
        let action = [piece_nr, direction]
        if (is_valid_move(action)[1]) {
            return true
        }
    }
    return false
}


function move_piece(move) {
    [piece, destination] = move
    let [p_l, p_c] = nr_to_position(piece)
    let [d_l, d_c] = nr_to_position(destination)

    if (d_l == 0) val = 2;
    else val = get_board_value(piece)


    set_board_value(piece, 0)
    set_board_value(destination, val)
    if (Math.abs(p_c - d_c) == 2) {
        jumped_piece = position_to_nr({ c: (d_c + p_c) / 2, l: (d_l + p_l) / 2 })

        set_board_value(jumped_piece, 0)
        remove_piece(jumped_piece)

        double_jump = check_double_jump(destination)
        if (!double_jump) {
            player_turn = -player_turn
        }
    } else {
        player_turn = -player_turn
    }
    current_moves += 1
}


function reverse_board() {
    board.reverse()
    for (let idx = 0; idx < board.length; idx++) {

        board[idx].reverse();
        board[idx] = board[idx].map(function (d) { return -d })
    }

}

function get_piece_by_nr(piece_nr) {
    return d3.selectAll("g").filter(function (d, i) {
        return d.piece_nr === piece_nr;
    });
}

function remove_piece(piece_nr) {
    if (player_turn == -1) {
        piece_nr = (nrows * nrows / 2) - 1 - piece_nr
        players_pieces["1"] -= 1
    }
    else {
        players_pieces["-1"] -= 1
    }

    get_piece_by_nr(piece_nr).remove()
    updatePiecesDisplayed()
}

async function process_opponent() {
    valid_moves = []
    reverse_board()
    while (player_turn == -1) {
        action = await get_opponent_action()
        move_piece(action)
        move_opponent_piece(action)
    }
    reverse_board()
}

function action_to_move(action) {
    let piece = action % (nrows * nrows / 2)
    let direction = (action - piece) / (nrows * nrows / 2)
    let position = nr_to_position(piece)
    d_l = position[0] + DIRECTIONS[direction][0]
    d_c = position[1] + DIRECTIONS[direction][1]

    let destination_val = piece_value(board, null, d_l, d_c)
    if (destination_val != 0) {
        d_l = d_l + DIRECTIONS[direction][0]
        d_c = d_c + DIRECTIONS[direction][1]

    }

    let destination = position_to_nr({
        l: d_l,
        c: d_c
    })
    return [piece, destination]
}

async function get_opponent_action() {
    try {
        action = await query_agent_api()
        console.log(action, action_to_move(action.action));
        return action_to_move(action.action)

    } catch (error) {
        console.log(error);
        return get_random_action()
    }
}


async function query_agent_api() {
    let action = await fetch(
        ALPHAZERO_ENDPOINT + "move",
        {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ board: board })
        }
    ).then(
        response => {
            if (!response.ok) {
                let action = get_random_action()
                return { action: action }
            }
            return response.json()
        }).then(
            json => {
                console.log(json);
                return json
            }
        )
    return action
}


function get_random_action() {
    update_valid_moves()
    let index = Math.floor(Math.random() * valid_moves.length);
    return valid_moves[index];
}

async function process_move(move) {
    console.log("current_moves", current_moves);
    move_piece(move)

    game_ended = gameEnded()
    if (game_ended[0] == 1) {
        return setModalMessage(game_ended[1])
    }

    await process_opponent()

    game_ended = gameEnded()
    if (game_ended[0] == 1) {
        return setModalMessage(game_ended[1])
    }
    update_valid_moves()
}