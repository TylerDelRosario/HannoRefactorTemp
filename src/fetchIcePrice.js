"use strict"

const fs = require('fs');


class IcePrice {

    static fetchURL = "https://esi.evetech.net/latest/markets/10000002/orders/?datasource=tranquility&order_type=sell&page=1&type_id=";

    constructor(name, typeID, ratio) {
        this.name = name;
        this.typeID = typeID;
        this.ratio = ratio;
        this.data = {};
    }

    updateIcePrice = () => {

        console.log(`${this.name} pulling data`);

        return fetch(IcePrice.fetchURL + this.typeID).then((response) => {
            return response.json();
        }).then((data) => {
            this.data = new Appraisal(data);
            console.log(this.ratio);
            return this.translateRatio(this.ratio);
        }).catch((err) => {
            console.log(err);
            throw err;
        });

    }

    translateRatio = (ratio) => {

        const iceNames = ["heavyWater", "liquidOzone", "heliumIsotopes", "strontiumClathrates", "hydrogenIsotopes", "oxygenIsotopes", "nitrogenIsotopes"];
        let iceRatio = {
            [this.name]: {

            }
        };
        
        ratio.forEach((value, i) => {
            iceRatio[this.name][iceNames[i]] = value;
        });
        iceRatio[this.name]["cost"] = Math.ceil(this.data.appraisal);

        return iceRatio;
    }

    getData = () => this.translateRatio(this.ratio);

}

class Appraisal {

    constructor(priceData) {
        this.appraisal = this.selectionSort(priceData);
    }

   //Sorts prices from least to greatest
   selectionSort = (prices) => {
        //Ignore orders with less than 1k
        const filterPrice = (arr) => {

            let filter = [];

            arr.forEach((item) => {
                if (item.volume_remain > 10) {
                    filter.push(item);
                }
            });

            return filter;
        }
        const dataSwap = (arr, firstIndex, secondIndex) => {
            const indexSwap = arr[firstIndex];

            arr[firstIndex] = arr[secondIndex];
            arr[secondIndex] = indexSwap;
        }
        const findMinimum = (array, startIndex) => {

            let currentLowest = array[startIndex].price;
            let minIndex = startIndex;
            
            for (let i = minIndex; i < array.length; i++) {

                if (currentLowest > array[i].price) {

                    currentLowest = array[i].price;
                    minIndex = i;

                }

            }
            return minIndex;
        }
        const sort = (array) => {
            let min;
            if (array.length > 1) {
            for (let index = 0; index < array.length; index++) {

                min = findMinimum(array, index);
                dataSwap(array, index, min);

            }
            }
            return array;
        }

        const debugFilt = filterPrice(prices);

        return this.calcAverage(sort(debugFilt));
    }
    //Grabs the cheapest 20 orders and calc their avg.
    calcAverage = (price) => {
        //takes avg price of the first cheapest 20 orders.
        const relevantOrders = (arr) => {
            let relAvg = 1;     
            let relLength = 20;
            
            if (arr.length < relLength) {
                
                relLength = arr.length;
            }

            for (let i = 0; i < relLength; i++) {
                relAvg += arr[i].price;
            }

            relAvg = relAvg / relLength;
            return relAvg;
        }

        return relevantOrders(price);
    }

}

class FetchPriceData {

    constructor() {
        this.staticIceData = [

            new IcePrice("Compressed Clear Icicle", 28434, [69, 35, 414, 1, 0, 0, 0]),
            new IcePrice("Compressed Glacial Mass", 28438, [69, 35, 0, 1, 414, 0, 0]),
            new IcePrice("Compressed Blue Ice", 28433, [69, 35, 0, 1, 0, 414, 0]),
            new IcePrice("Compressed White Glaze", 28444, [69, 35, 0, 1, 0, 0, 414]),
            new IcePrice("Compressed Glare Crust", 28439, [1381, 691, 0, 35, 0, 0, 0]),
            new IcePrice("Compressed Dark Glitter", 28435, [691, 1681, 0, 69, 0, 0 ,0]),
            new IcePrice("Compressed Gelidus", 28437, [345, 691, 0, 104, 0, 0, 0]),
            new IcePrice("Compressed Krystallos", 28440, [173, 691, 0, 173, 0 ,0, 0]),
            new IcePrice("Compressed Thick Blue Ice", 28443, [104, 55, 0, 1, 0, 483, 0]),
            new IcePrice("Compressed Pristine White Glaze", 28441, [104, 55, 0, 1, 0, 0, 483]),
            new IcePrice("Compressed Smooth Glacial Mass", 28442, [104, 55, 0, 1, 483, 0, 0]),
            new IcePrice("Enriched Clear Icicle", 28436, [104, 55, 483, 1, 0, 0 ,0])

        ];
    }

    fetchOreData = (path) => {
        const iceFetches = [];

        this.staticIceData.forEach((ice) => {
            
            iceFetches.push(ice.updateIcePrice());
        });
        Promise.all(iceFetches)
            .then(() => {
                this.writeOreData(path);
            });
    }

    writeOreData = (path) => {
        const fsData = {table: []};

        this.staticIceData.forEach((ice) => {
            fsData.table.push(ice.getData());
        });

        fs.writeFileSync(path, JSON.stringify(fsData), 'utf-8', (error) => {
            if (error) throw error;
            console.log("Write to JSON completed! :D");
        });
    }
}

const debug = () => {
    const hannoFetch = new FetchPriceData();
    hannoFetch.fetchOreData('hannoIce.json');
}

debug();