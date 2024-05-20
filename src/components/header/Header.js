import "./Header.css";

const Header = ({move,Time}) =>
    <div className='button-wrapper'>
        <button >Move : {move}</button>
        <button >Time : {Time}</button> 
    </div>

export default Header;
