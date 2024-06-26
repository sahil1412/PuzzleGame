import { useEffect, useState } from "react";
import './Board.css';
import Tile from "../tile/Tile";
import Overlay from "../Overlay/Overlay";
import NewGame from "../new-game/NewGame";
import Winner from "../winner/Winner";
import Header from "../header/Header";
const PriorityQueue = require('js-priority-queue');

const N = 4;
const Board = () => {
    const [move,setMove] = useState(0);
    const [time,setTime] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [starts,setStarts] = useState(false);
    const [numbers,setNumbers] = useState([])
    const [animating,setAnimating] = useState(false)

    useEffect(() => {
        let timer;
        if (timerRunning) {
          timer = setInterval(() => {
            setTime(prevTime => prevTime + 1);
          }, 1000);
        }
        return () => clearInterval(timer);
      }, [timerRunning, setTime]);
    
    // target array we need
    let rows = 4;
    let cols = 4;
    let target = Array.from({ length: rows }, (_, i) => 
        Array.from({ length: cols }, (_, j) => i * cols + j + 1) // Populating with sequential numbers
    );
    target[3][3] = 0;

    // generate random array 
    const shuffle = () => 
        new Array(16)
        .fill()
        .map((_,i) => i+1)
        .sort(() => Math.random() -.5)
        .map((x,i) => ({value : x , index : i}))

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
                if(puzzle[i][j] === 0)
                    return N-i;
            }
        }
    }

    const isSolvable = (numbers) =>{
        let initial = [];
        console.log();
        let k = 0;
        for(let i=0;i<N;i++){
            const temp = [];
            for(let j=0;j<N;j++){
                if(numbers[k].value !== 16){
                    temp.push(numbers[k].value);
                }
                else{
                    temp.push(0);
                }
                k++;
            }
            initial.push(temp);
        }
        // check whether the puzzle is solvable or not
        let inversion_count = getInvCount(initial);

        if(N & 1){
            return !(inversion_count & 1);
        }
        else{
            let pos = findXPosition(initial);
            if(pos & 1)
                return !(inversion_count & 1);
            else 
                return inversion_count & 1;
        }

    }
     // reset the puzzle
     const reset = () => {
        setNumbers(shuffle());
        // if(!isSolvable(numbers)){
        //     alert("This puzzle is unsolvable. New puzzle Generated.")
        //     // console.log("unSolvable");
        //     reset();
        // }
        setMove(0);
        setTime(0);
        setTimerRunning(timerRunning);

    }

    const start = () =>{
        // check whether puzzle is solvable or not
        // start and pause timer        
        setStarts(!starts);
        setTimerRunning(!timerRunning);
        if(!isSolvable(numbers)){
            console.log(numbers);
            alert("This puzzle is unsolvable. Refresh for new puzzle.")
            reset();
        }
    }

    const cost = (initial,target) =>{
        let count = 0;
        for(let i=0;i<N;i++){
            for(let j=0;j<N;j++){
                if(initial[i][j] !== target[i][j] && initial[i][j] !== 16){
                    count++;
                }
            }
        }
        return count;
    }

    const spacePosition = (initial) =>{
        let r = -1,c = -1;
        for(let i=0;i<N;i++){
            for(let j=0;j<N;j++){
                if(initial[i][j] === 0){
                    r = i;
                    c = j;
                    break;
                }
            }
        }
        return {r,c};
    }

    const leaf_To_Root_path = (mp,node) =>{
        let path = [];
        let current = JSON.stringify(node);

        while(mp.has(current)){
            path.push(JSON.parse(current));
            current = JSON.stringify(mp.get(current));
        }

        path.push(JSON.parse(current));
        path.reverse();
        console.log(path);
        // console.log(path[1]);
    }
    
    const nextState = (initial, target) =>{
        
        let dist = cost(initial, target);

        let mp = new Map();
        let dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        
        const minHeap = new PriorityQueue({
            comparator: (a, b) => a.priority - b.priority});

        minHeap.queue({task:JSON.stringify(initial),priority:dist});

        let st = new Set();
        st.add(JSON.stringify(initial));

        while (minHeap.length > 0) {
            let top = minHeap.peek();
            console.log(minHeap.dequeue());
            let states = JSON.parse(top.task);
            let current = top.priority;
            // console.log(top.dist);
            console.log(states);
            let pos = spacePosition(states);
            let x = pos.r;
            let y = pos.c;
            for (let i=0;i<dirs.length;i++) {
                let nx = x + dirs[i][0];
                let ny = y + dirs[i][1];
                if (nx >= 0 && ny >= 0 && nx < N && ny < N) {
                    const temp = states;
                    [temp[x][y] ,temp[nx][ny]] = [temp[nx][ny],temp[x][y]];
                    let distance = cost(temp, target);
                    if (!st.has(JSON.stringify(temp)) && distance <= current) {
                        mp.set(JSON.stringify(temp),JSON.stringify(states));
                        // console.log(distance);
                        minHeap.queue({task:JSON.stringify(temp),priority:distance});
                        // minHeap.queue({dist:distance,state:temp});
                        st.add(JSON.stringify(temp));
                    }
                    if (temp === target) {
                        break;
                    }
                }
            }
        }
        leaf_To_Root_path(mp,target);
    }
    const help = ()=>{
        let initial = [];
        let k = 0;
        for(let i=0;i<N;i++){
            const temp = [];
            for(let j=0;j<N;j++){
                temp.push(numbers[k].value);
                k++;
            }
            initial.push(temp);
        }

        for(let i=0;i<N;i++){
            for(let j=0;j<N;j++){
                if(initial[i][j] === 16){
                    initial[i][j] = 0;
                }
            }
        }
        
        nextState(initial,target);
        //console.log(target);
        
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
        // check after move solvable or not
        if(!isSolvable(numbers)){
            alert("This puzzle is unsolvable. Refresh for new puzzle.")
            reset();
        }
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
        {starts && <div className="board"> 
            <Overlay size={16} />
            {numbers.map ((x,i) => {
                return <Tile key={i} number={x} start={starts}moveTile={moveTile}/>
            })}
        </div>}
        {!starts && <div className="boardTrans">
            <h1>Click to start </h1>
            </div>
        }
        <Winner numbers={numbers} reset={reset}/>
        <NewGame reset={reset} help={help} start={start} />
    </div>
}

export default Board;