// Importação das bibliotecas
import React, { useState, useEffect } from 'react'; // React e seus hooks para gerenciar estado 
import './Jogodavelha.css'; 
import './tailw.css'; // Importação do arquivo Tailwind 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Ícones do FontAwesome
import { faMusic } from '@fortawesome/free-solid-svg-icons'; 

function Jogodavelha() {
  // Inicializa o tabuleiro com 9 posições vazias (jogo da velha é 3x3)
  const emptyBoard = Array(9).fill("");

  // useState para armazenar o estado do tabuleiro, iniciando com o valor salvo no localStorage (ou vazio)
  const [board, setBoard] = useState(() => {
    const savedBoard = localStorage.getItem("board");
    return savedBoard ? JSON.parse(savedBoard) : emptyBoard;
  });
  
  // Estado para armazenar o jogador atual ("O" ou "X")
  const [playerAtual, setPlayerAtual] = useState(() => {
    const savedPlayer = localStorage.getItem("playerAtual");
    return savedPlayer || "O"; // Se não houver nada salvo, inicia com "O"
  });
  
  // Estado para armazenar o vencedor, inicializando com o valor salvo no localStorage
  const [vencedor, setVencedor] = useState(() => {
    const savedVencedor = localStorage.getItem("vencedor");
    return savedVencedor !== "null" ? savedVencedor : null; // "null" significa que não há vencedor ainda
  });
  
  // Estado para o modo de jogo: se está jogando contra o computador ou não
  const [jogoContraComputador, setJogoContraComputador] = useState(() => {
    const savedModo = localStorage.getItem("jogoContraComputador");
    return savedModo ? JSON.parse(savedModo) : false; // Se não houver nada salvo, começa como modo 2 jogadores
  });
  
  // Estado para gerenciar a música (som do Mario)
  const [audio] = useState(new Audio(process.env.PUBLIC_URL + '/musicamario.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);

  // Função que toca ou pausa a música
  const togglePlayPause = () => {
    if (isPlaying) {
      audio.pause(); 
    } else {
      audio.play(); 
    }
    setIsPlaying(!isPlaying); 
  };

  // Função chamada quando o jogador clica em uma célula do tabuleiro
  const handleCellClick = (index) => {
    // Se já houver vencedor ou a célula já estiver preenchida, retorna sem fazer nada
    if (vencedor || board[index] !== "") return;

    // Atualiza o tabuleiro com a jogada do jogador atual
    const newBoard = board.map((item, itemIndex) => itemIndex === index ? playerAtual : item);
    setBoard(newBoard);

    // Verifica se há um vencedor ou empate imediatamente após a jogada
    const result = vitoria(newBoard);

    if (result) {
      setVencedor(result);
      return;
    }

    // Se o modo for contra o computador e for a vez do jogador "O", o computador joga logo após
    if (jogoContraComputador && playerAtual === "O") {
      setPlayerAtual("X"); // Alterna para o computador
      setTimeout(() => jogadaComputador(newBoard), 500); // Computador joga depois de 500ms
    } else {
      // Alterna o jogador atual para "X" ou "O"
      setPlayerAtual(playerAtual === "X" ? "O" : "X");
    }
  };

  // Lógica para o computador fazer sua jogada
  const jogadaComputador = (newBoard) => {
    if (vencedor) return; // Se já houver vencedor, não faz nada

    // Encontra as células vazias e escolhe uma aleatoriamente
    const emptyIndexes = newBoard.map((item, index) => item === "" ? index : null).filter(val => val !== null);
    if (emptyIndexes.length === 0) return; // Se não houver espaços livres, retorna

    // Escolhe uma célula aleatória para o computador jogar
    const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    const updatedBoard = newBoard.map((item, index) => index === randomIndex ? "X" : item);

    setBoard(updatedBoard);
    const result = vitoria(updatedBoard);

    if (result) {
      setVencedor(result);
    } else {
      setPlayerAtual("O"); // Após a jogada do computador, volta para o jogador humano
    }
  };

  // Função para verificar se há um vencedor
  const vitoria = (boardToCheck) => {
    // Combinações possíveis de vitória (linhas, colunas e diagonais)
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

    // Verifica se algum jogador completou uma das combinações de vitória
    for (const cells of ways) {
      if (cells.every(cell => cell === "O")) return "O"; // Se todas as células são "O", "O" venceu
      if (cells.every(cell => cell === "X")) return "X"; // Se todas as células são "X", "X" venceu
    }

    return null;
  };

  // Função que verifica se o jogo terminou em empate
  const verificarEmpate = (boardToCheck) => {
    if (boardToCheck.every(item => item !== "")) return "E"; // Se todas as células estiverem preenchidas e não houver vencedor, é empate
    return null;
  };

  // useEffect para rodar a verificação de vitória sempre que o estado do tabuleiro mudar
  useEffect(() => {
    const result = vitoria(board);
    if (result) {
      setVencedor(result);
    } else {
      const empate = verificarEmpate(board);
      if (empate) {
        setVencedor(empate);
      }
    }
  }, [board]);

  // Salva o estado do jogo no localStorage sempre que o tabuleiro, jogador atual, vencedor ou modo de jogo mudam
  useEffect(() => {
    localStorage.setItem("board", JSON.stringify(board));
    localStorage.setItem("playerAtual", playerAtual);
    localStorage.setItem("vencedor", vencedor);
    localStorage.setItem("jogoContraComputador", JSON.stringify(jogoContraComputador));
  }, [board, playerAtual, vencedor, jogoContraComputador]);

  // Função para resetar o jogo (limpar tabuleiro e estado)
  const resetGame = () => {
    setPlayerAtual("O"); // Reseta o jogador atual para "O"
    setBoard(emptyBoard); // Reseta o tabuleiro
    setVencedor(null); // Reseta o vencedor
    localStorage.removeItem("board"); // Remove estado do localStorage
    localStorage.removeItem("playerAtual");
    localStorage.removeItem("vencedor");
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h1 className="text-6xl text-center font-bold mb-8 font-serif text-gray-700">JOGO DA VELHA</h1>
      
      <img 
        src="https://upload.wikimedia.org/wikipedia/pt/e/eb/Mario_%28personagem%29.png" 
        alt="Mario" 
        className="mb-12 w-48 h-auto" 
      />

      <div className="flex flex-wrap justify-center mb-12 space-x-4 space-y-4">
        <button className="bg-green-600 hover:bg-green-400 text-white font-bold py-3 px-6 rounded-full" onClick={() => setJogoContraComputador(true)}>Jogar contra o computador</button>
        <button className="bg-red-600 hover:bg-red-400 text-white font-bold py-3 px-6 rounded-full" onClick={() => setJogoContraComputador(false)}>Jogar com 2 jogadores</button>
      </div>

      <div className="mb-8">
        <button 
          className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-700 transition duration-300 flex items-center"
          onClick={togglePlayPause}>
          <FontAwesomeIcon icon={faMusic} className="mr-2" /> 
          {isPlaying ? 'Pausar Música' : 'Tocar Música'}
        </button>
      </div>

      <div className={`grid grid-cols-3 gap-8 w-full max-w-4xl ${vencedor ? "pointer-events-none" : ""}`}>
        {board.map((item, index) => (
          <div
            key={index}
            className={`h-32 w-32 flex items-center justify-center text-8xl font-bold cursor-pointer border-2 border-gray-400 rounded-lg ${item === "O" ? "text-red-600" : item === "X" ? "text-blue-600" : "text-gray-400"}`}
            onClick={() => handleCellClick(index)}
          >
            {item}
          </div>
        ))}
      </div>

      <div className="mt-8">
        <button 
          onClick={resetGame} 
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-400 transition-transform transform hover:scale-105"
        >
          Recomeçar
        </button>
      </div>

      {vencedor &&
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center p-8 bg-white rounded-lg shadow-lg transform scale-110 transition-transform duration-300">
            <h2 className={`text-3xl font-bold mb-4 ${vencedor === "E" ? "text-gray-800" : vencedor === "O" ? "text-red-600" : "text-blue-600"}`}>
              {vencedor === "E" ? 'Empatou!' : `O vencedor é ${vencedor}`}
            </h2>
            <button onClick={resetGame} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-400 transition-transform transform hover:scale-105">Recomeçar</button>
          </div>
        </div>
      }
    </main>
  );
}

export default Jogodavelha;
