import React, { useState, useEffect } from 'react';
import './Jogodavelha.css';
import './tailw.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

function Jogodavelha() {
  // Estado inicial do tabuleiro, preenchido com strings vazias
  const emptyBoard = Array(9).fill("");

  // Estados para gerenciar o tabuleiro, o jogador atual, o vencedor, o modo de jogo e a dificuldade
  const [board, setBoard] = useState(() => {
    const savedBoard = localStorage.getItem("board");
    return savedBoard ? JSON.parse(savedBoard) : emptyBoard;
  });

  const [playerAtual, setPlayerAtual] = useState(() => {
    const savedPlayer = localStorage.getItem("playerAtual");
    return savedPlayer || "O";
  });

  const [vencedor, setVencedor] = useState(() => {
    const savedVencedor = localStorage.getItem("vencedor");
    return savedVencedor !== "null" ? savedVencedor : null;
  });

  const [jogoContraComputador, setJogoContraComputador] = useState(() => {
    const savedModo = localStorage.getItem("jogoContraComputador");
    return savedModo ? JSON.parse(savedModo) : false;
  });

  const [dificuldade, setDificuldade] = useState(() => {
    const savedDificuldade = localStorage.getItem("dificuldade");
    return savedDificuldade || "Fácil";
  });

  const [placar, setPlacar] = useState(() => {
    const savedPlacar = localStorage.getItem("placar");
    return savedPlacar ? JSON.parse(savedPlacar) : { vitoria: 0, derrota: 0, empate: 0 };
  });

  // Estado e funções para controlar a reprodução de áudio
  const [audio] = useState(new Audio(process.env.PUBLIC_URL + '/musicamario.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayPause = () => {
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Função que é chamada quando uma célula é clicada
  const handleCellClick = (index) => {
    // Verifica se o jogo já acabou ou se a célula já está preenchida
    if (vencedor || board[index] !== "") return;

    // Atualiza o tabuleiro com o movimento do jogador atual
    const newBoard = board.map((item, itemIndex) => itemIndex === index ? playerAtual : item);
    setBoard(newBoard);

    // Verifica se há um vencedor
    const result = vitoria(newBoard);

    if (result) {
      setVencedor(result);
      atualizarPlacar(result); // Atualiza o placar com o resultado
      return;
    }

    // Se estiver jogando contra o computador e for a vez do jogador "O", faz o movimento do computador
    if (jogoContraComputador && playerAtual === "O") {
      setPlayerAtual("X");
      setTimeout(() => jogadaComputador(newBoard), 500);
    } else {
      // Alterna o jogador atual
      setPlayerAtual(playerAtual === "X" ? "O" : "X");
    }
  };

  // Função que faz a jogada do computador
  const jogadaComputador = (newBoard) => {
    if (vencedor) return;

    let bestMove;
    if (dificuldade === "Fácil") {
      const emptyIndexes = newBoard.map((item, index) => item === "" ? index : null).filter(val => val !== null);
      if (emptyIndexes.length === 0) return;
      bestMove = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    } else {
      bestMove = melhorJogada(newBoard);
    }

    const updatedBoard = newBoard.map((item, index) => index === bestMove ? "X" : item);
    setBoard(updatedBoard);

    const result = vitoria(updatedBoard);
    if (result) {
      setVencedor(result);
      atualizarPlacar(result); // Atualiza o placar com o resultado
    } else {
      setPlayerAtual("O");
    }
  };

  // Função para determinar a melhor jogada do computador usando o algoritmo Minimax
  const melhorJogada = (boardToCheck) => {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < boardToCheck.length; i++) {
      if (boardToCheck[i] === "") {
        boardToCheck[i] = "X";
        let score = minimax(boardToCheck, 0, false);
        boardToCheck[i] = "";
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    return move;
  };

  // Algoritmo Minimax para avaliar a melhor jogada
  const minimax = (boardToCheck, depth, isMaximizing) => {
    const result = vitoria(boardToCheck);
    if (result === "X") return 10 - depth;
    if (result === "O") return depth - 10;
    if (verificarEmpate(boardToCheck)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < boardToCheck.length; i++) {
        if (boardToCheck[i] === "") {
          boardToCheck[i] = "X";
          let score = minimax(boardToCheck, depth + 1, false);
          boardToCheck[i] = "";
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < boardToCheck.length; i++) {
        if (boardToCheck[i] === "") {
          boardToCheck[i] = "O";
          let score = minimax(boardToCheck, depth + 1, true);
          boardToCheck[i] = "";
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  // Função para verificar o vencedor do jogo
  const vitoria = (boardToCheck) => {
    const ways = [
      [boardToCheck[0], boardToCheck[1], boardToCheck[2]],
      [boardToCheck[3], boardToCheck[4], boardToCheck[5]],
      [boardToCheck[6], boardToCheck[7], boardToCheck[8]],
      [boardToCheck[0], boardToCheck[3], boardToCheck[6]],
      [boardToCheck[1], boardToCheck[4], boardToCheck[7]],
      [boardToCheck[2], boardToCheck[5], boardToCheck[8]],
      [boardToCheck[0], boardToCheck[4], boardToCheck[8]],
      [boardToCheck[2], boardToCheck[4], boardToCheck[6]],
    ];

    for (const cells of ways) {
      if (cells.every(cell => cell === "O")) return "O";
      if (cells.every(cell => cell === "X")) return "X";
    }

    return null;
  };

  // Função para verificar se houve empate
  const verificarEmpate = (boardToCheck) => {
    return boardToCheck.every(item => item !== "") ? "E" : null;
  };

  // Atualiza o placar de acordo com o resultado
  const atualizarPlacar = (resultado) => {
    setPlacar(prevPlacar => {
      const novoPlacar = { ...prevPlacar };
      if (resultado === "E") {
        novoPlacar.empate += 1;
      } else if (resultado === "O") {
        novoPlacar.vitoria += 1;
      } else if (resultado === "X") {
        novoPlacar.derrota += 1;
      }
      localStorage.setItem("placar", JSON.stringify(novoPlacar));
      return novoPlacar;
    });
  };

  // Função para resetar o placar
  const resetPlacar = () => {
    setPlacar({ vitoria: 0, derrota: 0, empate: 0 });
    localStorage.setItem("placar", JSON.stringify({ vitoria: 0, derrota: 0, empate: 0 }));
  };

  // Efeito para verificar vitória ou empate quando o tabuleiro é atualizado
  useEffect(() => {
    const result = vitoria(board);
    if (result) {
      setVencedor(result);
      atualizarPlacar(result); // Atualiza o placar com o resultado
    } else {
      const empate = verificarEmpate(board);
      if (empate) {
        setVencedor(empate);
        atualizarPlacar(empate); // Atualiza o placar com o resultado
      }
    }
  }, [board]);

  // Efeito para salvar o estado atual no localStorage
  useEffect(() => {
    localStorage.setItem("board", JSON.stringify(board));
    localStorage.setItem("playerAtual", playerAtual);
    localStorage.setItem("vencedor", vencedor);
    localStorage.setItem("jogoContraComputador", JSON.stringify(jogoContraComputador));
    localStorage.setItem("dificuldade", dificuldade);
    localStorage.setItem("placar", JSON.stringify(placar));
  }, [board, playerAtual, vencedor, jogoContraComputador, dificuldade, placar]);

  // Função para reiniciar o jogo
  const resetGame = () => {
    setPlayerAtual("O");
    setBoard(emptyBoard);
    setVencedor(null);
    localStorage.removeItem("board");
    localStorage.removeItem("playerAtual");
    localStorage.removeItem("vencedor");
  };

  return (
    <main className="flex flex-col items-center justify-center  bg-gray-100 p-4">
      
      <h1 className="text-4xl sm:text-6xl text-center font-bold mb-4 sm:mb-8 font-serif text-gray-700">Jogo da Velha</h1>

      <div className="flex flex-wrap justify-center mb-4 sm:mb-12 space-x-4 space-y-4">
        <button 
          className="bg-green-600 hover:bg-green-400 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full"
          onClick={() => setJogoContraComputador(true)}
        >
          Jogar contra o computador
        </button>
        <button 
          className="bg-red-600 hover:bg-red-400 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-full"
          onClick={() => setJogoContraComputador(false)}
        >
          Jogar com 2 jogadores
        </button>
      </div>
      
      <img 
        src="https://upload.wikimedia.org/wikipedia/pt/e/eb/Mario_%28personagem%29.png" 
        alt="Mario" 
        className="w-32 sm:w-48 h-auto mb-4 sm:mb-12" 
      />

      {jogoContraComputador && (
        <div className="flex flex-wrap justify-center mb-4 sm:mb-12 space-x-4 space-y-4">
          <button 
            className={`py-2 sm:py-3 px-4 sm:px-6 rounded-full ${dificuldade === "Fácil" ? "bg-blue-600" : "bg-blue-400"} text-white font-bold`} 
            onClick={() => setDificuldade("Fácil")}
          >
            Dificuldade Fácil
          </button>
          <button 
            className={`py-2 sm:py-3 px-4 sm:px-6 rounded-full ${dificuldade === "Difícil" ? "bg-blue-600" : "bg-blue-400"} text-white font-bold`} 
            onClick={() => setDificuldade("Difícil")}
          >
            Dificuldade Difícil
          </button>
        </div>
      )}

      <div className="mb-4 sm:mb-8">
        <button 
          className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-700 transition duration-300 flex items-center"
          onClick={togglePlayPause}
        >
          <FontAwesomeIcon icon={faMusic} className="mr-2" /> 
          {isPlaying ? 'Pausar Música' : 'Tocar Música'}
        </button>
      </div>

      <div className="mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Placar</h2>
        <div className="text-base sm:text-xl">
          <p className="mb-2">Vitórias: <span className="font-bold text-green-600">{placar.vitoria}</span></p>
          <p className="mb-2">Derrotas: <span className="font-bold text-red-600">{placar.derrota}</span></p>
          <p>Empates: <span className="font-bold text-gray-600">{placar.empate}</span></p>
        </div>
      </div>

      <div className="mb-4 sm:mb-8">
        <button 
          onClick={resetPlacar} 
          className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 text-white font-bold rounded-lg shadow-lg hover:bg-red-400 transition-transform transform hover:scale-105"
        >
          Resetar Placar
        </button>
      </div>

      <div className={`grid grid-cols-3 gap-4 sm:gap-8 w-full max-w-4xl ${vencedor ? "pointer-events-none" : ""}`}>
        {board.map((item, index) => (
          <div
            key={index}
            className={`h-24 sm:h-32 w-24 sm:w-32 flex items-center justify-center text-4xl sm:text-8xl font-bold cursor-pointer border-2 border-gray-400 rounded-lg ${item === "O" ? "text-red-600" : item === "X" ? "text-blue-600" : "text-gray-400"}`}
            onClick={() => handleCellClick(index)}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-8">
        <button 
          onClick={resetGame} 
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-400 transition-transform transform hover:scale-105"
        >
          Recomeçar
        </button>
      </div>

      {vencedor &&
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center p-4 sm:p-8 bg-white rounded-lg shadow-lg transform scale-100 sm:scale-110 transition-transform duration-300">
            <h2 className={`text-xl sm:text-3xl font-bold mb-4 ${vencedor === "E" ? "text-gray-800" : vencedor === "O" ? "text-red-600" : "text-blue-600"}`}>
              {vencedor === "E" ? 'Empatou!' : `O vencedor é ${vencedor}`}
            </h2>
            <button onClick={resetGame} className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-400 transition-transform transform hover:scale-105">Recomeçar</button>
          </div>
        </div>
      }
    </main>
  );
}

export default Jogodavelha;
