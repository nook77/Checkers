var squares = function() {
}

squares.isEmpty = function(col, row, board) {
	//console.log(col + "_" + row);
	if (board[col][row] === 'empty') {
		return true;
	} else {
		return false;
	}
}

squares.isOccupiedBy = function(col, row) {
	if (game.board[col][row] === 'empty') {
		return false;
	} else {
		game.board[col][row];
	}
}

squares.getCol = function(coords) {
	var col = coords.match(/^s?(.*?)_/);
	return col[1];
}

squares.getRow = function(coords) {
	var row = coords.match(/_(.*?)$/);
	return row[1];
}

//take a square object like {col:3,row:4} and returns s3_4
squares.getSquareId = function(square) {
	return 's'+square.col+'_'+square.row;
}

squares.getNextSquareInDirection = function(coords, direction) {
	var col = coords.col;
	var row = coords.row;
	
	if (direction.match(/n/)) {
		row--;
	} 
	
	if (direction.match(/e/)) {
		col++;
	} 
	
	if (direction.match(/s/)) {
		row++;
	} 
	
	if (direction.match(/w/)) {
		col--;
	} 
	
	if (col >= 0 && col < game.cols && row >= 0 && row < game.rows) {
		return {col:col,row:row};
	} else {
		return false;
	}
}

/*
squares.findOccupiedSquares = function(startCol, startRow, player, board) {

	for(var col = startCol;col<game.cols;col++){
		for(var row = startRow;row<game.rows;row++){
			if (board[col][row] !== 'empty') {
				if (board[col][row] === player) {
					return col + "_" + row;
				}
			}
		}
	}
}
*/
squares.getNumOfConnections = function(player,board) {
	var square;
	var nextSquare;
	var col;
	var row;
	var nCol;
	var nRow;
	var emptyRow;
	var numOfConnections = 0;
	//console.log("in getNumOfConnection");
	//console.log("player: " + player);
	var playerSquares = squares.getPlayerSquares(player,board);
	while (playerSquares.length > 0) {
		currentSquare = playerSquares[0];
		//console.log("currentSquare: " + currentSquare);
		for (var i = 0; i<game.directionsArray.length; i++) {
			if (nextSquare = squares.getNextSquareInDirection(currentSquare,game.directionsArray[i])) {
				if (squares.areCoordsInArray(nextSquare,playerSquares)) {
					numOfConnections++;
				}
			}
		}
		playerSquares.shift();
	}
	//console.log("numOfConnection: " + numOfConnections);
	return numOfConnections;
}
/*		
	
	for (var i=0; i<playerSquares.length; i++) {
		currentSquare = playerSquares[i];
		if (nextSquare = squares.getNextSquareInDirection(currentSquare,'n')) {
			if (nextSquare && board[nextSquare.col][nextSquare.row] === "empty") {
				numOfConnections++;
			} 
		}
		if (nextSquare = squares.getNextSquareInDirection(currentSquare,'e')) {
			emptyRow = squares.findEmptyRow(nextSquare.col,board);
			if (emptyRow <= (currentSquare.row + 1) && emptyRow >= (currentSquare.row - 1)) {
					numOfConnections++;
			} 
		}
		if (nextSquare = squares.getNextSquareInDirection(currentSquare,'w')) {
			emptyRow = squares.findEmptyRow(nextSquare.col,board);
			if (emptyRow <= (currentSquare.row + 1) && emptyRow >= (currentSquare.row - 1)) {
				numOfConnections++;
			} 
		}
	}
	return numOfOpenConnections;
}
*/
squares.getNumOfOpenConnections = function(player,board) {
	var square;
	var nextSquare;
	var col;
	var row;
	var nCol;
	var nRow;
	var emptyRow;
	var numOfOpenConnections = 0;
	
	var playerSquares = squares.getPlayerSquares(player,board);
	
	for (var i=0; i<playerSquares.length; i++) {
		currentSquare = playerSquares[i];
		if (nextSquare = squares.getNextSquareInDirection(currentSquare,'n')) {
			if (nextSquare && board[nextSquare.col][nextSquare.row] === "empty") {
				numOfOpenConnections++;
			} 
		}
		if (nextSquare = squares.getNextSquareInDirection(currentSquare,'e')) {
			emptyRow = squares.findEmptyRow(nextSquare.col,board);
			if (emptyRow <= (currentSquare.row + 1) && emptyRow >= (currentSquare.row - 1)) {
					numOfOpenConnections++;
			} 
		}
		if (nextSquare = squares.getNextSquareInDirection(currentSquare,'w')) {
			emptyRow = squares.findEmptyRow(nextSquare.col,board);
			if (emptyRow <= (currentSquare.row + 1) && emptyRow >= (currentSquare.row - 1)) {
				numOfOpenConnections++;
			} 
		}
	}
	return numOfOpenConnections;
}

squares.findConnectionsInDirection = function(coords,board,player,dir) {
	var connections = 0;
	var nextSquare = squares.getNextSquareInDirection(coords, dir);
	
	while (nextSquare) {
		if (board[nextSquare.col][nextSquare.row] == player) {
		//if (squares.areCoordsInArray(nextSquare, playerSquares)) {
			connections++;
			nextSquare = squares.getNextSquareInDirection(nextSquare, dir);
		} else {
			nextSquare = "";
		}
	}
	return connections+1;
}

squares.areCoordsInArray = function(coords, arr) {
	for (var i = 0; i < arr.length; i++) {
		//var  = playerSquares[i];
		//var col = square.col;
		//var row = square.row;
		
		if (arr[i].col == coords.col && arr[i].row == coords.row) {
			return true;
		} 
	}
	return false;
}

squares.addPiece = function(coords,pieceId,board) {
	var col = coords.col;
	var row = coords.row;
	board[col][row] = pieceId;
	return board;
}

squares.removePiece = function(coords,board) {
	var col = coords.col;
	var row = coords.row;
	board[col][row] = "empty";
	return board;
}

squares.getPlayerSquares = function(player,board) {
	var playerSquares = [];
	
	for (var col = 0;col<game.cols;col++) {
		for (var row = 0;row<game.rows;row++) {
			if (board[col][row] === player) {
				playerSquares.push({col:col,row:row});
			}
		}
	}
	return playerSquares;
}