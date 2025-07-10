import React from "react";
import PlatFormCard from "@/components/PlatformCard";

const StoreForntCard = () => {
    return (
        <PlatFormCard
            sale="5,555.25"
            adsCost="8888"
            profit="555"
            percentAds="35"
            average="256"     
            otherStyles=""
            iconType= "Ionicons"
            icon= "storefront"
            iconSize= {22}
        />
    );
};

export default StoreForntCard;