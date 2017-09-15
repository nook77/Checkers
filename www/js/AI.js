var AI = function(level) {
	
	//this.level = level;
	this.level = 2;
}

AI.chooseMove = function(turn,state) {
	//var openSquares = game.state.availableMoves();
	
    var moves = state.availableMoves().map(function(move) {
        
        //create a new state in which we will add the new piece into
        var nextState = new State(state);
		
		//adding the new piece to the new state
		nextState.board = squares.addPiece(move.newSquare,move.pieceId,nextState.board);
		nextState.board = squares.removePiece(move.currentSquare,nextState.board);
		nextState.numOfMoves++;
		nextState.changeTurn();
        move.minimaxVal = game.getMinimaxVal(nextState, this.level);
		move.nextState = nextState;
        return move;
    });
    
    var count = 0;
    moves.forEach(function(move) {
    	console.log(count + ": " + move.minimaxVal);
    	count++;
    });

    //sort the enumerated actions list by score
	if (turn === "pOne") {
		moves.sort(AI.sortDescending);
	} else {
		moves.sort(AI.sortAscending);
	}
	
	//check to see if there are moves with duplicate scores. If so, choose a random move from those
	var sameScores = new Array;
	sameScores.push(moves[0]);
	for (var i=1; i<moves.length; i++) {
		if (moves[i].minimaxVal === moves[0].minimaxVal) {
			sameScores.push(moves[i]);
		}
	}
	
	var index = Math.floor(Math.random()*sameScores.length);
	var chosenMove = moves[index];
	
	var pieceId = moves[index].pieceId;
	var currentSquare = moves[index].currentSquare;
	var newSquare = moves[index].newSquare;
	
	
    var nextState = chosenMove.nextState;
    AI.movePiece(chosenMove);
	//gameView.renderPiece(chosenMove.currentSquare, turn, nextState)
	
    // take the game to the next state
    //game.updateState(nextState);
    //game.pieces[move.pieceId].inSquare = move.newSquare;
    //game.disablePlayersPieces(game.state.playerTurn);
    
    //game.activateArrows();
}

AI.movePiece = function(move) {
	
	var top = 0;
	var left = 0;	
	var direction = move.direction;

	if (direction.match(/n/)) {
		top = top-75;
	} 
	
	if (direction.match(/e/)) {
		left = left+75;
	} 
	
	if (direction.match(/s/)) {
		top = top+75;
	} 
	
	if (direction.match(/w/)) {
		left = left - 75;
	} 
	
	if (move.jumpedSquare) {
		top = top*2;
		left = left*2;
	}
	
    $('#'+move.pieceId).css({"z-index": 1});
    $('#'+move.pieceId).animate({"top":top+"px", "left":left+"px"}, 1000, function() {
    	$(document).trigger("pieceDropped", [move.pieceId,move.newSquare]);
    });
}

AI.sortAscending = function(a, b) {
    if (a.minimaxVal < b.minimaxVal) {
        return -1;
    } else if (a.minimaxVal > b.minimaxVal) {
        return 1;
    } else {
        return 0;
    }
}

AI.sortDescending = function(a, b) {
    if (a.minimaxVal > b.minimaxVal) {
        return -1;
    } else if (a.minimaxVal < b.minimaxVal) {
        return 1;
    } else {
        return 0;
    }
}