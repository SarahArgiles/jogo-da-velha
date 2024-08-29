import React, { useState, useEffect } from 'react';
import './Jogodavelha.css';

function Jogodavelha() {
    const emptyBoard = Array(9).fill("");
    const [board, setBoard] = useState(emptyBoard);
    const [playerAtual, setPlayerAtual] = useState ("O");
    const handleCellClick = (index) => {
      if(board[index]!=="") return null; 
      setBoard(board.map((item, itemIndex) => itemIndex === index ?  playerAtual : item));
      //vai mudar apenas o elemento clicado, ou seja o item clicado, deixando os outros com valor original
      setPlayerAtual(playerAtual === "X" ? "O" : "X");
      //se o jogador atual é o X eu quero retornar o O, se dor a letra O eu quero retornar o X

    }
    const vencedor = () => {
      const ways =[
        //maneiras de vencer
        [board[0], board[1], board[2]],
        [board[3], board[4], board[5]],
        [board[6], board[7], board[8]],

        [board[0], board[3], board[6]],
        [board[1], board[4], board[7]],
        [board[2], board[5], board[8]],

        [board[0], board[4], board[8]],
        [board[2], board[4], board[6]],
      ];
      ways.forEach(cells => {
          if(cells.every(cell => cell=== "O")) console.log ("o O venceu");
          if(cells.every(cell => cell=== "X")) console.log ("o X venceu");
      });
    }
    useEffect(vencedor, [board]);

  return (
    
    <main>
      <h1 className='title'>Jogo da velha</h1>
        <div className='board'>
          {board.map((item, index) => (
            <div key={index} 
            className={`cell ${item}`}
            onClick = {()=>handleCellClick(index)}
            >
              {item}
            </div>
          ))}
          

        </div>
    </main>
  );
}

export default Jogodavelha;
