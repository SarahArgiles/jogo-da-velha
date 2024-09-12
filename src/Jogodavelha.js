import React, { useState, useEffect } from 'react';
import './Jogodavelha.css';

function Jogodavelha() {
    const emptyBoard = Array(9).fill("");
    const [board, setBoard] = useState(emptyBoard);
    const [playerAtual, setPlayerAtual] = useState ("O");
    const [vencedor, setVencedor] = useState (null);
    const [jogoContraComputador, setJogoContraComputador] = useState(false); // Define o modo de jogo


    const handleCellClick = (index) => {
      if (vencedor) return null;
      if (board[index] !== "") return null;

      // Jogada do jogador atual
      const newBoard = board.map((item, itemIndex) => itemIndex === index ? playerAtual : item);
      setBoard(newBoard);

      if (jogoContraComputador) {
          setPlayerAtual("X");
          setTimeout(() => jogadaComputador(newBoard), 500); // O computador joga após o jogador humano
      } else {
          // Alterna entre dois jogadores
          setPlayerAtual(playerAtual === "X" ? "O" : "X");
      }

    }
    const jogadaComputador = (newBoard) => {
      if (vencedor) return; // Impede que o computador jogue após o jogo acabar

      const emptyIndexes = newBoard.map((item, index) => item === "" ? index : null).filter(val => val !== null);
      if (emptyIndexes.length === 0) return; // Se não houver mais jogadas possíveis

      const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
      const updatedBoard = newBoard.map((item, index) => index === randomIndex ? "X" : item);

      setBoard(updatedBoard);
      setPlayerAtual("O");
  };

    const vitoria = () => {
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
          if(cells.every(cell => cell=== "O")) setVencedor ("O");
          if(cells.every(cell => cell=== "X")) setVencedor ("X");
          
      });
      verificarEmpate();

    }
    const verificarEmpate = () => {
      if (board.every(item => item !== ""))
        //empate
        setVencedor("E");
    
    }
    
    useEffect(vitoria, [board]);
    const resetGame = () => {
      setPlayerAtual("O");
      setBoard(emptyBoard);
      setVencedor(null);
    }

  return (
    
    <main>
      <h1 className='title'>Jogo da velha</h1>
        {/* Botões para escolher o modo de jogo */}
        <div className="mode-buttons">
           <button onClick={() => setJogoContraComputador(true)}>Jogar contra o computador</button>
           <button onClick={() => setJogoContraComputador(false)}>Jogar com 2 jogadores</button>
        </div>
        <div className={`board ${vencedor ? "game-over" : ""}`}>
          {board.map((item, index) => (
            <div key={index} 
            className={`cell ${item}`}
            onClick = {()=>handleCellClick(index)}
            >
              {item}
            </div>
          ))}
          

        </div>
        {vencedor &&
        <footer>
          {vencedor === "E" ?
          <h2> Empatou!</h2>
          : <h2>{vencedor} venceu</h2>
          }
          <button onClick={resetGame}>Recomeçar</button>
          
        </footer>
      }
    </main>
  );
}

export default Jogodavelha;
