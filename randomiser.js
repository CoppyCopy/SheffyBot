const GachaResources = require('./gachaResources.js');

// Variables for each banner units' total
const oneStarTotal = GachaResources.getLength.oneStarLength;
const twoStarsTotal = GachaResources.getLength.twoStarsLength;
const threeStarsTotal = GachaResources.getLength.threeStarsLength;
const oneStoneSource = GachaResources.getStones.oneStone;
const tenStonesSource = GachaResources.getStones.tenStones;
const fiftyStonesSource = GachaResources.getStones.fiftyStones;
const limitedBannerSources = [creditta = { source: GachaResources.credittaSource, total: GachaResources.getLength.credittaLength}, 
ceremonial = { source: GachaResources.ceremonialSource, total: GachaResources.getLength.ceremonialLength},
christmas = { source: GachaResources.christmasSource, total: GachaResources.getLength.christmasLength},
halloween = { source: GachaResources.halloweenSource, total: GachaResources.getLength.halloweenLength},
idolmaster = { source: GachaResources.idolmasterSource, total: GachaResources.getLength.idolmasterLength},
newyear = { source: GachaResources.newYearSource, total: GachaResources.getLength.newYearLength},
princess = { source: GachaResources.princessSource, total: GachaResources.getLength.princessLength},
rezero = { source: GachaResources.reZeroSource, total: GachaResources.getLength.reZeroLength},
summer = { source: GachaResources.summerSource, total: GachaResources.getLength.summerLength},
valentine = { source: GachaResources.valentineSource, total: GachaResources.getLength.valentineLength},
overload = { source: GachaResources.overloadSource, total: GachaResources.getLength.overloadLength},
];
// userAkiraID = 389500570152730634;
// userCoppyID = 174069912338169856;
const VipUserIdList = ['389500570152730634', "174069912338169856"];
let threeStarsSource = '';
let updateTotal = 0;
let randomLimited = 0;
//var bannerType = 'Normal';
var randomUnits = [{isRainbow: 0, oneStar: 0, twoStars: 0, threeStars: 0}];

// The main gachapon randomiser system
function randomiseUnit(numUnits, bannerType, vipUser) {
  for (var index=0; index<numUnits; index++) {
    if (index < 9) {
      let randomNum = Math.floor(Math.random() * 100) + 1;
      let bannerName = bannerType.toLowerCase();
      const oneStarSource = GachaResources.oneStarSource;
      const limitedBannerNumber = GachaResources.getBannerNames.indexOf(bannerName);
      //console.log(limitedBannerNumber);

      if (limitedBannerNumber !== 11) { // If it is not Normal
        randomLimited = Math.floor(Math.random() * 100) + 1 >= 50;

        const isLimited = randomLimited ? 1 : 0;
        threeStarsSource = isLimited ? limitedBannerSources[limitedBannerNumber].source : GachaResources.threeStarsSource;
        updateTotal = isLimited ? limitedBannerSources[limitedBannerNumber].total : threeStarsTotal;
        //console.log(isLimited);
      } else { // Normal gacha
        threeStarsSource = GachaResources.threeStarsSource;
        updateTotal = threeStarsTotal;
      }
      
      // Start randomise here
      if (VipUserIdList.indexOf(vipUser) === -1) {
        if (randomNum <= 79) { // Obtain 1 star unit
          const oneStar = Math.floor(Math.random() * oneStarTotal);
          randomUnits.push({stoneSource: oneStoneSource, source: oneStarSource[oneStar].source, isStar: 1, isSixStars: GachaResources.oneStarSource[oneStar].isSixStars});
          randomUnits[0].oneStar += 1;
        } else if (randomNum > 79 && randomNum <= 97) { // Obtain 2 stars unit
          const twoStars = Math.floor(Math.random() * twoStarsTotal)
          randomUnits.push({stoneSource: tenStonesSource, source: GachaResources.twoStarsSource[twoStars].source, isStar: 2, isSixStars: GachaResources.twoStarsSource[twoStars].isSixStars});
          randomUnits[0].twoStars += 1;
        } else { // Obtain 3 stars unit
          const threeStars = Math.floor(Math.random() * updateTotal);
          randomUnits.push({stoneSource: fiftyStonesSource, source: threeStarsSource[threeStars].source, isStar: 3, isSixStars: threeStarsSource[threeStars].isSixStars});
          randomUnits[0].threeStars += 1;
          // If there's rainbow drop, then add to the list. Also, if it does not exists yet.
          // Use Slice function to access to the array elements
          if (randomUnits.slice(0)[0].isRainbow === 0) {
            randomUnits.slice(0)[0].isRainbow = 1;
          }
          
        }
      } else {
        // VIP only
        const threeStars = Math.floor(Math.random() * updateTotal);
        
        randomUnits.push({stoneSource: fiftyStonesSource, source: threeStarsSource[threeStars].source, isStar: 3, isSixStars: threeStarsSource[threeStars].isSixStars});
        randomUnits[0].threeStars += 1;
        // If there's rainbow drop, then add to the list. Also, if it does not exists yet.
        // Use Slice function to access to the array elements
        if (randomUnits.slice(0)[0].isRainbow === 0) {
          randomUnits.slice(0)[0].isRainbow = 1;
        }
      }
    } else { // On the tenth unit
      if (VipUserIdList.indexOf(vipUser) === -1) {
        let randomNum = Math.floor(Math.random() * 100) + 1;
        if (randomNum <= 97) { // Obtain 2 stars unit
          const twoStars = Math.floor(Math.random() * twoStarsTotal)
          randomUnits.push({stoneSource: tenStonesSource, source: GachaResources.twoStarsSource[twoStars].source, isStar: 2, isSixStars: GachaResources.twoStarsSource[twoStars].isSixStars});
          randomUnits[0].twoStars += 1;
        } else if (VipUserIdList.indexOf(vipUser)) { // Obtain 3 stars unit
          const threeStars = Math.floor(Math.random() * updateTotal);
          randomUnits.push({stoneSource: fiftyStonesSource, source: threeStarsSource[threeStars].source, isStar: 3, isSixStars: threeStarsSource[threeStars].isSixStars});
          randomUnits[0].threeStars += 1;
          // If there's rainbow drop, then add to the list. Also, if it does not exists yet.
          // Use Slice function to access to the array elements
          if (randomUnits.slice(0)[0].isRainbow === 0) {
            randomUnits.slice(0)[0].isRainbow = 1;
          }
        }
      } else {
          const threeStars = Math.floor(Math.random() * updateTotal);
          randomUnits.push({stoneSource: fiftyStonesSource, source: threeStarsSource[threeStars].source, isStar: 3, isSixStars: threeStarsSource[threeStars].isSixStars});
          randomUnits[0].threeStars += 1;
          // If there's rainbow drop, then add to the list. Also, if it does not exists yet.
          // Use Slice function to access to the array elements
          if (randomUnits.slice(0)[0].isRainbow === 0) {
            randomUnits.slice(0)[0].isRainbow = 1;
          }
      }
      
    }
  }
  return randomUnits;
};

function getLength() {
  return randomUnits.length;
}

function emptyRandomUnits() {
  randomUnits = [{isRainbow: 0, oneStar: 0, twoStars: 0, threeStars: 0}]; // Reset
}

module.exports = {
  randomiseUnit,
  getLength,
  emptyRandomUnits,
};