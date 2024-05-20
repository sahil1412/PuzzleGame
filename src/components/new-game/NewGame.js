
import './NewGame.css'

const NewGame = ({reset,help,start}) =>
    <div className='button-wrapper'>
        <button onClick={start}>Start</button>
        <button onClick={reset}>Reset</button>
        <button onClick={help}>Help Me</button>   
    </div>

export default NewGame
