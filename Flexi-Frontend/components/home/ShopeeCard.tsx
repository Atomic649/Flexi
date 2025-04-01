import React from "react";
import PlatFormCard from "@/components/PlatformCard";

const ShopeeCard = () => {
    return (
        <PlatFormCard
            sale="125,555"
            adsCost="8888"
            profit="555"
            percentAds="35"
            average="256"     
            otherStyles=""
            iconType= "Ionicons"
            icon= "bag"
            iconSize= {22}
        />
    );
};

export default ShopeeCard;