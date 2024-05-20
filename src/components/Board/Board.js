import { useEffect, useState } from "react";
import './Board.css';
import Tile from "../tile/Tile";
import Overlay from "../Overlay/Overlay";
import NewGame from "../new-game/NewGame";
import Winner from "../winner/Winner";
import Header from "../header/Header";
import Starts from "../start-up/Starts";

const N = 4;
const Board = () => {
    const [move,setMove] = useState(0);
    const [time,setTime] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [starts,setStarts] = useState(false);

    useEffect(() => {
        let timer;
        if (timerRunning) {
          timer = setInterval(() => {
            setTime(prevTime => prevTime + 1);
          }, 1000);
        }
        return () => clearInterval(timer);
      }, [timerRunning, setTime]);
    
    const shuffle = () => 
        new Array(16)
        .fill()
        .map((_,i) => i+1)
        .sort(() => Math.random() -.5)
        .map((x,i) => ({value : x , index : i}))

    const [numbers,setNumbers] = useState([])
    const [animating,setAnimating] = useState(false)

    const reset = () => {
        setNumbers(shuffle());
        setMove(0);
        setTime(0);
        setTimerRunning(false);
    }

    const start = () =>{
        // check whether puzzle is solvable or not
        if(isSolvable(numbers)){
            alert("This puzzle is unsolvable. Please shuffle to generate a new puzzle.")
            shuffle();
            return
        }
        // start and pause timer
        setTimerRunning(!timerRunning);
    }

    const help = ()=>{
        // next move
        console.log(numbers);
        
    }

    const getInvCount = (puzzle) =>{
        let inversion_count = 0;
        for(let i=0;i<N*N-1;i++){
            for(let j=i+1;j<N*N;j++){
                if(puzzle[j] && puzzle[i] && puzzle[i] > puzzle[j]){
                    inversion_count++;
                }
            }
        }
        return inversion_count;
    }

    const findXPosition = (puzzle) =>{
        for(let i=N-1;i>=0;i--){
            for(let j=N-1;j>=0;j--){
                if(puzzle[i][j] == 0)
                    return N-i;
            }
        }
    }

    const isSolvable = (puzzle) =>{
        // check whether the puzzle is solvable or not
        let inversion_count = getInvCount(puzzle);

        if(N & 1){
            return !(inversion_count & 1);
        }
        else{
            let pos = findXPosition(puzzle);
            if(pos & 1)
                return !(inversion_count & 1);
            else 
                return inversion_count & 1;
        }

    }


    const moveTile = tile => {
        const i16 = numbers.find(n => n.value===16).index
        if (![i16-1,i16+1,i16-4,i16+4].includes(tile.index) || animating)
            return
        
        const newNumbers = 
            [...numbers]
            .map(number => {
                if (number.index !== i16 && number.index !== tile.index)
                    return number
                else if (number.value === 16)
                    return {value: 16, index: tile.index}

                return {value: tile.value, index : i16}
            })
        setAnimating(true);
        setNumbers(newNumbers);
        setMove(move+1);
        setTimeout(() => setAnimating(false), 200);
    }
    
    const handleKeyDown = e => {
        const i16 = numbers.find(n => n.value===16).index
        if (e.keyCode === 37 && !(i16 % 4 === 3))
            moveTile(numbers.find(n => n.index === i16 + 1))
        else if (e.keyCode === 38 && !(i16 > 11))
            moveTile(numbers.find(n => n.index === i16 + 4))
        else if (e.keyCode === 39 && !(i16 % 4 === 0))
            moveTile(numbers.find(n => n.index === i16 - 1))
        else if (e.keyCode === 40 && !(i16 < 4))
            moveTile(numbers.find(n => n.index === i16 - 4))
    }

    useEffect(() => {
        document.addEventListener('keydown',handleKeyDown)
        return () => {document.removeEventListener('keydown',handleKeyDown)}
    })

    useEffect(reset, [])

    return <div className="game">
        <Header move={move} Time={time}/>
        <div className="board">
            <Overlay size={16} />
            {numbers.map ((x,i) => {
                return <Tile key={i} number={x} moveTile={moveTile}/>
            })}
        </div>
        <Winner numbers={numbers} reset={reset}/>
        <NewGame reset={reset} help={help} start={start} />
    </div>
}

export default Board;