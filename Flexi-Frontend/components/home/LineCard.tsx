import React from "react";
import PlatFormCard from "@/components/PlatformCard";

const LineCard = () => {
    return (
        <PlatFormCard
            sale="5,555.25"
            adsCost="8888"
            profit="555"
            percentAds="35"
            average="256"     
            otherStyles=""
            iconType= "Ionicons"
            icon= "chatbubble"
            iconSize= {22}
        />
    );
};

export default LineCard;