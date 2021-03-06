import React, { useRef, useState, useEffect } from "react";
import { cardTypeObj } from "./cardConstants";
import { cardsDataActionCreator } from "../../gameBoard/gameBoardRedux/actionCreator";
import { Card as ClassCard } from "../../gameBoard/gameHelpers";
import { connect } from "react-redux";
import { cardDragActionOrigin } from "./cardRedux/actionCreator";
import "./Card.css";

const Card = (props) => {
  const { card, view, isDrag, shape, cardsData } = props;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pressed = card ? card.isDraging : false;

  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      ref.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
    }
    return () => {};
  }, [position]);
  console.log(shape, "Card.....");
  const onMouseMove = (event) => {
    if (event.target.name === "card" && card.isDraging === false) return;
    event.preventDefault();

    if (pressed) {
      setPosition({
        x: position.x + event.movementX,
        y: position.y + event.movementY,
      });
    }
  };

  const onMouseUp = (event) => {
    const currentDropCardType = event.target.dataset.id ? event.target.dataset.id : event.target.parentNode.dataset.id 
    console.log(currentDropCardType,"mouse up at.....");
    event.preventDefault();
    const copyOfData = [...cardsData];
    const { eventObj, eventRef,initalPos } = props;
    //eventRef.current.style.position = `absolute`;
    eventRef.current.style={offsetLeft:initalPos.x,offsetTop:initalPos.y,color:`${eventObj.color}`};
    

    //={offsetLeft:initalPos.x , offsetTop:initalPos.y,color:eventObj.color};
    const prevEventdataIndex = copyOfData.findIndex((ele,index)=> ele._id===eventObj._id)
    copyOfData[prevEventdataIndex].isDraging = false;
    console.log(currentDropCardType,"is undefined...")
    console.log(currentDropCardType,eventObj._id,"hrtshr")
    if(currentDropCardType==eventObj._id){
      console.log("clicked on same card.. not a valid move....")
      props.cardsDataActionCreator(copyOfData);
      props.cardDragActionOrigin(null);
      return;
    }
   
    if(currentDropCardType===eventObj.type){
      console.log("placed on correct place holder.....");
      copyOfData[prevEventdataIndex].isPlaced = true;
      props.cardsDataActionCreator(copyOfData);
      props.cardDragActionOrigin(null);
      return;
    }
    console.log("reseting....");
    props.cardDragActionOrigin(null);
    props.cardsDataActionCreator(ClassCard.cardDataCreator());
  };

  const onMouseDown = (event) => {
        const currentCardId = event.target.dataset.id ? event.target.dataset.id : event.target.parentNode.dataset.id 
      console.log(currentCardId,"mouse down at.....");
      event.preventDefault();
      const copyOfData = [...cardsData];
      const selectedCardsIndex = copyOfData.indexOf(card, 0);
      let eventObj = copyOfData[selectedCardsIndex];
    
      eventObj.isDraging = true;
      console.log(eventObj);
      copyOfData.splice(selectedCardsIndex,1,eventObj);
      console.log("updating ... dragable card...");
      console.log(selectedCardsIndex);
      const initalPos ={
        x: event.target.style.offsetLeft,
        y: event.target.style.offsetTop
      }
      props.cardDragActionOrigin({ eventObj, ref,initalPos});
      props.cardsDataActionCreator(copyOfData);
    
  };
  //console.log(card);

  const innerShapes = card
    ? [...Array(card.value).keys()].map((ele) => (
        <>
          <span>{card.shape}</span>
          {ele % 3 === 0 ? <br /> : null}{" "}
        </>
      ))
    : null;

  const handleStop = (event) => {
    console.log("drag stop...", event.target.dataset.id);
  };

  const uiOfCard = (
    <>
      <div
        ref={ref}
        className={`${view}`}
        style={{
          color: card ? card.color : "black",
          zIndex: card && card.isDraging ? 1 : null,
        }}
        data-id={card ? card._id : shape}
        onMouseMove={card && card.isDraging ? onMouseMove : null}
        onMouseDown={shape ? null : onMouseDown}
        onMouseUp={onMouseUp}
        name={card ? "card" : "Shape"}
      >
        <>
          <span>{card ? card.value : ""}</span>
          <span>{card ? cardTypeObj[card.type].symbol : ""}</span>
          {props.children}
        </>
      </div>
    </>
  );
  return <>{uiOfCard}</>;
};

const mappropsToState = (store) => {
  return {
    cardsData: store.gameBoardReducer.cardsData,
    eventObj: store.cardReducer.eventObj,
    eventRef: store.cardReducer.ref,
    initalPos: store.cardReducer.initalPos,
  };
};

export default connect(mappropsToState, {
  cardsDataActionCreator,
  cardDragActionOrigin,
})(Card);
