var Board = function(board) {
	
	if (typeof board === "undefined") {
		for(var col = 0;col<game.cols;col++){
			this[col] = new Array();
			for(var row = 0;row<game.rows;row++){
				this[col][row] = "empty";
			}
		}
	} else {
		for(var col = 0;col<game.cols;col++){
			this[col] = new Array();
			for(var row = 0;row<game.rows;row++){
				this[col][row] = board[col][row];
			}
		}
	}
}
/*	
	this.render = function() {
		
		if ($('#'+this.stopId).length === 0) {
			stopView.createStop(this.stopId,this.topPosition,this.leftPosition);
			
			var name = this.name;
			if (this.nameAlt) {
				name = this.nameAlt[Game.getCurrentLine()];
			} 
			
			var namePosition = "right";
			if (this.namePosition) {
				position = this.namePosition[Game.getCurrentLine()];
			} 
			
			stopView.createStopName(this.stopId + "_name",name,this.topPosition,this.leftPosition,namePosition,this.nameWidth);
		}
	}
	
	this.renderStopNames = function() {
		if ($('#'+this.stopId + "_name").length === 0) {
		
		}
	}
}
*/