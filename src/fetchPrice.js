"use strict"

const fs = require('fs');

class OrePrice {

    static fetchURL = "https://esi.evetech.net/latest/markets/10000002/orders/?datasource=tranquility&order_type=sell&page=1&type_id=";

    constructor(name, typeID, ratio) {

        this.name = name;
        this.typeID = typeID;
        this.ratio = ratio;
        this.data = {};

    }

    updateOrePrice = () => {

        console.log(`${this.name} pulling data`);
        return fetch(OrePrice.fetchURL + this.typeID).then((response) =>{
            return response.json();
        })
        .then((oreData) => {

            this.data = new Appraisal(oreData);

            return this.translateRatio(this.ratio);

        })     
        .catch((error) => {
            console.log(error);
            throw error;
        });

    }

    translateRatio = (ratio) => {

        const mineralNames = ["tritanium", "pyerite", "mexallon", "isogen", "nocxium", "zydrine", "megacyte", "morphite"];
        let oreRatio = {
            [this.name]: {

            }
        };

        for (let i = 0; i < ratio.length; i++) {

            oreRatio[this.name][mineralNames[i]] = ratio[i];
            
        }

        oreRatio[this.name]["cost"] = this.data.appraisal;
        
        return oreRatio;

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
                if (item.volume_remain > 10000) {
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
            console.log(arr.length);
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

    constructor(){
        this.staticOreData = [
            //VELDSPAR
            new OrePrice("Compressed Veldspar", 62516, [4, 0, 0, 0, 0, 0, 0, 0]),
            new OrePrice("Compressed Concentrated Veldspar", 62517, [4.2, 0, 0, 0, 0, 0, 0, 0]),
            new OrePrice("Compressed Dense Veldspar", 62518, [4.4, 0, 0, 0, 0, 0, 0, 0]),

            //SCORDITE
            new OrePrice("Compressed Scordite", 62520, [1.5, 0.9, 0, 0, 0, 0, 0, 0]),
            new OrePrice("Compressed Condensed Scordite", 62521, [1.58, 0.95, 0, 0, 0, 0, 0, 0]),
            new OrePrice("Compressed Massive Scordite", 62522, [1.65, 1, 0, 0, 0, 0, 0, 0]),

            //PYROXERES
            new OrePrice("Compressed Pyroxeres", 62524, [0, 0.9, 0.3, 0, 0, 0, 0, 0]),
            new OrePrice("Compressed Solid Pyroxeres", 62525, [0, 0.95, 0.32, 0, 0, 0, 0, 0]),
            new OrePrice("Compressed Viscous Pyroxeres", 62526, [0, 1, 0.33, 0, 0, 0, 0, 0]),

            //PLAGIOCLASE
            new OrePrice("Compressed Plagioclase", 62528, [1.75, 0, 0.7, 0, 0, 0, 0, 0]),
            new OrePrice("Compressed Azure Plagioclase", 62529, [1.84, 0, 0.74, 0, 0, 0, 0, 0]),
            new OrePrice("Compressed Rich Plagioclase", 62530, [1.93, 0, 0.77, 0, 0, 0, 0, 0]),

            //OMBER
            new OrePrice("Compressed Omber", 62532, [0, 0.9, 0, 0.75, 0, 0, 0, 0]),
            new OrePrice("Compressed Silvery Omber", 62533, [0, 0.95, 0, 0.79, 0, 0, 0, 0]),
            new OrePrice("Compressed Golden Omber", 62534, [0, 1, 0, 0.83, 0, 0, 0, 0]),

            //KERNITE
            new OrePrice("Compressed Kernite", 62536, [0, 0, 0.6, 1.2, 0, 0, 0, 0]),
            new OrePrice("Compressed Luminous Kernite", 62537, [0, 0, 0.63, 1.26, 0, 0, 0, 0]),
            new OrePrice("Compressed Fiery Kernite", 62538, [0, 0, 0.66, 1.32, 0, 0, 0, 0]),

            //JASPET
            new OrePrice("Compressed Jaspet", 62540, [0, 0, 1.5, 0, 0.5, 0, 0, 0]),
            new OrePrice("Compressed Pure Jaspet", 62541, [0, 0, 1.58, 0, 0.53, 0, 0, 0]),
            new OrePrice("Compressed Pristine Jaspet", 62542, [0, 0, 1.65, 0, 0.55, 0, 0, 0]),

            //HEMORPHITE
            new OrePrice("Compressed Hemorphite", 62544, [0, 0, 0, 2.4, 0.9, 0, 0, 0]),
            new OrePrice("Compressed Vivid Hemorphite", 62545, [0, 0, 0, 2.52, 0.95, 0, 0, 0]),
            new OrePrice("Compressed Radiant Hemorphite", 62546, [0, 0, 0, 2.64, 1, 0, 0, 0]),

            //HEDBERGITE
            new OrePrice("Compressed Hedbergite", 62548, [0, 4.5, 0, 0, 1.2, 0, 0, 0]),
            new OrePrice("Compressed Vitric Hedbergite", 62549, [0, 4.73, 0, 0, 1.26, 0, 0, 0]),
            new OrePrice("Compressed Glazed Hedbergite", 62550, [0, 4.95, 0, 0, 1.32, 0, 0, 0]),

            //GNEISS
            new OrePrice("Compressed Gneiss", 62552, [0, 20, 15, 8, 0, 0, 0, 0]),
            new OrePrice("Compressed Iridescent Gneiss", 62553, [0, 21, 15.75, 8.4, 0, 0, 0, 0]),
            new OrePrice("Compressed Prismatic Gneiss", 62554, [0, 22, 16.5, 8.8, 0, 0, 0, 0]),

            //DARK OCHRE
            new OrePrice("Compressed Dark Ochre", 62556, [0, 0, 13.6, 12, 3.2, 0, 0, 0]),
            new OrePrice("Compressed Onyx Ochre", 62557, [0, 0, 14.28, 12.6, 3.36, 0, 0, 0]),
            new OrePrice("Compressed Obsidian Ochre", 62558, [0, 0, 15, 13.2, 3.52, 0, 0, 0]),

            //CROKITE
            new OrePrice("Compressed Crokite", 62560, [0, 8, 20, 0, 8, 0, 0, 0]),
            new OrePrice("Compressed Sharp Crokite", 62561, [0, 8.4, 21, 0, 8.4, 0, 0, 0]),
            new OrePrice("Compressed Crystalline Crokite", 62562, [0, 8.8, 22, 0, 8.8, 0, 0, 0]),

            //SPODUMAIN
            new OrePrice("Compressed Spodumain", 62572, [480, 0, 0, 10, 1.6, 0.8, 0.4, 0]),
            new OrePrice("Compressed Bright Spodumain", 62573, [504, 0, 0, 10.5, 1.68, 0.84, 0.42, 0]),
            new OrePrice("Compressed Gleaming Spodumain", 62574, [528, 0, 0, 10.1, 1.76, 0.88, 0.44, 0]),

            //BISTOT
            new OrePrice("Compressed Bistot", 62564, [0, 32, 12, 0, 0, 1.6, 0, 0]),
            new OrePrice("Compressed Triclinic Bistot", 62565, [0, 33.6, 12.6, 0, 0, 1.68, 0, 0]),
            new OrePrice("Compressed Monoclinic Bistot", 62566, [0, 35.2, 12.8, 0, 0,  1.76, 0, 0]),

            //ARKONOR
            new OrePrice("Compressed Arkonor", 62568, [0, 32, 12, 0, 0 ,0, 1.2, 0]),
            new OrePrice("Compressed Crimson Arkonor", 62569, [0, 33.6, 12.6, 0, 0, 0, 1.26, 0]),
            new OrePrice("Compressed Prime Arkonor", 62570, [0, 35.2, 12.8, 0, 0,  0, 1.32, 0]),//,
            
            //MERCOXIT
            new OrePrice("Mercoxit", 11396, [0, 0, 0, 0, 0, 0, 0, 1.4]),

            //BEZDNACINE
            new OrePrice("Compressed Bezdnacine", 62576, [400, 0, 0, 48, 0, 0, 1.28, 0]),
            new OrePrice("Compressed Abyssal Bezdnacine", 62577, [420, 0, 0, 50, 0, 0, 1.34, 0]),
            new OrePrice("Compressed Hadal Bezdnacine", 62578, [440, 0, 0, 52, 0, 0, 1.4, 0])
            //new OrePrice("Talassonite", 52306, [200, 0, 0, 0, 4.8, 0, 0.16, 0]),
        //     new OrePrice("Rakovene", 52315, [200, 0, 0, 16, 0, 1, 0, 0]),
        ];
    }

    fetchOreData = (path) => {
        const oreFetches = [];
        this.staticOreData.forEach(async ore => {

            oreFetches.push(ore.updateOrePrice());
        });
        Promise.all(oreFetches)
            .then(() => {
                this.writeOreData(path);
            });
    }

    writeOreData = (path) => {
        const fsData = { table: [] }; // const internal members are mutable/assignable

        this.staticOreData.forEach(ore => {
            fsData.table.push(ore.getData());
        });
        console.log(fsData);
        fs.writeFileSync(path, JSON.stringify(fsData), 'utf-8', (error) => {
            if (error) throw error;
            console.log("Write to JSON completed! :D");
        });
    }

}

const debug = () => {

    const hannoFetch = new FetchPriceData();
    hannoFetch.fetchOreData('hanno.json');
}

debug();