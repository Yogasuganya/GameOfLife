import React from 'react';
import Button from 'react-bootstrap/Button';
import './Game.css';

const CELL_SIZE = 10;
const WIDTH = 700;
const HEIGHT = 500;

/* eslint-disable no-unused-vars */

class Cell extends React.Component {
	render() {
		const { x,y } = this.props;

		return(
			<div className = "cell" style = {{ 
				left: `${CELL_SIZE * x + 1}px`,
				top: `${CELL_SIZE * y +1}px`,
				width: `${CELL_SIZE -1}px`,
				height: `${CELL_SIZE -1}px` }} />
		);
	}
}

class Game extends React.Component {
	constructor() {
		super();
		this.rows = HEIGHT / CELL_SIZE;
		this.cols = WIDTH / CELL_SIZE;
		this.board = this.makeEmptyBoard();
	}

	state = {
		cells: [],
		generation: 0,
        isRunning: false,
        interval: 300
	}

	makeEmptyBoard() {

		let board = [];
		for (let y = 0 ; y < this.rows; y++) {
			board[y] = [];
			for (let x = 0; x < this.cols; x++) {
				board[y][x] = false;
			}
		}
		return board;
	}

	makeCells() {
		let cells = [];
		for (let y = 0 ; y < this.rows; y++) {
			for (let x = 0; x < this.cols; x++) {
				if(this.board[y][x]) {
					cells.push({ x, y});
				}
			}
		}
		return cells;
	}

	getElementOffset(){
		const rect = this.boardRef.getBoundingClientRect();
		const doc = document.documentElement;

		return {
			x: (rect.left + window.pageXOffset) - doc.clientLeft,
			y: (rect.top + window.pageYOffset) - doc.clientTop
		};
	}

	handleClick = (event) => {
		const elementOffset = this.getElementOffset();
		const offsetX = event.clientX - elementOffset.x;
		const offsetY = event.clientY - elementOffset.y;

		const x = Math.floor(offsetX / CELL_SIZE);
		const y = Math.floor(offsetY / CELL_SIZE);

		if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
			this.board[y][x] = !this.board[y][x];
		}

		this.setState({
			cells: this.makeCells()
		});
	}

	runGame = () => {
		if(this.makeCells().length === 0){
			this.randomGame();
		}
		this.setState({ isRunning: true });
		this.runIteration();
	}

	stopGame = () => {
		this.setState({ isRunning: false });
		if(this.timeoutHandler) {
			window.clearTimeout(this.timeoutHandler);
			this.timeoutHandler = null;
		}
	}

	runIteration() {
		
		let newBoard = this.makeEmptyBoard();
		let newCells  = this.state.cells;

		for (let y = 0; y < this.rows; y++){
			for(let x =0 ; x < this.cols; x++) {
				let neighbors = this.calculateNeighbors(this.board , x, y);
				if (this.board[y][x]) {
					if (neighbors === 2 || neighbors === 3){
						newBoard[y][x] = true;
					} else {
						newBoard[y][x] = false;
					}
				} else {
					if (!this.board[y][x] && neighbors === 3) {
						newBoard[y][x] = true;
					}
				}
			}
		}
		let newGeneration = this.state.generation + 1;
		this.board = newBoard;
		this.setState({ cells: this.makeCells() , generation: newGeneration });
		
		this.timeoutHandler = window.setTimeout( () => {

			this.runIteration();
			if(JSON.stringify(newCells) === JSON.stringify(this.state.cells)){
				this.stopGame();
			}
			
		}, this.state.interval);
	}

	calculateNeighbors(board, x, y) {
		let neighbors = 0;

		const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0,-1]];
		for(let i = 0; i < dirs.length; i++) {
			const dir = dirs[i];
			let y1 = y + dir[0];
			let x1 = x + dir[1];

			if ( x1 >= 0 && x1 < this.cols && y1 >= 0 && y1 < this.rows && board[y1][x1]) {
				neighbors ++;
			}
		}

		return neighbors;
	}

	handleIntervalChange = (event) => {
		this.setState({ interval: event.target.value });
	}

	clearGame = () => {
		this.stopGame();
        this.board = this.makeEmptyBoard();
        this.setState({ cells: this.makeCells() , generation: 0 });
    }

    handleRandom = () => {
        this.randomGame();
        this.runGame();
    }

    randomGame() {
    	for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.board[y][x] = (Math.random() >= 0.5);
            }
        }

        this.setState({ cells: this.makeCells() });
    }

	render() {
		const { cells, interval, isRunning, generation } = this.state;

		return (

			<div className = "boardalign">
				<div className = "controls">
					<div className = "lCell">
						<h5>Generation </h5>
                    	<div className = "count"> {this.state.generation} </div>
                    	<h5>Live cells </h5>
                    	<div className = "count"> {this.makeCells().length} </div>
                    </div>
					<div>
						{isRunning ? <Button variant="danger" className = "button" onClick = {this.stopGame} block>Stop</Button> :
						<Button variant="dark" className = "button" onClick = {this.runGame} block>Run</Button> }
					</div>
					<div>
						<Button variant="dark" className="button" onClick={this.handleRandom} block>Random</Button>
					</div>
					<div>
                    	<Button variant="dark" className="button" onClick={this.clearGame} block>Clear</Button>
                    </div>
				</div>
				<div className = "board" style = { { width: WIDTH, height: HEIGHT, 
					backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px` }} 
				 onClick = {this.handleClick} ref = { (n) => { this.boardRef = n; }} >
				 { cells.map (cell => ( 
				 		< Cell x = { cell.x } y = { cell.y } key = { `${cell.x}, ${cell.y}`} /> 
				 ))}
				 
				</div>
			</div>
		);
	}
}

export default Game;