import React from "react";
import PlatFormCard from "@/components/PlatformCard";

const TiktokCard = () => {
  return (
    <PlatFormCard
      sale="5,555.25"
      adsCost="88,568.33"
      profit="-350.36"
      percentAds="35"
      average="256"     
      otherStyles=""
      iconType= "FontAwesome"
      icon= "music"
      iconSize= {22}
    />
  );
};

export default TiktokCard;
